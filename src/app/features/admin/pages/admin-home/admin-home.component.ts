import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { PlatformUserService } from '../../../../core/services/platform-user.service';
import { PlatformUser } from '../../../../core/models/platform-user.model';
import { AppRole } from '../../../../core/models/role.model';
import { CommunityService } from '../../../communities/services/community.service';
import { Community } from '../../../../core/models/community.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { CommunityListComponent } from '../../../communities/pages/community-list/community-list.component';
import { CourseListComponent } from '../../../courses/pages/course-list/course-list.component';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [
    NgFor, NgIf, RouterLink, ReactiveFormsModule,
    MatCardModule, MatTabsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatTableModule,
    LoadingSpinnerComponent, EmptyStateComponent, CommunityListComponent, CourseListComponent, TranslateModule
  ],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss'
})
export class AdminHomeComponent implements OnInit {
  private platformUserService = inject(PlatformUserService);
  private communityService = inject(CommunityService);
  private translate = inject(TranslateService);

  displayedColumns = ['fullName', 'email', 'role', 'community', 'actions'];
  users: PlatformUser[] = [];
  loading = true;

  /** Keyed by id - used to render each user's community name in the table. */
  private communitiesById = new Map<number, Community>();

  /** Single field, searches both name and email - see MockStoreService.listUsers. */
  searchControl = new FormControl('');
  private lastSearch = '';

  ngOnInit(): void {
    this.communityService.list(0, 100).subscribe(page => {
      this.communitiesById = new Map(page.content.map(c => [c.id, c]));
    });
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.lastSearch = this.searchControl.value ?? '';
    this.platformUserService.list(this.lastSearch)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: users => (this.users = users),
        error: () => (this.users = [])
      });
  }

  get isSearchActive(): boolean {
    return !!this.lastSearch;
  }

  roleLabel(role: AppRole): string {
    return this.translate.instant('admin.roles.' + role);
  }

  communityLabel(user: PlatformUser): string {
    if (user.role === AppRole.ADMIN) {
      return this.translate.instant('admin.users.communityAll');
    }
    if (user.communityId == null) {
      return this.translate.instant('common.dash');
    }
    return this.communitiesById.get(user.communityId)?.name ?? this.translate.instant('common.dash');
  }
}
