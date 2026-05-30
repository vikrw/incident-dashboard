import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentStore, IncidentFilter } from '../store/incident.store';
import { FiltersComponent } from '../components/filters/filters.component';
import { IncidentListComponent } from '../components/incident-list/incident-list.component';
import { IncidentDetailsComponent } from '../components/incident-details/incident-details.component';
import { IncidentStatus } from '../models/incident.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FiltersComponent, IncidentListComponent, IncidentDetailsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  // Inject the NgRx SignalStore
  store = inject(IncidentStore);

  onFiltersChange(newFilters: Partial<IncidentFilter>) {
    this.store.updateFilters(newFilters);
  }

  onSelectIncident(id: string | null) {
    this.store.selectIncident(id);
  }

  onUpdateStatus(id: string, newStatus: IncidentStatus) {
    this.store.updateIncidentStatus({ id, status: newStatus });
  }
}
