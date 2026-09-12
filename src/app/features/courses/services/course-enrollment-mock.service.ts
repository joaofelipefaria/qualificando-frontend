import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

/**
 * TEMPORARY MOCK for the "Matricular aluno" action.
 *
 * The student list queried by this screen is REAL (StudentService hits the
 * actual quali-courses-api /students endpoint, same one used by Talentos).
 * Only the enrollment write itself is mocked here: it just remembers the
 * pair in memory for the current session instead of calling
 * CourseService.enroll() against the backend, so the flow can be built and
 * demoed before the real enrollment endpoint is wired up end-to-end.
 *
 * TODO: once ready, swap the call site in CourseEnrollComponent to
 * CourseService.enroll(courseId, studentId) and delete this service.
 */
@Injectable({ providedIn: 'root' })
export class CourseEnrollmentMockService {
  private static readonly LATENCY_MS = 450;

  private mockEnrollments = new Set<string>();

  private key(courseId: number, studentId: number): string {
    return `${courseId}:${studentId}`;
  }

  enroll(courseId: number, studentId: number): Observable<void> {
    this.mockEnrollments.add(this.key(courseId, studentId));
    return of(undefined).pipe(delay(CourseEnrollmentMockService.LATENCY_MS));
  }

  isMockEnrolled(courseId: number, studentId: number): boolean {
    return this.mockEnrollments.has(this.key(courseId, studentId));
  }

  /** Student ids enrolled in this course during the current session (via the "Matricular" action). */
  getSessionEnrolledStudentIds(courseId: number): number[] {
    const prefix = `${courseId}:`;
    return Array.from(this.mockEnrollments)
      .filter(key => key.startsWith(prefix))
      .map(key => Number(key.slice(prefix.length)));
  }

  /** Course ids this student was enrolled into during the current session (via the "Matricular" action). */
  getSessionEnrolledCourseIds(studentId: number): number[] {
    const suffix = `:${studentId}`;
    return Array.from(this.mockEnrollments)
      .filter(key => key.endsWith(suffix))
      .map(key => Number(key.slice(0, key.length - suffix.length)));
  }
}
