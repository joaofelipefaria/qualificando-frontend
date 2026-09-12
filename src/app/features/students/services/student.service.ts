import { Injectable, inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { Student, StudentFormValue } from '../../../core/models/student.model';
import { Page } from '../../../core/models/page.model';
import { Course } from '../../../core/models/course.model';
import { CurrentUserContextService } from '../../../core/services/current-user-context.service';
import { StudentDataSource } from './student.datasource';

/**
 * Component-facing API for Student data. Delegates to `StudentDataSource`,
 * whose concrete implementation (mock or real HTTP) is selected once in
 * `app.config.ts` based on `environment.useMockApi`. Components/pages only
 * ever depend on this Service - never on the DataSource or the mock store
 * directly - so this file (and every call site) stays identical no matter
 * which data source is active.
 */
@Injectable({ providedIn: 'root' })
export class StudentService {
  private dataSource = inject(StudentDataSource);
  private currentUser = inject(CurrentUserContextService);

  /**
   * Non-admins only ever see talents from their own community (see
   * `CurrentUserContextService`); admins see every community.
   */
  list(page = 0, size = 20, search = '', pcdOnly = false): Observable<Page<Student>> {
    return this.currentUser.getCommunityId().pipe(
      switchMap(communityId => this.dataSource.list(page, size, search, communityId, pcdOnly))
    );
  }

  getById(id: number): Observable<Student> {
    return this.dataSource.getById(id);
  }

  getEnrolledCourses(id: number): Observable<Course[]> {
    return this.dataSource.getEnrolledCourses(id);
  }

  create(value: StudentFormValue): Observable<Student> {
    return this.dataSource.create(value);
  }

  update(id: number, value: StudentFormValue): Observable<Student> {
    return this.dataSource.update(id, value);
  }

  delete(id: number): Observable<void> {
    return this.dataSource.delete(id);
  }
}
