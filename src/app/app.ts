import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent, ToastContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dashboard></app-dashboard>
    <app-toast-container></app-toast-container>
  `
})
export class App {}

