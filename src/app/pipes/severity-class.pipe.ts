import { Pipe, PipeTransform } from '@angular/core';
import { IncidentSeverity } from '../models/incident.model';

@Pipe({
  name: 'severityClass',
  standalone: true,
  pure: true
})
export class SeverityClassPipe implements PipeTransform {
  transform(severity: IncidentSeverity | string): string {
    switch (severity) {
      case 'Critical': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'High': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'Low': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  }
}
