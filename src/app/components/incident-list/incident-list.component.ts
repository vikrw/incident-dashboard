import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Incident } from '../../models/incident.model';
import { SeverityClassPipe } from '../../pipes/severity-class.pipe';
import { StatusDotClassPipe } from '../../pipes/status-dot-class.pipe';

@Component({
  selector: 'app-incident-list',
  standalone: true,
  imports: [CommonModule, ScrollingModule, SeverityClassPipe, StatusDotClassPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './incident-list.component.html'
})
export class IncidentListComponent {
  trackById(index: number, item: Incident): string {
    return item.id;
  }
  incidents = input.required<Incident[]>();
  isLoading = input<boolean>(false);
  error = input<string | null>(null);
  selectedId = input<string | null>(null);

  selectIncident = output<string>();
  retry = output<void>();
  loadMore = output<void>();

  onScrollIndexChange(index: number) {
    const total = this.incidents().length;
    // Emit loadMore when the user has scrolled near the end of loaded incidents (e.g., within the last 15 items)
    if (total > 0 && index >= total - 15) {
      this.loadMore.emit();
    }
  }
}
