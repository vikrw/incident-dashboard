import { Pipe, PipeTransform } from '@angular/core';
import { IncidentStatus } from '../models/incident.model';

@Pipe({
  name: 'statusDotClass',
  standalone: true,
  pure: true
})
export class StatusDotClassPipe implements PipeTransform {
  transform(status: IncidentStatus | string): string {
    switch (status) {
      case 'Open': return 'bg-red-500';
      case 'In Progress': return 'bg-yellow-500 animate-pulse';
      case 'Resolved': return 'bg-green-500';
      case 'Closed': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  }
}
