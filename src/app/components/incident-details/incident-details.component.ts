import { Component, ChangeDetectionStrategy, input, output, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Incident, IncidentStatus } from '../../models/incident.model';

@Component({
  selector: 'app-incident-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './incident-details.component.html'
})
export class IncidentDetailsComponent {
  incident = input<Incident | null>(null);
  
  updateStatus = output<{id: string, status: IncidentStatus}>();
  close = output<void>();

  draftStatus = signal<IncidentStatus | null>(null);

  constructor() {
    // Sync draft status when selected incident changes
    effect(() => {
      const current = this.incident();
      if (current) {
        this.draftStatus.set(current.status);
      }
    });
  }

  onSaveStatus() {
    const inc = this.incident();
    const newStatus = this.draftStatus();
    if (inc && newStatus && newStatus !== inc.status) {
      this.updateStatus.emit({ id: inc.id, status: newStatus });
    }
  }
}
