import { Component, inject, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
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
import { CommunityService } from '../../services/community.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-community-form',
  standalone: true,
  imports: [
    NgIf, RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, TranslateModule
  ],
  templateUrl: './community-form.component.html',
  styleUrl: './community-form.component.scss'
})
export class CommunityFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private communityService = inject(CommunityService);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);

  communityId: number | null = null;
  saving = false;
  loading = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    status: ['ACTIVE', Validators.required]
  });

  get isEditMode(): boolean {
    return this.communityId !== null;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.communityId = Number(idParam);
      this.loading = true;
      this.communityService.getById(this.communityId)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe(community => {
          this.form.patchValue(community);
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
    const request$ = this.isEditMode
      ? this.communityService.update(this.communityId!, value)
      : this.communityService.create(value);

    request$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        const key = this.isEditMode ? 'communities.notifications.updated' : 'communities.notifications.created';
        this.notification.success(this.translate.instant(key));
        this.router.navigate(['/communities']);
      }
    });
  }
}
