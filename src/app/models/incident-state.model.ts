import { Incident } from './incident.model';
import { IncidentFilter } from './incident-filter.model';

export interface IncidentState {
  incidents: Incident[];
  isLoading: boolean;
  error: string | null;
  filters: IncidentFilter;
  selectedIncidentId: string | null;
  page: number;
  hasMore: boolean;
}
