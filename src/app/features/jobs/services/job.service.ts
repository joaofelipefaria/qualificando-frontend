import { Injectable, inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { Job, JobFormValue } from '../../../core/models/job.model';
import { Page } from '../../../core/models/page.model';
import { CurrentUserContextService } from '../../../core/services/current-user-context.service';
import { JobDataSource } from './job.datasource';

/**
 * Component-facing API for Job data. Delegates to `JobDataSource`, whose
 * concrete implementation is selected once in `app.config.ts` (currently
 * always `JobMockDataSource` - see that provider for details). Components
 * only ever depend on this Service, never on the DataSource or the mock
 * store directly.
 */
@Injectable({ providedIn: 'root' })
export class JobService {
  private dataSource = inject(JobDataSource);
  private currentUser = inject(CurrentUserContextService);

  /**
   * Non-admins only ever see jobs from their own community (see
   * `CurrentUserContextService`); admins see every community.
   */
  list(page = 0, size = 20, search = ''): Observable<Page<Job>> {
    return this.currentUser.getCommunityId().pipe(
      switchMap(communityId => this.dataSource.list(page, size, search, communityId))
    );
  }

  /**
   * Creates a new job, automatically scoped to the current user's community
   * (non-admins) or any community they pick a company from (admins).
   */
  create(value: JobFormValue): Observable<Job> {
    return this.currentUser.getCommunityId().pipe(
      switchMap(communityId => this.dataSource.create({ ...value, communityId }))
    );
  }

  update(id: number, value: JobFormValue): Observable<Job> {
    return this.currentUser.getCommunityId().pipe(
      switchMap(() => this.dataSource.update(id, value))
    );
  }
}
