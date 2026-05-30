import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { IncidentFilter } from '../../models/incident-filter.model';
import { IncidentStatus, IncidentSeverity } from '../../models/incident.model';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filters.component.html'
})
export class FiltersComponent {
  filters = input.required<IncidentFilter>();
  filtersChange = output<Partial<IncidentFilter>>();

  readonly statuses: IncidentStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];
  readonly severities: IncidentSeverity[] = ['Critical', 'High', 'Medium', 'Low'];
  readonly services: string[] = ['Database API', 'Auth Service', 'Frontend', 'Payment Service', 'Worker Pool'];

  onFilterChange<K extends keyof IncidentFilter>(key: K, value: IncidentFilter[K]) {
    this.filtersChange.emit({ [key]: value });
  }
}
