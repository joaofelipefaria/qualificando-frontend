import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { CourseTechContentGateway } from '../../services/course-tech-content.gateway';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-course-tech-module-form',
  standalone: true,
  imports: [
    NgIf, NgFor, RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, TranslateModule
  ],
  templateUrl: './course-tech-module-form.component.html',
  styleUrl: '../../../communities/pages/community-form/community-form.component.scss'
})
export class CourseTechModuleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private gateway = inject(CourseTechContentGateway);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);

  courseId!: number;
  moduleId: number | null = null;
  saving = false;
  loading = false;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    order: [1, [Validators.required, Validators.min(1)]],
    content: ['']
  });

  get isEditMode(): boolean {
    return this.moduleId !== null;
  }

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    const idParam = this.route.snapshot.paramMap.get('moduleId');

    if (idParam) {
      this.moduleId = Number(idParam);
      this.loading = true;
      this.gateway.getModule(this.moduleId)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: module => {
            this.form.patchValue({
              title: module.title,
              description: module.description,
              order: module.order,
              content: ''
            });
          }
        });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const value = this.form.getRawValue() as any;
    const moduleValue = {
      title: value.title,
      description: value.description,
      order: value.order,
      modality: 'ONLINE' as const,
      status: 'ACTIVE' as const,
      presencialCompanyId: null,
      points: 0
    };

    const request$ = this.isEditMode
      ? this.gateway.updateModule(this.moduleId!, moduleValue)
      : this.gateway.createModule(this.courseId, moduleValue);

    request$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: module => {
        const key = this.isEditMode ? 'courseModules.notifications.updated' : 'courseModules.notifications.created';
        this.notification.success(this.translate.instant(key));
        this.router.navigate(['/courses-tech', this.courseId, 'modules', module.id]);
      },
      error: () => this.notification.error(this.translate.instant('courseModules.notifications.saveError'))
    });
  }
}
