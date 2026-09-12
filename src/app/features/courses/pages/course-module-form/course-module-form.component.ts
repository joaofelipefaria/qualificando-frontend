import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize, forkJoin } from 'rxjs';
import { CourseContentGateway } from '../../services/course-content.gateway';
import { CompanyService } from '../../../companies/services/company.service';
import { Company } from '../../../../core/models/company.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-course-module-form',
  standalone: true,
  imports: [
    NgIf, NgFor, RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, TranslateModule
  ],
  templateUrl: './course-module-form.component.html',
  styleUrl: '../../../communities/pages/community-form/community-form.component.scss'
})
export class CourseModuleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private gateway = inject(CourseContentGateway);
  private companyService = inject(CompanyService);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);

  courseId!: number;
  moduleId: number | null = null;
  saving = false;
  loading = false;
  companies: Company[] = [];

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    order: [1, [Validators.required, Validators.min(1)]],
    modality: ['ONLINE' as 'ONLINE' | 'PRESENCIAL', Validators.required],
    status: ['ACTIVE', Validators.required],
    presencialCompanyId: [null as number | null],
    points: [10, [Validators.required, Validators.min(0)]]
  });

  get isEditMode(): boolean {
    return this.moduleId !== null;
  }

  get isPresencial(): boolean {
    return this.form.controls.modality.value === 'PRESENCIAL';
  }

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    const idParam = this.route.snapshot.paramMap.get('moduleId');

    this.loading = true;
    const company$ = this.companyService.list(0, 100);

    if (idParam) {
      this.moduleId = Number(idParam);
      forkJoin({ company: company$, module: this.gateway.getModule(this.moduleId) })
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: ({ company, module }) => {
            this.companies = company.content;
            this.form.patchValue({
              title: module.title,
              description: module.description,
              order: module.order,
              modality: module.modality,
              status: module.status,
              presencialCompanyId: module.presencial?.companyId ?? null,
              points: module.points ?? 0
            });
            this.applyPresencialValidators();
          },
          error: () => (this.companies = [])
        });
    } else {
      company$.pipe(finalize(() => (this.loading = false))).subscribe({
        next: result => (this.companies = result.content),
        error: () => (this.companies = [])
      });
      this.applyPresencialValidators();
    }

    this.form.controls.modality.valueChanges.subscribe(() => this.applyPresencialValidators());
  }

  private applyPresencialValidators(): void {
    const control = this.form.controls.presencialCompanyId;
    if (this.isPresencial) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
    }
    control.updateValueAndValidity({ emitEvent: false });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const value = this.form.getRawValue() as any;
    const request$ = this.isEditMode
      ? this.gateway.updateModule(this.moduleId!, value)
      : this.gateway.createModule(this.courseId, value);

    request$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: module => {
        const key = this.isEditMode ? 'courseModules.notifications.updated' : 'courseModules.notifications.created';
        this.notification.success(this.translate.instant(key));
        this.router.navigate(['/courses', this.courseId, 'modules', module.id]);
      },
      error: () => this.notification.error(this.translate.instant('courseModules.notifications.saveError'))
    });
  }
}
