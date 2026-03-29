import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new BehaviorSubject<ToastState>({
    show: false,
    message: '',
    type: 'info'
  });

  toast$ = this.toastSubject.asObservable();
  private timer: any;

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    clearTimeout(this.timer);
    this.toastSubject.next({ show: true, message, type });

    this.timer = setTimeout(() => {
      this.clear();
    }, 3000);
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  clear() {
    this.toastSubject.next({ show: false, message: '', type: 'info' });
  }
}
