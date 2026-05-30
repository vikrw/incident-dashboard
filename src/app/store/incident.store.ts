import { signalStore, withState, withComputed, withMethods, withHooks, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { pipe, of } from 'rxjs';
import { switchMap, concatMap, tap, catchError, debounceTime, filter } from 'rxjs/operators';
import { Incident, IncidentStatus } from '../models/incident.model';
import { IncidentFilter } from '../models/incident-filter.model';
import { IncidentState } from '../models/incident-state.model';
import { IncidentService } from '../services/incident.service';
import { ToastService } from '../services/toast.service';

const initialState: IncidentState = {
  incidents: [],
  isLoading: false,
  error: null,
  filters: {
    searchTerm: '',
    status: '',
    severity: '',
    service: ''
  },
  selectedIncidentId: null,
  page: 1,
  hasMore: true
};

export const IncidentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    // Debounce only the search term signal to optimize rendering performance
    const debouncedSearchTerm = toSignal(
      toObservable(computed(() => store.filters().searchTerm)).pipe(debounceTime(300)),
      { initialValue: '' }
    );

    return {
      activeFilters: computed(() => ({
        ...store.filters(),
        searchTerm: debouncedSearchTerm()
      })),
      // Derived selector for filtering incidents (handled on server side now)
      filteredIncidents: computed(() => store.incidents()),
      // Derived selector for currently selected incident details
      selectedIncident: computed(() => {
        const id = store.selectedIncidentId();
        if (!id) return null;
        return store.incidents().find((inc) => inc.id === id) || null;
      })
    };
  }),
  withMethods((store) => {
    const incidentService = inject(IncidentService);
    const toastService = inject(ToastService);

    return {
      // Update local filters
      updateFilters(newFilters: Partial<IncidentFilter>) {
        patchState(store, (state) => ({
          filters: { ...state.filters, ...newFilters },
          selectedIncidentId: null
        }));
      },

      // Set selected incident id
      selectIncident(id: string | null) {
        patchState(store, { selectedIncidentId: id });
      },

      // Manual reload wrapper
      loadIncidents() {
        this.loadOnFiltersChange(store.activeFilters());
      },

      // Load next page for infinite scrolling
      loadNextPage: rxMethod<void>(
        pipe(
          filter(() => !store.isLoading() && store.hasMore()),
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() => {
            const nextPage = store.page() + 1;
            return incidentService.getIncidents(store.activeFilters(), nextPage, 50).pipe(
              tap((response) => {
                patchState(store, (state) => ({
                  incidents: [...state.incidents, ...response.data],
                  page: nextPage,
                  isLoading: false,
                  hasMore: response.next !== null
                }));
              }),
              catchError((err) => {
                console.error('Failed to load next page', err);
                patchState(store, {
                  error: 'Failed to load next page.',
                  isLoading: false
                });
                toastService.error('Failed to load next page.');
                return of({ data: [], next: null } as any);
              })
            );
          })
        )
      ),

      // Reactive method to load incidents from mock API based on filters
      loadOnFiltersChange: rxMethod<IncidentFilter>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((filters) =>
            incidentService.getIncidents(filters, 1, 50).pipe(
              tap((response) => {
                patchState(store, {
                  incidents: response.data,
                  isLoading: false,
                  page: 1,
                  hasMore: response.next !== null
                });
              }),
              catchError((err) => {
                console.error('Failed to load incidents', err);
                patchState(store, {
                  error: 'Failed to fetch incidents. Please check your backend connection.',
                  isLoading: false
                });
                toastService.error('Failed to load incidents. Check your database connection.');
                return of({ data: [], next: null });
              })
            )
          )
        )
      ),

      // Reactive method to update status (optimistic update with fallback)
      updateIncidentStatus: rxMethod<{ id: string; status: IncidentStatus }>(
        pipe(
          tap(() => patchState(store, { error: null })),
          concatMap(({ id, status }) => {
            // 1. Capture the original state of the target incident to roll back specifically if needed
            const originalIncident = store.incidents().find(inc => inc.id === id);

            // 2. Apply optimistic patch locally immediately
            const updatedIncidents = store.incidents().map((inc) =>
              inc.id === id ? { ...inc, status, updatedAt: new Date().toISOString() } : inc
            );
            patchState(store, { incidents: updatedIncidents });

            // 3. Execute the API request
            return incidentService.updateIncidentStatus(id, status).pipe(
              tap(() => {
                toastService.success(`Incident ${id} status updated to "${status}"`);
              }),
              catchError((err) => {
                console.error('Failed to update incident status on server, reverting state', err);
                
                // Rollback ONLY this specific incident status instead of replacing the entire store.incidents array
                if (originalIncident) {
                  patchState(store, (state) => ({
                    incidents: state.incidents.map((inc) => inc.id === id ? originalIncident : inc),
                    error: 'Failed to update incident status on server. Reverted changes.'
                  }));
                }

                toastService.error(`Failed to update ${id} status on server. Reverted.`);
                return of(null);
              })
            );
          })
        )
      )
    };
  }),
  withHooks({
    onInit(store) {
      // Automatically react to active filter changes
      store.loadOnFiltersChange(store.activeFilters);
    }
  })
);
