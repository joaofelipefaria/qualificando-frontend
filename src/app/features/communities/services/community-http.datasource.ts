import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Community, CommunityFormValue } from '../../../core/models/community.model';
import { Page } from '../../../core/models/page.model';
import { CommunityDataSource } from './community.datasource';

/** Real backend implementation of `CommunityDataSource` (quali-core-api). */
@Injectable({ providedIn: 'root' })
export class CommunityHttpDataSource extends CommunityDataSource {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/communities`;

  list(page: number, size: number, search: string): Observable<Page<Community>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<Page<Community>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Community> {
    return this.http.get<Community>(`${this.baseUrl}/${id}`);
  }

  create(value: CommunityFormValue): Observable<Community> {
    return this.http.post<Community>(this.baseUrl, value);
  }

  update(id: number, value: CommunityFormValue): Observable<Community> {
    return this.http.put<Community>(`${this.baseUrl}/${id}`, value);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
