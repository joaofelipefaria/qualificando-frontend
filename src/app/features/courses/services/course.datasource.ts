import { Observable } from 'rxjs';
import { Course, CourseFormValue } from '../../../core/models/course.model';
import { Page } from '../../../core/models/page.model';
import { Student } from '../../../core/models/student.model';

/**
 * Contract for reading/writing Course data (and course enrollment).
 * Abstract class (not an interface) so it can be used as an Angular DI
 * token, same pattern as `CourseContentGateway`.
 *
 * Two implementations exist:
 *  - `CourseHttpDataSource`: real HTTP calls to quali-courses-api.
 *  - `CourseMockDataSource`: in-memory data via `MockStoreService`.
 *
 * Which one gets injected is decided once, in `app.config.ts`, based on
 * `environment.useMockApi`. `CourseService` (and therefore every
 * component) only ever depends on this abstract class.
 */
export abstract class CourseDataSource {
  abstract list(page: number, size: number, search: string, communityId?: number | null): Observable<Page<Course>>;
  abstract getById(id: number): Observable<Course>;
  abstract getEnrolledStudents(id: number): Observable<Student[]>;
  abstract create(value: CourseFormValue): Observable<Course>;
  abstract update(id: number, value: CourseFormValue): Observable<Course>;
  abstract delete(id: number): Observable<void>;
  abstract enroll(courseId: number, studentId: number): Observable<void>;
}
