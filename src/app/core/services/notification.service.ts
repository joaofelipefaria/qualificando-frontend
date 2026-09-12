import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  private get closeLabel(): string {
    // Defensive: translate.instant() can be momentarily unavailable (e.g.
    // the translations file hasn't finished loading yet on a very fast
    // first action), which must never block showing the actual message.
    try {
      return this.translate.instant('common.close') || 'Fechar';
    } catch {
      return 'Fechar';
    }
  }

  success(message: string): void {
    this.snackBar.open(message, this.closeLabel, { duration: 3000, panelClass: 'snackbar-success' });
  }

  error(message: string): void {
    this.snackBar.open(message, this.closeLabel, { duration: 5000, panelClass: 'snackbar-error' });
  }

  info(message: string): void {
    this.snackBar.open(message, this.closeLabel, { duration: 3000 });
  }
}
