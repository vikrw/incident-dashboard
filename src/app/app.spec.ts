import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { IncidentService } from './services/incident.service';
import { ToastService } from './services/toast.service';
import { of } from 'rxjs';

describe('App', () => {
  let mockIncidentService: any;
  let mockToastService: any;

  beforeEach(async () => {
    mockIncidentService = {
      getIncidents: jest.fn().mockReturnValue(of([])),
      updateIncidentStatus: jest.fn().mockReturnValue(of({}))
    };

    mockToastService = {
      success: jest.fn(),
      error: jest.fn(),
      show: jest.fn(),
      remove: jest.fn(),
      toasts: () => []
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: IncidentService, useValue: mockIncidentService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
