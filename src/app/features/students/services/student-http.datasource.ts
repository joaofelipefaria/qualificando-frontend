import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Student, StudentFormValue } from '../../../core/models/student.model';
import { Page } from '../../../core/models/page.model';
import { Course } from '../../../core/models/course.model';
import { StudentDataSource } from './student.datasource';

/** Real backend implementation of `StudentDataSource` (quali-courses-api). */
@Injectable({ providedIn: 'root' })
export class StudentHttpDataSource extends StudentDataSource {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/students`;

  list(page: number, size: number, search: string, communityId?: number | null, pcdOnly?: boolean): Observable<Page<Student>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) {
      params = params.set('search', search);
    }
    if (communityId != null) {
      params = params.set('communityId', communityId);
    }
    if (pcdOnly) {
      params = params.set('pcd', true);
    }
    return this.http.get<Page<Student>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/${id}`);
  }

  getEnrolledCourses(id: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseUrl}/${id}/courses`);
  }

  create(value: StudentFormValue): Observable<Student> {
    return this.http.post<Student>(this.baseUrl, value);
  }

  update(id: number, value: StudentFormValue): Observable<Student> {
    return this.http.put<Student>(`${this.baseUrl}/${id}`, value);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
