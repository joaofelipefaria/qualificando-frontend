import { Injectable, inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { CourseTech, CourseTechFormValue } from '../../../core/models/course-tech.model';
import { Page } from '../../../core/models/page.model';
import { Student } from '../../../core/models/student.model';
import { CurrentUserContextService } from '../../../core/services/current-user-context.service';
import { CourseTechDataSource } from './course-tech.datasource';

@Injectable({ providedIn: 'root' })
export class CourseTechService {
  private dataSource = inject(CourseTechDataSource);
  private currentUser = inject(CurrentUserContextService);

  list(page = 0, size = 20, search = ''): Observable<Page<CourseTech>> {
    return this.currentUser.getCommunityId().pipe(
      switchMap(communityId => this.dataSource.list(page, size, search, communityId))
    );
  }

  getById(id: number): Observable<CourseTech> {
    return this.dataSource.getById(id);
  }

  getEnrolledStudents(id: number): Observable<Student[]> {
    return this.dataSource.getEnrolledStudents(id);
  }

  create(value: CourseTechFormValue): Observable<CourseTech> {
    return this.dataSource.create(value);
  }

  update(id: number, value: CourseTechFormValue): Observable<CourseTech> {
    return this.dataSource.update(id, value);
  }

  delete(id: number): Observable<void> {
    return this.dataSource.delete(id);
  }

  enroll(courseId: number, studentId: number): Observable<void> {
    return this.dataSource.enroll(courseId, studentId);
  }
}
