import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [NgIf, MatProgressSpinnerModule],
  template: `
    <div class="loading-wrapper">
      <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
      <p *ngIf="message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px 24px;
      color: var(--mat-app-text-color, #5f6368);
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message = '';
}
