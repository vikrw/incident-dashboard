import { TestBed } from '@angular/core/testing';
import { IncidentStore } from './incident.store';
import { IncidentService } from '../services/incident.service';
import { ToastService } from '../services/toast.service';
import { of, throwError } from 'rxjs';
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
      getIncidents: jest.fn().mockReturnValue(of(mockIncidents)),
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
    expect(store.isLoading()).toBe(false);
    expect(store.incidents()).toEqual(mockIncidents);
    expect(mockIncidentService.getIncidents).toHaveBeenCalled();
  });

  it('should initialize with default filters', () => {
    const store = TestBed.inject(IncidentStore);
    expect(store.filters().searchTerm).toBe('');
    expect(store.filters().status).toBe('');
  });

  it('should update filters and correctly filter incidents', () => {
    const store = TestBed.inject(IncidentStore);
    
    // Set status filter
    store.updateFilters({ status: 'Open' });
    
    // Check if the store correctly filtered
    expect(store.filteredIncidents().length).toBe(1);
    expect(store.filteredIncidents()[0].id).toBe('1');
  });

  it('should select an incident correctly', () => {
    const store = TestBed.inject(IncidentStore);

    store.selectIncident('2');
    expect(store.selectedIncidentId()).toBe('2');
    expect(store.selectedIncident()?.id).toBe('2');
  });

  it('should update incident status optimistically', () => {
    const store = TestBed.inject(IncidentStore);

    store.updateIncidentStatus({ id: '1', status: 'In Progress' });
    
    // Check if local state updated immediately (optimistic)
    expect(store.incidents().find(inc => inc.id === '1')?.status).toBe('In Progress');
    expect(mockIncidentService.updateIncidentStatus).toHaveBeenCalledWith('1', 'In Progress');
  });

  it('should revert incident status if server update fails', () => {
    // Override updateIncidentStatus to fail
    mockIncidentService.updateIncidentStatus.mockReturnValue(throwError(() => new Error('Server error')));
    
    const store = TestBed.inject(IncidentStore);

    store.updateIncidentStatus({ id: '1', status: 'In Progress' });

    // Verify it reverted to 'Open' due to mock failure
    expect(store.incidents().find(inc => inc.id === '1')?.status).toBe('Open');
    expect(store.error()).toBe('Failed to update incident status on server. Reverted changes.');
  });
});
