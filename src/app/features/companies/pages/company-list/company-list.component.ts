import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { CompanyService } from '../../services/company.service';
import { Company } from '../../../../core/models/company.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../../core/services/notification.service';

/** Loaded once and filtered entirely in the browser - see `applyFilter`. */
const FETCH_ALL_SIZE = 1000;

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [
    NgFor, NgIf, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatMenuModule, MatDialogModule, LoadingSpinnerComponent, EmptyStateComponent, TranslateModule
  ],
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.scss'
})
export class CompanyListComponent implements OnInit {
  private companyService = inject(CompanyService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  /** Full dataset fetched once; `companies` below is the filtered slice actually rendered. */
  private allCompanies: Company[] = [];
  companies: Company[] = [];
  loading = true;
  searchControl = new FormControl('');

  ngOnInit(): void {
    this.fetch();

    // Client-side only: filters as the person types, no debounce needed
    // since nothing here goes to the backend.
    this.searchControl.valueChanges.subscribe(() => this.applyFilter());
  }

  fetch(): void {
    this.loading = true;
    this.companyService.list(0, FETCH_ALL_SIZE, '')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: result => {
          this.allCompanies = result.content;
          this.applyFilter();
        },
        error: () => {
          this.allCompanies = [];
          this.applyFilter();
        }
      });
  }

  private applyFilter(): void {
    const term = (this.searchControl.value ?? '').trim().toLowerCase();
    this.companies = !term
      ? this.allCompanies
      : this.allCompanies.filter(
          c => c.name.toLowerCase().includes(term) || (c.description ?? '').toLowerCase().includes(term)
        );
  }

  goToNew(): void {
    this.router.navigate(['/companies/new']);
  }

  confirmDelete(company: Company, event: Event): void {
    event.stopPropagation();
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('companies.deleteDialog.title'),
        message: this.translate.instant('companies.deleteDialog.message', { name: company.name })
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.companyService.delete(company.id).subscribe({
        next: () => {
          this.notification.success(this.translate.instant('companies.notifications.deleted'));
          this.fetch();
        }
      });
    });
  }
}
