import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Course, CourseFormValue } from '../../../core/models/course.model';
import { Page } from '../../../core/models/page.model';
import { Student } from '../../../core/models/student.model';
import { MockStoreService } from '../../../core/mock/mock-store.service';
import { CourseDataSource } from './course.datasource';

/**
 * TEMPORARY MOCK implementation of `CourseDataSource`, backed by the
 * centralized `MockStoreService`. No HTTP call happens here.
 */
@Injectable({ providedIn: 'root' })
export class CourseMockDataSource extends CourseDataSource {
  private store = inject(MockStoreService);

  list(page: number, size: number, search: string, communityId?: number | null): Observable<Page<Course>> {
    return this.store.listCourses(page, size, search, communityId);
  }

  getById(id: number): Observable<Course> {
    return this.store.getCourse(id);
  }

  getEnrolledStudents(id: number): Observable<Student[]> {
    return this.store.getEnrolledStudentsForCourse(id);
  }

  create(value: CourseFormValue): Observable<Course> {
    return this.store.createCourse(value);
  }

  update(id: number, value: CourseFormValue): Observable<Course> {
    return this.store.updateCourse(id, value);
  }

  delete(id: number): Observable<void> {
    return this.store.deleteCourse(id);
  }

  enroll(courseId: number, studentId: number): Observable<void> {
    return this.store.enroll(courseId, studentId);
  }
}
