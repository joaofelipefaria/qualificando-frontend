import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { StudentService } from '../../services/student.service';
import { StudentCourseProgressMockService } from '../../services/student-course-progress-mock.service';
import { GamificationMockService } from '../../services/gamification-mock.service';
import { CourseEnrolledStudentsMockService } from '../../../courses/services/course-enrolled-students-mock.service';
import { Student } from '../../../../core/models/student.model';
import { Course } from '../../../../core/models/course.model';
import { CourseProgress } from '../../../../core/models/course-progress.model';
import { StudentGamificationSummary } from '../../../../core/models/gamification.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { StudentAvatarComponent } from '../../../../shared/components/student-avatar/student-avatar.component';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [
    NgIf, NgFor, RouterLink,
    MatCardModule, MatChipsModule, MatButtonModule, MatIconModule, MatListModule,
    LoadingSpinnerComponent, EmptyStateComponent, StudentAvatarComponent, TranslateModule
  ],
  templateUrl: './student-detail.component.html',
  styleUrl: '../../../communities/pages/community-detail/community-detail.component.scss'
})
export class StudentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private studentService = inject(StudentService);
  private courseProgress = inject(StudentCourseProgressMockService);
  private gamification = inject(GamificationMockService);
  private enrolledCoursesMock = inject(CourseEnrolledStudentsMockService);

  student: Student | null = null;
  courses: Course[] = [];
  progressByCourseId = new Map<number, CourseProgress>();
  gamificationSummary: StudentGamificationSummary | null = null;
  loading = true;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.studentService.getById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(student => (this.student = student));

    this.gamificationSummary = this.gamification.getSummary(id);

    // TODO: swap for this.studentService.getEnrolledCourses(id) once quali-courses-api
    // returns real enrollment data - see CourseEnrolledStudentsMockService.
    this.enrolledCoursesMock.getEnrolledCourses(id).subscribe({
      next: courses => {
        this.courses = courses;
        this.progressByCourseId = new Map(
          this.courseProgress.getProgressForCourses(id, courses).map(p => [p.courseId, p])
        );
      },
      error: () => (this.courses = [])
    });
  }

  courseStatusClass(courseId: number): string {
    const status = this.progressByCourseId.get(courseId)?.status;
    if (status === 'COMPLETED') return 'course-status-completed';
    if (status === 'IN_PROGRESS') return 'course-status-in-progress';
    return 'course-status-not-started';
  }
}
