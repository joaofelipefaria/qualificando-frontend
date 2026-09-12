import { Observable } from 'rxjs';
import { Community, CommunityFormValue } from '../../../core/models/community.model';
import { Page } from '../../../core/models/page.model';

/**
 * Contract for reading/writing Community data. Abstract class (not an
 * interface) so it can be used as an Angular DI token, same pattern as
 * `CourseContentGateway`.
 *
 * Two implementations exist:
 *  - `CommunityHttpDataSource`: real HTTP calls to quali-core-api.
 *  - `CommunityMockDataSource`: in-memory data via `MockStoreService`.
 *
 * Which one gets injected is decided once, in `app.config.ts`, based on
 * `environment.useMockApi`. `CommunityService` (and therefore every
 * component) only ever depends on this abstract class.
 */
export abstract class CommunityDataSource {
  abstract list(page: number, size: number, search: string): Observable<Page<Community>>;
  abstract getById(id: number): Observable<Community>;
  abstract create(value: CommunityFormValue): Observable<Community>;
  abstract update(id: number, value: CommunityFormValue): Observable<Community>;
  abstract delete(id: number): Observable<void>;
}
