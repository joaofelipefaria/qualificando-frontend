import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { AuthenticationService } from '../../core/authentication/authentication.service';
import { ProfileService } from '../../core/services/profile.service';
import { ProfileDetails } from '../../core/models/profile.model';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    LoadingSpinnerComponent,
    TranslateModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthenticationService);
  private profileService = inject(ProfileService);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);
  private fb = inject(FormBuilder);

  userProfile = this.auth.getUserProfile();
  details: ProfileDetails | null = null;
  loading = true;
  editing = false;
  saving = false;

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    address: [''],
    phone: ['']
  });

  private get displayName(): string {
    const { firstName, lastName, username } = this.userProfile;

    return firstName
      ? `${firstName} ${lastName ?? ''}`.trim()
      : username;
  }

  get initials(): string {
    const name = this.details?.fullName || this.displayName;
    return name.slice(0, 2).toUpperCase();
  }

  ngOnInit(): void {
    const defaults: ProfileDetails = {
      fullName: this.displayName,
      email: this.userProfile.email ?? ''
    };

    this.profileService.get(defaults)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(details => {
        this.details = details;
        this.form.patchValue(details);
      });
  }

  startEditing(): void {
    if (this.details) {
      this.form.patchValue(this.details);
    }

    this.editing = true;
  }

  cancelEditing(): void {
    if (this.details) {
      this.form.patchValue(this.details);
    }

    this.editing = false;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    const value = this.form.getRawValue() as ProfileDetails;

    this.profileService.update(value)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe(details => {
        this.details = details;
        this.editing = false;
        this.notification.success(
          this.translate.instant('profile.updated')
        );
      });
  }
}
