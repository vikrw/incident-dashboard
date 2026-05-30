import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IncidentFilter } from '../../store/incident.store';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filters.component.html'
})
export class FiltersComponent {
  filters = input.required<IncidentFilter>();
  filtersChange = output<Partial<IncidentFilter>>();

  onFilterChange(key: keyof IncidentFilter, value: string) {
    this.filtersChange.emit({ [key]: value });
  }
}
