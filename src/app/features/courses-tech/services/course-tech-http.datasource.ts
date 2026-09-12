import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CourseTech, CourseTechFormValue } from '../../../core/models/course-tech.model';
import { Page } from '../../../core/models/page.model';
import { Student } from '../../../core/models/student.model';
import { CourseTechDataSource } from './course-tech.datasource';

@Injectable({ providedIn: 'root' })
export class CourseTechHttpDataSource extends CourseTechDataSource {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/courses-tech`;

  list(page: number, size: number, search: string, communityId?: number | null): Observable<Page<CourseTech>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    if (communityId != null) params = params.set('communityId', communityId);
    return this.http.get<Page<CourseTech>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<CourseTech> {
    return this.http.get<CourseTech>(`${this.baseUrl}/${id}`);
  }

  getEnrolledStudents(id: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/${id}/students`);
  }

  create(value: CourseTechFormValue): Observable<CourseTech> {
    return this.http.post<CourseTech>(this.baseUrl, value);
  }

  update(id: number, value: CourseTechFormValue): Observable<CourseTech> {
    return this.http.put<CourseTech>(`${this.baseUrl}/${id}`, value);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  enroll(courseId: number, studentId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${courseId}/enrollments`, { studentId });
  }
}
