import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { CourseService } from '../../services/course.service';
import { CourseEnrolledStudentsMockService } from '../../services/course-enrolled-students-mock.service';
import { CourseContentGateway } from '../../services/course-content.gateway';
import { Course } from '../../../../core/models/course.model';
import { CourseModule } from '../../../../core/models/course-module.model';
import { Student } from '../../../../core/models/student.model';
import { CourseProgress } from '../../../../core/models/course-progress.model';
import { StudentGamificationSummary } from '../../../../core/models/gamification.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { StudentAvatarComponent } from '../../../../shared/components/student-avatar/student-avatar.component';
import { AuthenticationService } from '../../../../core/authentication/authentication.service';
import { StudentCourseProgressMockService } from '../../../students/services/student-course-progress-mock.service';
import { GamificationMockService } from '../../../students/services/gamification-mock.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    NgIf, NgFor, RouterLink,
    MatButtonModule, MatIconModule, MatTabsModule, MatListModule, MatChipsModule,
    LoadingSpinnerComponent, EmptyStateComponent, StudentAvatarComponent, TranslateModule
  ],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss'
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private enrolledStudentsMock = inject(CourseEnrolledStudentsMockService);
  private courseContentGateway = inject(CourseContentGateway);
  private courseProgress = inject(StudentCourseProgressMockService);
  private gamification = inject(GamificationMockService);

  auth = inject(AuthenticationService);

  course: Course | null = null;
  students: Student[] = [];
  modules: CourseModule[] = [];
  progressByStudentId = new Map<number, CourseProgress>();
  gamificationByStudentId = new Map<number, StudentGamificationSummary>();
  modulesLoading = true;
  loading = true;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.courseService.getById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(course => (this.course = course));

    // TODO: swap for this.courseService.getEnrolledStudents(id) once quali-courses-api
    // returns real enrollment data - see CourseEnrolledStudentsMockService.
    this.enrolledStudentsMock.getEnrolledStudents(id).subscribe({
      next: students => {
        this.students = students;
        this.progressByStudentId = new Map(
          students.map(student => [student.id, this.courseProgress.getProgressForCourse(student.id, id)])
        );
        this.gamificationByStudentId = new Map(
          students.map(student => [student.id, this.gamification.getSummary(student.id)])
        );
      },
      error: () => (this.students = [])
    });

    this.courseContentGateway.listModules(id)
      .pipe(finalize(() => (this.modulesLoading = false)))
      .subscribe({
        next: modules => (this.modules = modules),
        error: () => (this.modules = [])
      });
  }

  courseStatusClass(studentId: number): string {
    const status = this.progressByStudentId.get(studentId)?.status;
    if (status === 'COMPLETED') return 'course-status-completed';
    if (status === 'IN_PROGRESS') return 'course-status-in-progress';
    return 'course-status-not-started';
  }
}
