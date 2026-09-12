import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { CommunityService } from '../../services/community.service';
import { Community } from '../../../../core/models/community.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../../core/services/notification.service';

/**
 * Loaded once and filtered/paginated entirely in the browser (see
 * `applyFilter`) - the name search must never hit the (mocked) backend on
 * every keystroke. `Number.MAX_SAFE_INTEGER` isn't used on purpose: a
 * generous-but-finite page size keeps this a normal "list" call the mock/
 * real backend already supports, just asked for everything at once.
 */
const FETCH_ALL_SIZE = 1000;

@Component({
  selector: 'app-community-list',
  standalone: true,
  imports: [
    NgIf, DatePipe, RouterLink, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatChipsModule, MatMenuModule, MatDialogModule,
    LoadingSpinnerComponent, EmptyStateComponent, TranslateModule
  ],
  templateUrl: './community-list.component.html',
  styleUrl: './community-list.component.scss'
})
export class CommunityListComponent implements OnInit {
  private communityService = inject(CommunityService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  displayedColumns = ['name', 'description', 'status', 'createdAt', 'actions'];

  /** Full dataset fetched once; `communities` below is the filtered+paged slice actually rendered. */
  private allCommunities: Community[] = [];
  communities: Community[] = [];
  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;
  loading = true;

  searchControl = new FormControl('');

  ngOnInit(): void {
    this.fetch();

    // Client-side only: filters as the person types, no debounce needed
    // since nothing here goes to the backend.
    this.searchControl.valueChanges.subscribe(() => {
      this.pageIndex = 0;
      this.applyFilter();
    });
  }

  fetch(): void {
    this.loading = true;
    this.communityService.list(0, FETCH_ALL_SIZE, '')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: result => {
          this.allCommunities = result.content;
          this.pageIndex = 0;
          this.applyFilter();
        },
        error: () => {
          this.allCommunities = [];
          this.applyFilter();
        }
      });
  }

  private applyFilter(): void {
    const term = (this.searchControl.value ?? '').trim().toLowerCase();
    const filtered = !term
      ? this.allCommunities
      : this.allCommunities.filter(
          c => c.name.toLowerCase().includes(term) || (c.description ?? '').toLowerCase().includes(term)
        );

    this.totalElements = filtered.length;
    const start = this.pageIndex * this.pageSize;
    this.communities = filtered.slice(start, start + this.pageSize);
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyFilter();
  }

  confirmDelete(community: Community): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('communities.deleteDialog.title'),
        message: this.translate.instant('communities.deleteDialog.message', { name: community.name })
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        return;
      }
      this.communityService.delete(community.id).subscribe({
        next: () => {
          this.notification.success(this.translate.instant('communities.notifications.deleted'));
          this.fetch();
        }
      });
    });
  }
}
