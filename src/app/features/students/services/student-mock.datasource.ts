import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Student, StudentFormValue } from '../../../core/models/student.model';
import { Page } from '../../../core/models/page.model';
import { Course } from '../../../core/models/course.model';
import { MockStoreService } from '../../../core/mock/mock-store.service';
import { StudentDataSource } from './student.datasource';

/**
 * TEMPORARY MOCK implementation of `StudentDataSource`, backed by the
 * centralized `MockStoreService`. No HTTP call happens here.
 */
@Injectable({ providedIn: 'root' })
export class StudentMockDataSource extends StudentDataSource {
  private store = inject(MockStoreService);

  list(page: number, size: number, search: string, communityId?: number | null, pcdOnly?: boolean): Observable<Page<Student>> {
    return this.store.listStudents(page, size, search, communityId, pcdOnly);
  }

  getById(id: number): Observable<Student> {
    return this.store.getStudent(id);
  }

  getEnrolledCourses(id: number): Observable<Course[]> {
    return this.store.getEnrolledCoursesForStudent(id);
  }

  create(value: StudentFormValue): Observable<Student> {
    return this.store.createStudent(value);
  }

  update(id: number, value: StudentFormValue): Observable<Student> {
    return this.store.updateStudent(id, value);
  }

  delete(id: number): Observable<void> {
    return this.store.deleteStudent(id);
  }
}
