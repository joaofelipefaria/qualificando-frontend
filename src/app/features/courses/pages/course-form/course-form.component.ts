import { Component, inject, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import {ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize, switchMap, tap } from 'rxjs';
import { CourseService } from '../../services/course.service';
import { CommunityService } from '../../../communities/services/community.service';
import { Community } from '../../../../core/models/community.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [
    NgIf, NgFor, RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatSelectModule,
    MatSliderModule, MatIconModule, MatProgressSpinnerModule,
    MatButtonModule, MatInputModule, TranslateModule
  ],
  templateUrl: './course-form.component.html',
  styleUrl: '../../../communities/pages/community-form/community-form.component.scss'
})
export class CourseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);
  private communityService = inject(CommunityService);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);

  courseId: number | null = null;
  saving = false;
  loading = false;
  communities: Community[] = [];
  communitiesLoading = true;

  readonly MIN_DURATION = 1;
  readonly MAX_DURATION = 104;

  form = this.fb.group({
    communityId: [null as number | null, Validators.required],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    duration: [8 as number, [Validators.required, Validators.min(this.MIN_DURATION), Validators.max(this.MAX_DURATION)]],
    status: ['ACTIVE', Validators.required]
  });

  get isEditMode(): boolean {
    return this.courseId !== null;
  }

  get showDuration(): boolean {
    return this.isEditMode;
  }

  get durationControl(): FormControl<number> {
    return this.form.controls.duration as FormControl<number>;
  }

  get durationLabel(): string {
    const value = this.durationControl.value ?? 0;
    return this.translate.instant('courses.form.durationWeeks', { weeks: value });
  }

  ngOnInit(): void {
    const communities$ = this.communityService.list(0, 100).pipe(
      tap(page => (this.communities = page.content)),
      finalize(() => (this.communitiesLoading = false))
    );

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.courseId = Number(idParam);
      this.loading = true;
      communities$
        .pipe(
          switchMap(() => this.courseService.getById(this.courseId!)),
          finalize(() => (this.loading = false))
        )
        .subscribe(course => this.form.patchValue({ duration: course.duration ?? 8 }));
    } else {
      communities$.subscribe();
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const value = this.form.getRawValue() as any;
    const request$ = this.isEditMode
      ? this.courseService.update(this.courseId!, value)
      : this.courseService.create(value);

    request$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        const key = this.isEditMode ? 'courses.notifications.updated' : 'courses.notifications.created';
        this.notification.success(this.translate.instant(key));
        this.router.navigate(['/courses']);
      }
    });
  }
}