import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Community, CommunityFormValue } from '../../../core/models/community.model';
import { Page } from '../../../core/models/page.model';
import { CommunityDataSource } from './community.datasource';

/**
 * Component-facing API for Community data. Delegates to `CommunityDataSource`,
 * whose concrete implementation (mock or real HTTP) is selected once in
 * `app.config.ts` based on `environment.useMockApi`. Components/pages only
 * ever depend on this Service - never on the DataSource or the mock store
 * directly - so this file (and every call site) stays identical no matter
 * which data source is active.
 */
@Injectable({ providedIn: 'root' })
export class CommunityService {
  private dataSource = inject(CommunityDataSource);

  list(page = 0, size = 20, search = ''): Observable<Page<Community>> {
    return this.dataSource.list(page, size, search);
  }

  getById(id: number): Observable<Community> {
    return this.dataSource.getById(id);
  }

  create(value: CommunityFormValue): Observable<Community> {
    return this.dataSource.create(value);
  }

  update(id: number, value: CommunityFormValue): Observable<Community> {
    return this.dataSource.update(id, value);
  }

  delete(id: number): Observable<void> {
    return this.dataSource.delete(id);
  }
}
