import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsState = signal<Toast[]>([]);
  readonly toasts = this.toastsState.asReadonly();
  private nextId = 0;

  /**
   * Shows a toast notification.
   */
  show(message: string, type: ToastType = 'info', duration = 3500) {
    const id = this.nextId++;
    const newToast: Toast = { id, message, type };

    // Update toasts list signal
    this.toastsState.update((toasts) => [...toasts, newToast]);

    // Auto dismiss
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string, duration = 3500) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 4500) {
    this.show(message, 'error', duration);
  }

  remove(id: number) {
    this.toastsState.update((toasts) => toasts.filter((t) => t.id !== id));
  }
}
