import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, finalize, forkJoin } from 'rxjs';
import { StudentService } from '../../../students/services/student.service';
import { CourseTechService } from '../../services/course-tech.service';
import { Student } from '../../../../core/models/student.model';
import { CourseTech } from '../../../../core/models/course-tech.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { StudentAvatarComponent } from '../../../../shared/components/student-avatar/student-avatar.component';
import { NotificationService } from '../../../../core/services/notification.service';

/**
 * "Matricular aluno" screen for tech courses.
 *
 * The student list here is REAL: it queries StudentService.list(), the
 * exact same endpoint used by the Talentos screen. Enrollment itself uses
 * CourseTechService.enroll(), backed by the in-memory mock store while
 * `environment.useMockApi` is true (see CourseTechMockDataSource /
 * MockStoreService). Fully independent from the regular courses feature.
 */
@Component({
  selector: 'app-course-tech-enroll',
  standalone: true,
  imports: [
    NgIf, RouterLink, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatChipsModule,
    LoadingSpinnerComponent, EmptyStateComponent, StudentAvatarComponent, TranslateModule
  ],
  templateUrl: './course-tech-enroll.component.html',
  styleUrl: '../../../communities/pages/community-list/community-list.component.scss'
})
export class CourseTechEnrollComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private studentService = inject(StudentService);
  private courseTechService = inject(CourseTechService);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = ['avatar', 'name', 'email', 'education', 'action'];

  courseId!: number;
  course: CourseTech | null = null;
  students: Student[] = [];
  alreadyEnrolledIds = new Set<number>();
  enrollingId: number | null = null;
  totalElements = 0;
  pageSize = 10;
  loading = true;

  searchControl = new FormControl('');

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));

    this.courseTechService.getById(this.courseId).subscribe({
      next: course => (this.course = course),
      error: () => (this.course = null)
    });

    this.fetch();
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.fetch(0));
  }

  fetch(page = 0): void {
    this.loading = true;
    forkJoin({
      students: this.studentService.list(page, this.pageSize, this.searchControl.value ?? ''),
      enrolled: this.courseTechService.getEnrolledStudents(this.courseId)
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ students, enrolled }) => {
          this.students = students.content;
          this.totalElements = students.totalElements;
          this.alreadyEnrolledIds = new Set(enrolled.map(s => s.id));
        },
        error: () => {
          this.students = [];
          this.totalElements = 0;
        }
      });
  }

  isEnrolled(student: Student): boolean {
    return this.alreadyEnrolledIds.has(student.id);
  }

  onPage(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.fetch(event.pageIndex);
  }

  enroll(student: Student): void {
    this.enrollingId = student.id;
    this.courseTechService.enroll(this.courseId, student.id)
      .pipe(finalize(() => (this.enrollingId = null)))
      .subscribe({
        next: () => {
          this.notification.success(this.translate.instant('coursesTech.enroll.success'));
          this.alreadyEnrolledIds.add(student.id);
        },
        error: () => this.notification.error(this.translate.instant('coursesTech.enroll.error'))
      });
  }
}
