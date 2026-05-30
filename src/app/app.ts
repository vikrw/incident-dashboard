import { Component, signal } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent, ToastContainerComponent],
  template: `
    <app-dashboard></app-dashboard>
    <app-toast-container></app-toast-container>
  `
})
export class App {
  protected readonly title = signal('incident-dashboard');
}
