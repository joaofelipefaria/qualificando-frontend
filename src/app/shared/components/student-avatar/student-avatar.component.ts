import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

/**
 * Photo placeholder for a student/talento.
 *
 * The Student model has an optional `photoUrl` reserved for when profile
 * photo upload exists on the backend; until then (and whenever it's empty)
 * this renders a colored initials circle instead, so every list/detail
 * screen has a consistent "photo" slot ready for the real thing.
 */
@Component({
  selector: 'app-student-avatar',
  standalone: true,
  imports: [NgIf],
  template: `
    <img *ngIf="photoUrl; else placeholder" [src]="photoUrl" [alt]="name" class="avatar avatar-photo" [style.width.px]="size" [style.height.px]="size">
    <ng-template #placeholder>
      <div class="avatar avatar-placeholder" [style.width.px]="size" [style.height.px]="size" [style.background]="color" [style.fontSize.px]="size / 2.4">
        {{ initials }}
      </div>
    </ng-template>
  `,
  styles: [`
    .avatar {
      border-radius: 50%;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .avatar-photo {
      object-fit: cover;
    }
    .avatar-placeholder {
      color: #fff;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
  `]
})
export class StudentAvatarComponent {
  @Input() name = '';
  @Input() photoUrl?: string;
  @Input() size = 40;
  /** Used to pick a deterministic placeholder color when no photo exists. */
  @Input() seed = 0;

  private static readonly PALETTE = ['#1a73e8', '#1e8e3e', '#e37400', '#8430ce', '#d93025', '#12736c'];

  get initials(): string {
    const parts = this.name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    const first = parts[0][0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
    return (first + last).toUpperCase();
  }

  get color(): string {
    const palette = StudentAvatarComponent.PALETTE;
    return palette[Math.abs(this.seed) % palette.length];
  }
}
