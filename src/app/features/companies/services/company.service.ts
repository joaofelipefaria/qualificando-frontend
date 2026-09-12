import { Injectable, inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { Company, CompanyFormValue } from '../../../core/models/company.model';
import { Page } from '../../../core/models/page.model';
import { CurrentUserContextService } from '../../../core/services/current-user-context.service';
import { CompanyDataSource } from './company.datasource';

/**
 * Component-facing API for Company data. Delegates to `CompanyDataSource`,
 * whose concrete implementation (mock or real HTTP) is selected once in
 * `app.config.ts` based on `environment.useMockApi`. Components/pages only
 * ever depend on this Service - never on the DataSource or the mock store
 * directly - so this file (and every call site) stays identical no matter
 * which data source is active.
 */
@Injectable({ providedIn: 'root' })
export class CompanyService {
  private dataSource = inject(CompanyDataSource);
  private currentUser = inject(CurrentUserContextService);

  /**
   * Non-admins only ever see companies from their own community (see
   * `CurrentUserContextService`); admins see every community.
   */
  list(page = 0, size = 20, search = ''): Observable<Page<Company>> {
    return this.currentUser.getCommunityId().pipe(
      switchMap(communityId => this.dataSource.list(page, size, search, communityId))
    );
  }

  getById(id: number): Observable<Company> {
    return this.dataSource.getById(id);
  }

  create(value: CompanyFormValue): Observable<Company> {
    return this.dataSource.create(value);
  }

  update(id: number, value: CompanyFormValue): Observable<Company> {
    return this.dataSource.update(id, value);
  }

  delete(id: number): Observable<void> {
    return this.dataSource.delete(id);
  }
}
