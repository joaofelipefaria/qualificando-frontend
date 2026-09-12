import { Observable } from 'rxjs';
import { CourseTech, CourseTechFormValue } from '../../../core/models/course-tech.model';
import { Page } from '../../../core/models/page.model';
import { Student } from '../../../core/models/student.model';

export abstract class CourseTechDataSource {
  abstract list(page: number, size: number, search: string, communityId?: number | null): Observable<Page<CourseTech>>;
  abstract getById(id: number): Observable<CourseTech>;
  abstract getEnrolledStudents(id: number): Observable<Student[]>;
  abstract create(value: CourseTechFormValue): Observable<CourseTech>;
  abstract update(id: number, value: CourseTechFormValue): Observable<CourseTech>;
  abstract delete(id: number): Observable<void>;
  abstract enroll(courseId: number, studentId: number): Observable<void>;
}
