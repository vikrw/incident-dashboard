import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Incident, IncidentStatus } from '../models/incident.model';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/incidents';

  /**
   * Fetches all incidents from json-server with an artificial RxJS delay.
   */
  getIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.apiUrl).pipe(
      delay(800) // Simulate network delay
    );
  }

  /**
   * Updates an incident's status via PATCH and returns the updated incident.
   */
  updateIncidentStatus(id: string, newStatus: IncidentStatus): Observable<Incident> {
    const patchData = {
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    return this.http.patch<Incident>(`${this.apiUrl}/${id}`, patchData).pipe(
      delay(600) // Simulate network delay
    );
  }
}
