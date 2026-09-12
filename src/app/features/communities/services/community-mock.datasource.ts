import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Community, CommunityFormValue } from '../../../core/models/community.model';
import { Page } from '../../../core/models/page.model';
import { MockStoreService } from '../../../core/mock/mock-store.service';
import { CommunityDataSource } from './community.datasource';

/**
 * TEMPORARY MOCK implementation of `CommunityDataSource`, backed by the
 * centralized `MockStoreService`. No HTTP call happens here.
 */
@Injectable({ providedIn: 'root' })
export class CommunityMockDataSource extends CommunityDataSource {
  private store = inject(MockStoreService);

  list(page: number, size: number, search: string): Observable<Page<Community>> {
    return this.store.listCommunities(page, size, search);
  }

  getById(id: number): Observable<Community> {
    return this.store.getCommunity(id);
  }

  create(value: CommunityFormValue): Observable<Community> {
    return this.store.createCommunity(value);
  }

  update(id: number, value: CommunityFormValue): Observable<Community> {
    return this.store.updateCommunity(id, value);
  }

  delete(id: number): Observable<void> {
    return this.store.deleteCommunity(id);
  }
}
