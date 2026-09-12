import { Observable } from 'rxjs';
import { Job, JobFormValue } from '../../../core/models/job.model';
import { Page } from '../../../core/models/page.model';

/**
 * Contract for reading Job data. Abstract class (not an interface) so it
 * can be used as an Angular DI token, same pattern as `CompanyDataSource`.
 *
 * Read-only for now: this feature only lists jobs (see the ticket that
 * introduced it) - no editing, deletion, or student application flow yet.
 * Creation is supported via `create`. Extend this contract further when
 * editing/deletion land.
 *
 * Today the only implementation is `JobMockDataSource`, backed by
 * `MockStoreService`. Once quali-core-api exposes real job endpoints,
 * create a `JobHttpDataSource` implementing this same class and switch the
 * provider in `app.config.ts` - no component needs to change, since they
 * only ever depend on `JobService`, which only ever depends on this class.
 */
export abstract class JobDataSource {
  abstract list(page: number, size: number, search: string, communityId?: number | null): Observable<Page<Job>>;
  abstract create(value: JobFormValue): Observable<Job>;
  abstract update(id: number, value: JobFormValue): Observable<Job>;
}
