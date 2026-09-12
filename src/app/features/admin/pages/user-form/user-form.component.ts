import { Component, OnInit, inject } from '@angular/core';
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
import { finalize } from 'rxjs';
import { PlatformUserService } from '../../../../core/services/platform-user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AppRole } from '../../../../core/models/role.model';
import { CommunityService } from '../../../communities/services/community.service';
import { CompanyService } from '../../../companies/services/company.service';
import { Community } from '../../../../core/models/community.model';
import { Company } from '../../../../core/models/company.model';

/**
 * "Novo usuário" / "Editar usuário" page (Administração > Usuários).
 * Kept as its own route - rather than an always-visible inline form on
 * `AdminHomeComponent` - so the Users tab toolbar can stay a simple
 * search field + "Novo usuário" button, same shape as the Comunidades/
 * Cursos tabs. Handles both create (`/admin/users/new`) and edit
 * (`/admin/users/:id/edit`) - same pattern as StudentFormComponent.
 */
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    NgIf, NgFor, RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, TranslateModule
  ],
  templateUrl: './user-form.component.html',
  styleUrl: '../../../communities/pages/community-form/community-form.component.scss'
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private platformUserService = inject(PlatformUserService);
  private communityService = inject(CommunityService);
  private companyService = inject(CompanyService);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);

  userId: number | null = null;
  saving = false;
  loading = false;
  communities: Community[] = [];
  communitiesLoading = true;
  companies: Company[] = [];
  companiesLoading = true;

  readonly roles = [
    AppRole.ADMIN,
    AppRole.EMPRESARIO,
    AppRole.ALUNO,
    AppRole.PODER_PUBLICO
  ];

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    role: [null as AppRole | null, Validators.required],
    communityId: [null as number | null],
    companyId: [null as number | null],
    phone: [''],
    address: ['']
  });

  get isEditMode(): boolean {
    return this.userId !== null;
  }

  get communityApplies(): boolean {
    return this.form.controls.role.value !== AppRole.ADMIN;
  }

  get companyApplies(): boolean {
    return this.form.controls.role.value === AppRole.EMPRESARIO;
  }

  ngOnInit(): void {
    this.communityService.list(0, 100)
      .pipe(finalize(() => (this.communitiesLoading = false)))
      .subscribe(page => (this.communities = page.content));

    this.companyService.list(0, 100)
      .pipe(finalize(() => (this.companiesLoading = false)))
      .subscribe(page => (this.companies = page.content));

    this.form.controls.role.valueChanges.subscribe(role => {
      const communityControl = this.form.controls.communityId;
      const companyControl = this.form.controls.companyId;
      if (role === AppRole.ADMIN) {
        communityControl.clearValidators();
        communityControl.setValue(null);
        companyControl.clearValidators();
        companyControl.setValue(null);
      } else if (role === AppRole.EMPRESARIO) {
        communityControl.setValidators(Validators.required);
        companyControl.setValidators(Validators.required);
      } else {
        communityControl.setValidators(Validators.required);
        companyControl.clearValidators();
        companyControl.setValue(null);
      }
      communityControl.updateValueAndValidity();
      companyControl.updateValueAndValidity();
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.userId = Number(idParam);
      this.loading = true;
      this.platformUserService.getById(this.userId)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe(user => {
          this.form.patchValue({
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            communityId: user.communityId ?? null,
            companyId: user.companyId ?? null,
            phone: user.phone,
            address: user.address
          });
        });
    }
  }

  roleLabel(role: AppRole): string {
    return this.translate.instant('admin.roles.' + role);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const value = this.form.getRawValue() as any;
    const request$ = this.isEditMode
      ? this.platformUserService.update(this.userId!, value)
      : this.platformUserService.create(value);

    request$.pipe(finalize(() => (this.saving = false))).subscribe(() => {
      const key = this.isEditMode ? 'admin.users.updatedSuccess' : 'admin.users.createdSuccess';
      this.notification.success(this.translate.instant(key));
      this.router.navigate(['/admin']);
    });
  }
}
