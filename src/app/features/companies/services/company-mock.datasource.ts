import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Company, CompanyFormValue } from '../../../core/models/company.model';
import { Page } from '../../../core/models/page.model';
import { MockStoreService } from '../../../core/mock/mock-store.service';
import { CompanyDataSource } from './company.datasource';

/**
 * TEMPORARY MOCK implementation of `CompanyDataSource`, backed by the
 * centralized `MockStoreService`. No HTTP call happens here.
 */
@Injectable({ providedIn: 'root' })
export class CompanyMockDataSource extends CompanyDataSource {
  private store = inject(MockStoreService);

  list(page: number, size: number, search: string, communityId?: number | null): Observable<Page<Company>> {
    return this.store.listCompanies(page, size, search, communityId);
  }

  getById(id: number): Observable<Company> {
    return this.store.getCompany(id);
  }

  create(value: CompanyFormValue): Observable<Company> {
    return this.store.createCompany(value);
  }

  update(id: number, value: CompanyFormValue): Observable<Company> {
    return this.store.updateCompany(id, value);
  }

  delete(id: number): Observable<void> {
    return this.store.deleteCompany(id);
  }
}
