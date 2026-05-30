import { patchState } from '@ngrx/signals';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Reusable utility to perform optimistic updates with automatic rollback.
 * 
 * @param store - The NgRx SignalStore instance (e.g. `store`)
 * @param stateKey - The key of the state slice to modify (e.g. 'incidents')
 * @param optimisticValue - The temporarily updated value for that state slice
 * @param apiCall$ - The actual backend Observable API request
 * @param onError - Optional callback to handle errors (e.g. setting error flags)
 */
export function runOptimisticUpdate<T>(
  store: any,
  stateKey: string,
  optimisticValue: any,
  apiCall$: Observable<T>,
  onError?: (error: any) => void
): Observable<T | null> {
  // 1. Capture current state of this slice for rollback
  const previousValue = store[stateKey]();

  // 2. Apply optimistic patch to local state immediately
  patchState(store, { [stateKey]: optimisticValue } as any);

  // 3. Execute the API call
  return apiCall$.pipe(
    catchError((err) => {
      // 4. Rollback on error
      patchState(store, { [stateKey]: previousValue } as any);
      
      if (onError) {
        onError(err);
      }
      
      return of(null);
    })
  );
}
