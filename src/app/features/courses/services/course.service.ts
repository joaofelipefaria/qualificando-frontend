import { Injectable, inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { Course, CourseFormValue } from '../../../core/models/course.model';
import { Page } from '../../../core/models/page.model';
import { Student } from '../../../core/models/student.model';
import { CurrentUserContextService } from '../../../core/services/current-user-context.service';
import { CourseDataSource } from './course.datasource';

/**
 * Component-facing API for Course data. Delegates to `CourseDataSource`,
 * whose concrete implementation (mock or real HTTP) is selected once in
 * `app.config.ts` based on `environment.useMockApi`. Components/pages only
 * ever depend on this Service - never on the DataSource or the mock store
 * directly - so this file (and every call site) stays identical no matter
 * which data source is active.
 */
@Injectable({ providedIn: 'root' })
export class CourseService {
  private dataSource = inject(CourseDataSource);
  private currentUser = inject(CurrentUserContextService);

  /**
   * Non-admins only ever see courses from their own community (see
   * `CurrentUserContextService`); admins see every community.
   */
  list(page = 0, size = 20, search = ''): Observable<Page<Course>> {
    return this.currentUser.getCommunityId().pipe(
      switchMap(communityId => this.dataSource.list(page, size, search, communityId))
    );
  }

  getById(id: number): Observable<Course> {
    return this.dataSource.getById(id);
  }

  getEnrolledStudents(id: number): Observable<Student[]> {
    return this.dataSource.getEnrolledStudents(id);
  }

  create(value: CourseFormValue): Observable<Course> {
    return this.dataSource.create(value);
  }

  update(id: number, value: CourseFormValue): Observable<Course> {
    return this.dataSource.update(id, value);
  }

  delete(id: number): Observable<void> {
    return this.dataSource.delete(id);
  }

  enroll(courseId: number, studentId: number): Observable<void> {
    return this.dataSource.enroll(courseId, studentId);
  }
}
