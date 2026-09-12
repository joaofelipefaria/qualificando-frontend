import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [NgIf, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon }}</mat-icon>
      <h3>{{ title }}</h3>
      <p>{{ subtitle }}</p>
      <button *ngIf="actionLabel" mat-flat-button color="primary" (click)="action.emit()">
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 56px 24px;
      color: #5f6368;
    }
    .empty-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; opacity: .6; }
    h3 { margin: 0 0 4px; font-weight: 500; }
    p { margin: 0 0 16px; }
  `]
})
export class EmptyStateComponent {
  private translate = inject(TranslateService);

  @Input() icon = 'inbox';
  @Input() title = this.translate.instant('emptyState.defaultTitle');
  @Input() subtitle = '';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}
