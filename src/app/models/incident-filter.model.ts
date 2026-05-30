import { IncidentStatus, IncidentSeverity } from './incident.model';

export interface IncidentFilter {
  searchTerm: string;
  status: IncidentStatus | '';
  severity: IncidentSeverity | '';
  service: string | '';
}
