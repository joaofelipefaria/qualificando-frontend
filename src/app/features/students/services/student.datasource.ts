import { Observable } from 'rxjs';
import { Student, StudentFormValue } from '../../../core/models/student.model';
import { Page } from '../../../core/models/page.model';
import { Course } from '../../../core/models/course.model';

/**
 * Contract for reading/writing Student data. Abstract class (not an
 * interface) so it can be used as an Angular DI token, same pattern as
 * `CourseContentGateway`.
 *
 * Two implementations exist:
 *  - `StudentHttpDataSource`: real HTTP calls to quali-courses-api.
 *  - `StudentMockDataSource`: in-memory data via `MockStoreService`.
 *
 * Which one gets injected is decided once, in `app.config.ts`, based on
 * `environment.useMockApi`. `StudentService` (and therefore every
 * component) only ever depends on this abstract class.
 */
export abstract class StudentDataSource {
  abstract list(page: number, size: number, search: string, communityId?: number | null, pcdOnly?: boolean): Observable<Page<Student>>;
  abstract getById(id: number): Observable<Student>;
  abstract getEnrolledCourses(id: number): Observable<Course[]>;
  abstract create(value: StudentFormValue): Observable<Student>;
  abstract update(id: number, value: StudentFormValue): Observable<Student>;
  abstract delete(id: number): Observable<void>;
}
