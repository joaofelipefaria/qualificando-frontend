import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CourseTech, CourseTechFormValue } from '../../../core/models/course-tech.model';
import { Page } from '../../../core/models/page.model';
import { Student } from '../../../core/models/student.model';
import { MockStoreService } from '../../../core/mock/mock-store.service';
import { CourseTechDataSource } from './course-tech.datasource';

@Injectable({ providedIn: 'root' })
export class CourseTechMockDataSource extends CourseTechDataSource {
  private store = inject(MockStoreService);

  list(page: number, size: number, search: string, communityId?: number | null): Observable<Page<CourseTech>> {
    return this.store.listCoursesTech(page, size, search, communityId);
  }

  getById(id: number): Observable<CourseTech> {
    return this.store.getCourseTech(id);
  }

  getEnrolledStudents(id: number): Observable<Student[]> {
    return this.store.getEnrolledStudentsForCourseTech(id);
  }

  create(value: CourseTechFormValue): Observable<CourseTech> {
    return this.store.createCourseTech(value);
  }

  update(id: number, value: CourseTechFormValue): Observable<CourseTech> {
    return this.store.updateCourseTech(id, value);
  }

  delete(id: number): Observable<void> {
    return this.store.deleteCourseTech(id);
  }

  enroll(courseId: number, studentId: number): Observable<void> {
    return this.store.enrollTech(courseId, studentId);
  }
}
