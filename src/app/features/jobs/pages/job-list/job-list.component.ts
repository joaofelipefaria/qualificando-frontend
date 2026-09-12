import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize, forkJoin } from 'rxjs';
import { JobService } from '../../services/job.service';
import { Job, JobFormValue, JobType, JobWorkMode } from '../../../../core/models/job.model';
import { CompanyService } from '../../../companies/services/company.service';
import { Company } from '../../../../core/models/company.model';
import { CommunityService } from '../../../communities/services/community.service';
import { Community } from '../../../../core/models/community.model';
import { AuthenticationService } from '../../../../core/authentication/authentication.service';
import { AppRole } from '../../../../core/models/role.model';
import { PlatformUserService } from '../../../../core/services/platform-user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

/** Loaded once and filtered entirely in the browser - same approach as CompanyListComponent. */
const FETCH_ALL_SIZE = 1000;

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [
    NgFor, NgIf, DatePipe, ReactiveFormsModule,
    MatCardModule, MatChipsModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatRadioModule, MatProgressSpinnerModule,
    LoadingSpinnerComponent, EmptyStateComponent, TranslateModule
  ],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss'
})
export class JobListComponent implements OnInit {
  private jobService = inject(JobService);
  private companyService = inject(CompanyService);
  private communityService = inject(CommunityService);
  private auth = inject(AuthenticationService);
  private platformUserService = inject(PlatformUserService);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  /** Full dataset fetched once; `jobs` below is the filtered slice actually rendered. */
  private allJobs: Job[] = [];
  /** companyId -> company name, resolved once alongside the jobs themselves. */
  private companyNames = new Map<number, string>();
  /** communityId -> community name, used for the location select in the job form. */
  private communityNames = new Map<number, string>();

  jobs: Job[] = [];
  companies: Company[] = [];
  communities: Community[] = [];
  loading = true;
  searchControl = new FormControl('');
  saving = false;
  showJobForm = false;
  editingJob: Job | null = null;
  empresarioCompanyId: number | null = null;

  readonly jobTypes: JobType[] = ['CLT', 'ESTAGIO', 'APRENDIZ', 'TEMPORARIO'];
  readonly workModes: JobWorkMode[] = ['PRESENCIAL', 'REMOTO', 'HIBRIDO'];

  jobForm = this.fb.group({
    companyId: [null as number | null, Validators.required],
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    location: [''],
    type: ['CLT', Validators.required],
    workMode: ['PRESENCIAL', Validators.required],
    isPcd: [false],
    status: ['ACTIVE', Validators.required]
  });

  get canCreateJobs(): boolean {
    return this.auth.hasAnyRole(AppRole.EMPRESARIO, AppRole.ADMIN);
  }

  get isEditMode(): boolean {
    return this.editingJob !== null;
  }

  ngOnInit(): void {
    this.fetch();

    if (this.auth.isEmpresario()) {
      const email = this.auth.getUserProfile().email;
      if (email) {
        this.platformUserService.getByEmail(email).subscribe(user => {
          if (user?.companyId) {
            this.empresarioCompanyId = user.companyId;
            this.jobForm.patchValue({ companyId: user.companyId });
            this.applyFilter();
          }
        });
      }
    }

    this.searchControl.valueChanges.subscribe(() => this.applyFilter());
  }

  fetch(): void {
    this.loading = true;
    forkJoin({
      jobs: this.jobService.list(0, FETCH_ALL_SIZE, ''),
      companies: this.companyService.list(0, FETCH_ALL_SIZE, ''),
      communities: this.communityService.list(0, FETCH_ALL_SIZE, '')
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ jobs, companies, communities }) => {
          this.companyNames = new Map(companies.content.map(c => [c.id, c.name]));
          this.communityNames = new Map(communities.content.map(c => [c.id, c.name]));
          this.companies = companies.content;
          this.communities = communities.content;
          this.allJobs = jobs.content;
          this.applyFilter();
        },
        error: () => {
          this.allJobs = [];
          this.companies = [];
          this.communities = [];
          this.applyFilter();
        }
      });
  }

  companyName(job: Job): string {
    return this.companyNames.get(job.companyId) ?? '';
  }

  private applyFilter(): void {
    let filtered = this.allJobs;

    if (this.auth.isEmpresario() && this.empresarioCompanyId) {
      filtered = filtered.filter(j => j.companyId === this.empresarioCompanyId);
    }

    const term = (this.searchControl.value ?? '').trim().toLowerCase();
    if (term) {
      filtered = filtered.filter(
        j =>
          j.title.toLowerCase().includes(term) ||
          this.companyName(j).toLowerCase().includes(term)
      );
    }

    this.jobs = filtered;
  }

  toggleJobForm(): void {
    this.showJobForm = !this.showJobForm;
    if (!this.showJobForm) {
      this.editingJob = null;
      this.jobForm.reset({ type: 'CLT', workMode: 'PRESENCIAL', status: 'ACTIVE', isPcd: false });
      if (this.empresarioCompanyId) {
        this.jobForm.patchValue({ companyId: this.empresarioCompanyId });
      }
    }
  }

  editJob(job: Job): void {
    this.editingJob = job;
    this.showJobForm = true;
    this.jobForm.patchValue({
      companyId: job.companyId,
      title: job.title,
      description: job.description ?? '',
      location: job.location ?? '',
      type: job.type,
      workMode: job.workMode,
      isPcd: job.isPcd ?? false,
      status: job.status
    });
  }

  cancelEdit(): void {
    this.editingJob = null;
    this.jobForm.reset({ type: 'CLT', workMode: 'PRESENCIAL', status: 'ACTIVE', isPcd: false });
    if (this.empresarioCompanyId) {
      this.jobForm.patchValue({ companyId: this.empresarioCompanyId });
    }
  }

  submitJob(): void {
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const value = this.jobForm.getRawValue() as JobFormValue;

    if (this.empresarioCompanyId) {
      value.companyId = this.empresarioCompanyId;
      const company = this.companies.find(c => c.id === this.empresarioCompanyId);
      if (company) {
        value.location = this.communityNames.get(company.communityId) ?? '';
      }
    }

    const request$ = this.isEditMode
      ? this.jobService.update(this.editingJob!.id, value)
      : this.jobService.create(value);

    request$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        const key = this.isEditMode ? 'jobs.notifications.updated' : 'jobs.notifications.created';
        this.notification.success(this.translate.instant(key));
        this.showJobForm = false;
        this.editingJob = null;
        this.jobForm.reset({ type: 'CLT', workMode: 'PRESENCIAL', status: 'ACTIVE', isPcd: false });
        if (this.empresarioCompanyId) {
          this.jobForm.patchValue({ companyId: this.empresarioCompanyId });
        }
        this.fetch();
      },
      error: () => {
        this.notification.error(this.translate.instant('jobs.notifications.createError'));
      }
    });
  }

  canEditJob(job: Job): boolean {
    if (this.auth.isAdmin()) return true;
    if (this.auth.isEmpresario() && this.empresarioCompanyId) {
      return job.companyId === this.empresarioCompanyId;
    }
    return false;
  }
}
