import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { StudentService } from '../../students/services/student.service';
import { CourseService } from './course.service';
import { CourseEnrollmentMockService } from './course-enrollment-mock.service';
import { Student } from '../../../core/models/student.model';
import { Course } from '../../../core/models/course.model';

/**
 * TEMPORARY MOCK for "which students are enrolled in this course".
 *
 * The students themselves are REAL (same StudentService.list() call used by
 * Talentos and the "Matricular aluno" screen). What's mocked is the
 * enrollment relationship: quali-courses-api's /courses/:id/students
 * endpoint exists but has no real enrollment data yet (the "Matricular"
 * action itself is mocked - see CourseEnrollmentMockService - so nothing
 * ever gets persisted there). Without this, course screens would show an
 * empty student list even though real students exist.
 *
 * This deterministically assigns ~55% of real students to each course (seeded
 * by courseId + studentId, stable across reloads) and merges in whoever was
 * enrolled during the current session via the "Matricular" screen.
 *
 * TODO: once quali-courses-api returns real enrollment data, replace calls
 * to this service with CourseService.getEnrolledStudents(courseId) directly
 * and delete this mock.
 */
@Injectable({ providedIn: 'root' })
export class CourseEnrolledStudentsMockService {
  private static readonly BASELINE_POOL_SIZE = 50;
  private static readonly BASELINE_ENROLLMENT_RATE = 0.55;

  private studentService = inject(StudentService);
  private courseService = inject(CourseService);
  private enrollmentMock = inject(CourseEnrollmentMockService);

  /** Real students, filtered down to whoever is (mock-)enrolled in this course. */
  getEnrolledStudents(courseId: number): Observable<Student[]> {
    return this.studentService
      .list(0, CourseEnrolledStudentsMockService.BASELINE_POOL_SIZE)
      .pipe(
        map(page => {
          const sessionIds = new Set(this.enrollmentMock.getSessionEnrolledStudentIds(courseId));
          return page.content.filter(
            student => sessionIds.has(student.id) || this.isBaselineEnrolled(courseId, student.id)
          );
        })
      );
  }

  /** Real courses, filtered down to whoever this student is (mock-)enrolled in. Mirrors getEnrolledStudents. */
  getEnrolledCourses(studentId: number): Observable<Course[]> {
    return this.courseService
      .list(0, CourseEnrolledStudentsMockService.BASELINE_POOL_SIZE)
      .pipe(
        map(page => {
          const sessionIds = new Set(this.enrollmentMock.getSessionEnrolledCourseIds(studentId));
          return page.content.filter(
            course => sessionIds.has(course.id) || this.isBaselineEnrolled(course.id, studentId)
          );
        })
      );
  }

  private isBaselineEnrolled(courseId: number, studentId: number): boolean {
    // Deterministic pseudo-random pick so the same course always shows the
    // same "enrolled" students across reloads, without needing a backend.
    const seed = (courseId * 31 + studentId * 17) % 100;
    return seed < CourseEnrolledStudentsMockService.BASELINE_ENROLLMENT_RATE * 100;
  }
}
