import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Incident } from '../../models/incident.model';

@Component({
  selector: 'app-incident-list',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './incident-list.component.html'
})
export class IncidentListComponent {
  incidents = input.required<Incident[]>();
  isLoading = input<boolean>(false);
  error = input<string | null>(null);
  selectedId = input<string | null>(null);

  selectIncident = output<string>();
  retry = output<void>();

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'Critical': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'High': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'Low': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  }

  getStatusDotClass(status: string): string {
    switch (status) {
      case 'Open': return 'bg-red-500';
      case 'In Progress': return 'bg-yellow-500 animate-pulse';
      case 'Resolved': return 'bg-green-500';
      case 'Closed': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  }
}
