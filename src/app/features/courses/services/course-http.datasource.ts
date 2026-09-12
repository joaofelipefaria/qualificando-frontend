import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Course, CourseFormValue } from '../../../core/models/course.model';
import { Page } from '../../../core/models/page.model';
import { Student } from '../../../core/models/student.model';
import { CourseDataSource } from './course.datasource';

/** Real backend implementation of `CourseDataSource` (quali-courses-api). */
@Injectable({ providedIn: 'root' })
export class CourseHttpDataSource extends CourseDataSource {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/courses`;

  list(page: number, size: number, search: string, communityId?: number | null): Observable<Page<Course>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) {
      params = params.set('search', search);
    }
    if (communityId != null) {
      params = params.set('communityId', communityId);
    }
    return this.http.get<Page<Course>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.baseUrl}/${id}`);
  }

  getEnrolledStudents(id: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/${id}/students`);
  }

  create(value: CourseFormValue): Observable<Course> {
    return this.http.post<Course>(this.baseUrl, value);
  }

  update(id: number, value: CourseFormValue): Observable<Course> {
    return this.http.put<Course>(`${this.baseUrl}/${id}`, value);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  enroll(courseId: number, studentId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${courseId}/enrollments`, { studentId });
  }
}
