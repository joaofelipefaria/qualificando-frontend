import { Component, inject, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize, switchMap, tap } from 'rxjs';
import { CompanyService } from '../../services/company.service';
import { CommunityService } from '../../../communities/services/community.service';
import { Community } from '../../../../core/models/community.model';
import { TrainingWeekday } from '../../../../core/models/company.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [
    NgIf, NgFor, RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatRadioModule, TranslateModule
  ],
  templateUrl: './company-form.component.html',
  styleUrl: '../../../communities/pages/community-form/community-form.component.scss'
})
export class CompanyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private companyService = inject(CompanyService);
  private communityService = inject(CommunityService);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);

  companyId: number | null = null;
  saving = false;
  loading = false;
  communities: Community[] = [];
  communitiesLoading = true;

  readonly weekdays: TrainingWeekday[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  form = this.fb.group({
    communityId: [null as number | null, Validators.required],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    logoUrl: [''],
    website: [''],
    ofereceTreinamentoPresencial: [false, Validators.required],
    diasTreinamentoPresencial: [[] as TrainingWeekday[]],
    horarioTreinamentoInicio: [''],
    horarioTreinamentoFim: [''],
    status: ['ACTIVE', Validators.required]
  });

  get isEditMode(): boolean {
    return this.companyId !== null;
  }

  get offersPresencialTraining(): boolean {
    return this.form.controls.ofereceTreinamentoPresencial.value === true;
  }

  weekdayLabel(day: TrainingWeekday): string {
    return this.translate.instant('companies.form.weekday.' + day);
  }

  ngOnInit(): void {
    // Loads the communities first and only *then* resolves - patching the
    // company onto the form before this resolves would race the mat-select's
    // options (still empty) against the value, and the community could end
    // up not shown as selected. Chaining with switchMap guarantees the
    // options exist by the time we patch the value below.
    const communities$ = this.communityService.list(0, 100).pipe(
      tap(page => (this.communities = page.content)),
      finalize(() => (this.communitiesLoading = false))
    );

    this.form.controls.ofereceTreinamentoPresencial.valueChanges.subscribe(offers => {
      if (!offers) {
        this.form.patchValue({
          diasTreinamentoPresencial: [],
          horarioTreinamentoInicio: '',
          horarioTreinamentoFim: ''
        });
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.companyId = Number(idParam);
      this.loading = true;
      communities$
        .pipe(
          switchMap(() => this.companyService.getById(this.companyId!)),
          finalize(() => (this.loading = false))
        )
        .subscribe(company => this.form.patchValue(company));
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
      ? this.companyService.update(this.companyId!, value)
      : this.companyService.create(value);

    request$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        const key = this.isEditMode ? 'companies.notifications.updated' : 'companies.notifications.created';
        this.notification.success(this.translate.instant(key));
        this.router.navigate(['/companies']);
      }
    });
  }
}
