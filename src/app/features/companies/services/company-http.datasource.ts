import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Company, CompanyFormValue } from '../../../core/models/company.model';
import { Page } from '../../../core/models/page.model';
import { CompanyDataSource } from './company.datasource';

/** Real backend implementation of `CompanyDataSource` (quali-core-api). */
@Injectable({ providedIn: 'root' })
export class CompanyHttpDataSource extends CompanyDataSource {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/companies`;

  list(page: number, size: number, search: string, communityId?: number | null): Observable<Page<Company>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) {
      params = params.set('search', search);
    }
    if (communityId != null) {
      params = params.set('communityId', communityId);
    }
    return this.http.get<Page<Company>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/${id}`);
  }

  create(value: CompanyFormValue): Observable<Company> {
    return this.http.post<Company>(this.baseUrl, value);
  }

  update(id: number, value: CompanyFormValue): Observable<Company> {
    return this.http.put<Company>(`${this.baseUrl}/${id}`, value);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
