import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Incident, IncidentStatus } from '../models/incident.model';
import { IncidentFilter } from '../models/incident-filter.model';
import { PaginatedResponse } from '../models/paginated-response.model';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/incidents';

  /**
   * Fetches paginated and filtered incidents from json-server with an artificial RxJS delay.
   */
  getIncidents(filters: IncidentFilter, page: number, limit = 50): Observable<PaginatedResponse<Incident>> {
    let params = new HttpParams()
      .set('_page', page.toString())
      .set('_per_page', limit.toString());

    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.severity) {
      params = params.set('severity', filters.severity);
    }
    if (filters.service) {
      params = params.set('service', filters.service);
    }
    if (filters.searchTerm) {
      const searchObj = {
        or: [
          { title: { contains: filters.searchTerm } },
          { id: { contains: filters.searchTerm } }
        ]
      };
      params = params.set('_where', JSON.stringify(searchObj));
    }

    return this.http.get<PaginatedResponse<Incident>>(this.apiUrl, { params }).pipe(
      delay(600) // Simulate network delay
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
