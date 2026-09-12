import { Observable } from 'rxjs';
import { Company, CompanyFormValue } from '../../../core/models/company.model';
import { Page } from '../../../core/models/page.model';

/**
 * Contract for reading/writing Company data. Abstract class (not an
 * interface) so it can be used as an Angular DI token, same pattern as
 * `CourseContentGateway`.
 *
 * Two implementations exist:
 *  - `CompanyHttpDataSource`: real HTTP calls to quali-core-api.
 *  - `CompanyMockDataSource`: in-memory data via `MockStoreService`.
 *
 * Which one gets injected is decided once, in `app.config.ts`, based on
 * `environment.useMockApi`. `CompanyService` (and therefore every
 * component) only ever depends on this abstract class.
 */
export abstract class CompanyDataSource {
  abstract list(page: number, size: number, search: string, communityId?: number | null): Observable<Page<Company>>;
  abstract getById(id: number): Observable<Company>;
  abstract create(value: CompanyFormValue): Observable<Company>;
  abstract update(id: number, value: CompanyFormValue): Observable<Company>;
  abstract delete(id: number): Observable<void>;
}
