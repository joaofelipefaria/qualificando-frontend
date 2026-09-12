import { Injectable } from '@angular/core';
import { Course } from '../../../core/models/course.model';
import { CourseCompletionStatus, CourseProgress, StudentCourseSummary } from '../../../core/models/course-progress.model';

/**
 * TEMPORARY MOCK.
 *
 * There is no backend endpoint yet for per-student course completion
 * status (an enrollment only tells us a student is IN a course, not how
 * far along they are). Until quali-courses-api exposes something like
 * GET /students/{id}/courses/progress, this service fabricates a
 * deterministic status from the student/course ids so the Talentos UI
 * has something real to render and the shape of the data is settled.
 *
 * TODO: replace this whole service with a call to StudentService once the
 * backend contract exists, and delete the mock.
 */
@Injectable({ providedIn: 'root' })
export class StudentCourseProgressMockService {
  private static readonly STATUSES: CourseCompletionStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];

  /** Deterministic pseudo-random status for a given student+course pair. */
  private statusFor(studentId: number, courseId: number): CourseCompletionStatus {
    const seed = (studentId * 31 + courseId * 17) % StudentCourseProgressMockService.STATUSES.length;
    return StudentCourseProgressMockService.STATUSES[seed];
  }

  /** Deterministic pseudo-progress percentage, consistent with statusFor(). */
  private progressPercentFor(studentId: number, courseId: number): number {
    const status = this.statusFor(studentId, courseId);
    if (status === 'COMPLETED') return 100;
    if (status === 'NOT_STARTED') return 0;
    // IN_PROGRESS: deterministic value between 10 and 90.
    return 10 + ((studentId * 13 + courseId * 7) % 81);
  }

  /** Per-course status list, e.g. for the Talento detail page. */
  getProgressForCourses(studentId: number, courses: Course[]): CourseProgress[] {
    return courses.map(course => ({
      courseId: course.id,
      status: this.statusFor(studentId, course.id),
      progressPercent: this.progressPercentFor(studentId, course.id)
    }));
  }

  /** Progress for a single course, e.g. for the course's enrolled-students tab. */
  getProgressForCourse(studentId: number, courseId: number): CourseProgress {
    return {
      courseId,
      status: this.statusFor(studentId, courseId),
      progressPercent: this.progressPercentFor(studentId, courseId)
    };
  }

  /**
   * Aggregate summary for a student row in the Talentos list.
   * Since the list endpoint doesn't return enrolled courses at all, this
   * simulates a small course load (1-4 courses) per student so the column
   * has believable data instead of a single binary status.
   */
  getSummary(studentId: number): StudentCourseSummary {
    const total = 1 + (studentId % 4);
    let completed = 0;
    for (let courseId = 1; courseId <= total; courseId++) {
      if (this.statusFor(studentId, courseId) === 'COMPLETED') {
        completed++;
      }
    }

    const status: CourseCompletionStatus =
      completed === total ? 'COMPLETED' : completed === 0 ? 'NOT_STARTED' : 'IN_PROGRESS';

    return { completed, total, status };
  }
}
