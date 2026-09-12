import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { CourseService } from '../../services/course.service';
import { Course } from '../../../../core/models/course.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../../core/services/notification.service';

/** Loaded once and filtered entirely in the browser - see `applyFilter`. */
const FETCH_ALL_SIZE = 1000;

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    NgFor, NgIf, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatMenuModule, MatChipsModule, MatDialogModule, LoadingSpinnerComponent, EmptyStateComponent, TranslateModule
  ],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss'
})
export class CourseListComponent implements OnInit {
  private courseService = inject(CourseService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  /** Full dataset fetched once; `courses` below is the filtered slice actually rendered. */
  private allCourses: Course[] = [];
  courses: Course[] = [];
  loading = true;
  searchControl = new FormControl('');

  ngOnInit(): void {
    this.fetch();

    // Client-side only: filters as the person types, no debounce needed
    // since nothing here goes to the backend.
    this.searchControl.valueChanges.subscribe(() => this.applyFilter());
  }

  fetch(): void {
    this.loading = true;
    this.courseService.list(0, FETCH_ALL_SIZE, '')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: result => {
          this.allCourses = result.content;
          this.applyFilter();
        },
        error: () => {
          this.allCourses = [];
          this.applyFilter();
        }
      });
  }

  private applyFilter(): void {
    const term = (this.searchControl.value ?? '').trim().toLowerCase();
    this.courses = !term
      ? this.allCourses
      : this.allCourses.filter(
          c => c.name.toLowerCase().includes(term) || (c.description ?? '').toLowerCase().includes(term)
        );
  }

  confirmDelete(course: Course, event: Event): void {
    event.stopPropagation();
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('courses.deleteDialog.title'),
        message: this.translate.instant('courses.deleteDialog.message', { name: course.name })
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.courseService.delete(course.id).subscribe({
        next: () => {
          this.notification.success(this.translate.instant('courses.notifications.deleted'));
          this.fetch();
        }
      });
    });
  }
}
