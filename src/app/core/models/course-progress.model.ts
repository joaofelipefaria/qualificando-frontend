export type CourseCompletionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

/** Per-course completion status for a given student. */
export interface CourseProgress {
  courseId: number;
  status: CourseCompletionStatus;
  /** 0-100. Mocked - no backend field for granular progress yet. */
  progressPercent: number;
}

/** Aggregate completion summary shown in the Talentos list. */
export interface StudentCourseSummary {
  completed: number;
  total: number;
  status: CourseCompletionStatus;
}
