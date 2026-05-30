import { signalStore, withState, withComputed, withMethods, withHooks, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, inject } from '@angular/core';
import { pipe, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { Incident, IncidentStatus, IncidentSeverity } from '../models/incident.model';
import { IncidentService } from '../services/incident.service';
import { runOptimisticUpdate } from '../utils/optimistic.util';
import { ToastService } from '../services/toast.service';

export interface IncidentFilter {
  searchTerm: string;
  status: IncidentStatus | '';
  severity: IncidentSeverity | '';
  service: string | '';
}

export interface IncidentState {
  incidents: Incident[];
  isLoading: boolean;
  error: string | null;
  filters: IncidentFilter;
  selectedIncidentId: string | null;
}

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
  selectedIncidentId: null
};

export const IncidentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    // Derived selector for filtering incidents
    filteredIncidents: computed(() => {
      const allIncidents = store.incidents();
      const currentFilters = store.filters();

      return allIncidents.filter((incident) => {
        const matchesSearch = currentFilters.searchTerm
          ? incident.title.toLowerCase().includes(currentFilters.searchTerm.toLowerCase()) ||
            incident.id.toLowerCase().includes(currentFilters.searchTerm.toLowerCase())
          : true;
        const matchesStatus = currentFilters.status ? incident.status === currentFilters.status : true;
        const matchesSeverity = currentFilters.severity ? incident.severity === currentFilters.severity : true;
        const matchesService = currentFilters.service ? incident.service === currentFilters.service : true;

        return matchesSearch && matchesStatus && matchesSeverity && matchesService;
      });
    }),
    // Derived selector for currently selected incident details
    selectedIncident: computed(() => {
      const id = store.selectedIncidentId();
      if (!id) return null;
      return store.incidents().find((inc) => inc.id === id) || null;
    })
  })),
  withMethods((store, incidentService = inject(IncidentService), toastService = inject(ToastService)) => ({
    // Update local filters
    updateFilters(newFilters: Partial<IncidentFilter>) {
      patchState(store, (state) => ({
        filters: { ...state.filters, ...newFilters }
      }));
    },

    // Set selected incident id
    selectIncident(id: string | null) {
      patchState(store, { selectedIncidentId: id });
    },

    // Reactive method to load incidents from mock API
    loadIncidents: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          incidentService.getIncidents().pipe(
            tap((incidents) => {
              patchState(store, { incidents, isLoading: false });
            }),
            catchError((err) => {
              console.error('Failed to load incidents', err);
              patchState(store, {
                error: 'Failed to fetch incidents. Please check your backend connection.',
                isLoading: false
              });
              toastService.error('Failed to load incidents. Check your database connection.');
              return of([]);
            })
          )
        )
      )
    ),

    // Reactive method to update status (optimistic update with fallback)
    updateIncidentStatus: rxMethod<{ id: string; status: IncidentStatus }>(
      pipe(
        switchMap(({ id, status }) => {
          const updatedIncidents = store.incidents().map((inc) =>
            inc.id === id ? { ...inc, status, updatedAt: new Date().toISOString() } : inc
          );

          return runOptimisticUpdate(
            store,
            'incidents',
            updatedIncidents,
            incidentService.updateIncidentStatus(id, status),
            (err) => {
              console.error('Failed to update incident status on server, reverting state', err);
              patchState(store, {
                error: 'Failed to update incident status on server. Reverted changes.'
              });
              toastService.error(`Failed to update ${id} status on server. Reverted.`);
            }
          ).pipe(
            tap((result) => {
              if (result) {
                toastService.success(`Incident ${id} status updated to "${status}"`);
              }
            })
          );
        })
      )
    )
  })),
  withHooks({
    onInit(store) {
      // Auto-load incidents on store instantiation
      store.loadIncidents();
    }
  })
);
