import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-wrap" *ngIf="toastService.toast$ | async as toast">
      <div *ngIf="toast.show" class="app-toast" [ngClass]="toast.type">
        <span>{{ toast.message }}</span>
        <button type="button" class="toast-close" (click)="toastService.clear()">×</button>
      </div>
    </div>
  `
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
