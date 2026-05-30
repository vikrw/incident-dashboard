import { TestBed } from '@angular/core/testing';
import { IncidentStore } from './incident.store';
import { IncidentService } from '../services/incident.service';
import { ToastService } from '../services/toast.service';
import { of, throwError, Subject } from 'rxjs';
import { Incident } from '../models/incident.model';

describe('IncidentStore', () => {
  let mockIncidentService: jest.Mocked<Partial<IncidentService>>;
  let mockToastService: any;
  const mockIncidents: Incident[] = [
    { id: '1', title: 'Test 1', description: 'Desc 1', status: 'Open', severity: 'Critical', service: 'Auth', createdAt: '', updatedAt: '' },
    { id: '2', title: 'Test 2', description: 'Desc 2', status: 'Resolved', severity: 'Low', service: 'DB', createdAt: '', updatedAt: '' }
  ];

  beforeEach(() => {
    mockIncidentService = {
      getIncidents: jest.fn().mockImplementation((filters, page) => {
        const data = mockIncidents.filter(inc => {
          const matchesStatus = filters && filters.status ? inc.status === filters.status : true;
          return matchesStatus;
        });
        return of({ data, next: null });
      }),
      updateIncidentStatus: jest.fn().mockImplementation((id, status) => 
        of({ id, title: 'Updated', description: '', status, severity: 'Low', service: '', createdAt: '', updatedAt: '' } as Incident)
      )
    };

    mockToastService = {
      success: jest.fn(),
      error: jest.fn(),
      show: jest.fn(),
      remove: jest.fn(),
      toasts: () => []
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: IncidentService, useValue: mockIncidentService },
        { provide: ToastService, useValue: mockToastService }
      ]
    });
  });

  it('should initialize and load incidents automatically on init', () => {
    const store = TestBed.inject(IncidentStore);
    TestBed.flushEffects();
    expect(store.isLoading()).toBe(false);
    expect(store.incidents()).toEqual(mockIncidents);
    expect(mockIncidentService.getIncidents).toHaveBeenCalled();
  });

  it('should initialize with default filters', () => {
    const store = TestBed.inject(IncidentStore);
    TestBed.flushEffects();
    expect(store.filters().searchTerm).toBe('');
    expect(store.filters().status).toBe('');
  });

  it('should update filters and correctly filter incidents', () => {
    const store = TestBed.inject(IncidentStore);
    TestBed.flushEffects();
    
    // Set status filter
    store.updateFilters({ status: 'Open' });
    TestBed.flushEffects();
    
    // Check if the store correctly filtered
    expect(store.filteredIncidents().length).toBe(1);
    expect(store.filteredIncidents()[0].id).toBe('1');
  });

  it('should select an incident correctly', () => {
    const store = TestBed.inject(IncidentStore);
    TestBed.flushEffects();

    store.selectIncident('2');
    expect(store.selectedIncidentId()).toBe('2');
    expect(store.selectedIncident()?.id).toBe('2');
  });

  it('should update incident status optimistically', () => {
    const store = TestBed.inject(IncidentStore);
    TestBed.flushEffects();

    store.updateIncidentStatus({ id: '1', status: 'In Progress' });
    
    // Check if local state updated immediately (optimistic)
    expect(store.incidents().find(inc => inc.id === '1')?.status).toBe('In Progress');
    expect(mockIncidentService.updateIncidentStatus).toHaveBeenCalledWith('1', 'In Progress');
  });

  it('should revert incident status if server update fails', () => {
    // Override updateIncidentStatus to fail
    mockIncidentService.updateIncidentStatus.mockReturnValue(throwError(() => new Error('Server error')));
    
    const store = TestBed.inject(IncidentStore);
    TestBed.flushEffects();

    store.updateIncidentStatus({ id: '1', status: 'In Progress' });

    // Verify it reverted to 'Open' due to mock failure
    expect(store.incidents().find(inc => inc.id === '1')?.status).toBe('Open');
    expect(store.error()).toBe('Failed to update incident status on server. Reverted changes.');
  });

  it('should NOT overwrite new filtered incidents when a pending update fails', () => {
    // 1. Setup service status update to return a Subject (allowing us to simulate network latency/delay)
    const statusUpdateSubject = new Subject<Incident>();
    mockIncidentService.updateIncidentStatus.mockReturnValue(statusUpdateSubject.asObservable());

    const store = TestBed.inject(IncidentStore);
    TestBed.flushEffects();

    // 2. Trigger status update for incident '1' (optimistic update is applied immediately while request is pending)
    store.updateIncidentStatus({ id: '1', status: 'In Progress' });
    expect(store.incidents().find(inc => inc.id === '1')?.status).toBe('In Progress');

    // 3. Immediately simulate a concurrent filter change by updating filters.
    // In our mockImplementation, we filter by status. Let's filter for status 'Resolved'.
    store.updateFilters({ status: 'Resolved' });
    TestBed.flushEffects();

    // Check that memory incidents array now only has incident '2'
    expect(store.incidents().length).toBe(1);
    expect(store.incidents()[0].id).toBe('2');

    // 4. Now trigger the API failure (error out the subject)
    statusUpdateSubject.error(new Error('Server error'));
    TestBed.flushEffects();

    // Assert that the list incidents is NOT corrupted and still has only incident '2' (stale rollback prevented)
    expect(store.incidents().length).toBe(1);
    expect(store.incidents()[0].id).toBe('2');
    expect(store.incidents().find(inc => inc.id === '1')).toBeUndefined();
    expect(store.error()).toBe('Failed to update incident status on server. Reverted changes.');
  });

  it('should load next page and append incidents successfully', () => {
    const page2Incidents = [
      { id: '3', title: 'Test 3', description: 'Desc 3', status: 'Open', severity: 'High', service: 'Frontend', createdAt: '', updatedAt: '' } as Incident
    ];
    
    mockIncidentService.getIncidents.mockImplementation((filters, page) => {
      if (page === 2) {
        return of({ data: page2Incidents, next: null });
      }
      return of({ data: mockIncidents, next: 2 });
    });

    const store = TestBed.inject(IncidentStore);
    TestBed.flushEffects();

    expect(store.incidents()).toEqual(mockIncidents);
    expect(store.page()).toBe(1);
    expect(store.hasMore()).toBe(true);

    // Trigger loadNextPage
    store.loadNextPage();
    TestBed.flushEffects();

    // Verify incidents are appended and state is updated
    expect(store.incidents()).toEqual([...mockIncidents, ...page2Incidents]);
    expect(store.page()).toBe(2);
    expect(store.hasMore()).toBe(false);
  });
});
