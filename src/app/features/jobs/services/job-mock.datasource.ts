import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Job, JobFormValue } from '../../../core/models/job.model';
import { Page } from '../../../core/models/page.model';
import { MockStoreService } from '../../../core/mock/mock-store.service';
import { JobDataSource } from './job.datasource';

/**
 * TEMPORARY MOCK implementation of `JobDataSource`, backed by the
 * centralized `MockStoreService`. No HTTP call happens here.
 */
@Injectable({ providedIn: 'root' })
export class JobMockDataSource extends JobDataSource {
  private store = inject(MockStoreService);

  list(page: number, size: number, search: string, communityId?: number | null): Observable<Page<Job>> {
    return this.store.listJobs(page, size, search, communityId);
  }

  create(value: JobFormValue): Observable<Job> {
    return this.store.createJob(value);
  }

  update(id: number, value: JobFormValue): Observable<Job> {
    return this.store.updateJob(id, value);
  }
}
