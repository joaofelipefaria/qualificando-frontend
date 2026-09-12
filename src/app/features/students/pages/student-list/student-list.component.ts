import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { StudentService } from '../../services/student.service';
import { StudentCourseProgressMockService } from '../../services/student-course-progress-mock.service';
import { GamificationMockService } from '../../services/gamification-mock.service';
import { Student } from '../../../../core/models/student.model';
import { StudentCourseSummary } from '../../../../core/models/course-progress.model';
import { StudentGamificationSummary } from '../../../../core/models/gamification.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { StudentAvatarComponent } from '../../../../shared/components/student-avatar/student-avatar.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    NgIf, DatePipe, RouterLink, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule, MatChipsModule, MatMenuModule, MatDialogModule,
    LoadingSpinnerComponent, EmptyStateComponent, StudentAvatarComponent, TranslateModule
  ],
  templateUrl: './student-list.component.html',
  styleUrl: '../../../communities/pages/community-list/community-list.component.scss'
})
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentService);
  private courseProgress = inject(StudentCourseProgressMockService);
  private gamification = inject(GamificationMockService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = ['avatar', 'name', 'email', 'education', 'status', 'courseStatus', 'points', 'actions'];
  students: Student[] = [];
  courseSummaries = new Map<number, StudentCourseSummary>();
  gamificationSummaries = new Map<number, StudentGamificationSummary>();
  totalElements = 0;
  pageSize = 10;
  loading = true;

  searchControl = new FormControl('');
  pcdOnlyControl = new FormControl(false);

  ngOnInit(): void {
    this.fetch();
    // This search hits the (mocked) backend - see MockStoreService -
    // so, unlike Communities/Companies/Courses, it must NOT run on every
    // keystroke. It only runs when `filter()` is called (the "Filtrar"
    // button in the template).
  }

  filter(): void {
    this.fetch(0);
  }

  fetch(page = 0): void {
    this.loading = true;
    this.studentService.list(page, this.pageSize, this.searchControl.value ?? '', this.pcdOnlyControl.value ?? false)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: result => {
          this.students = result.content;
          this.totalElements = result.totalElements;
          this.courseSummaries = new Map(
            result.content.map(student => [student.id, this.courseProgress.getSummary(student.id)])
          );
          this.gamificationSummaries = new Map(
            result.content.map(student => [student.id, this.gamification.getSummary(student.id)])
          );
        },
        error: () => {
          this.students = [];
          this.totalElements = 0;
        }
      });
  }

  courseStatusClass(studentId: number): string {
    const status = this.courseSummaries.get(studentId)?.status;
    if (status === 'COMPLETED') return 'course-status-completed';
    if (status === 'IN_PROGRESS') return 'course-status-in-progress';
    return 'course-status-not-started';
  }

  onPage(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.fetch(event.pageIndex);
  }

  goToNew(): void {
    this.router.navigate(['/talentos/new']);
  }

  confirmDelete(student: Student): void {
    const fallbackName = this.translate.instant('students.deleteDialog.fallbackName');
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('students.deleteDialog.title'),
        message: this.translate.instant('students.deleteDialog.message', { name: student.fullName ?? fallbackName })
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.studentService.delete(student.id).subscribe({
        next: () => {
          this.notification.success(this.translate.instant('students.notifications.deleted'));
          this.fetch();
        }
      });
    });
  }
}
