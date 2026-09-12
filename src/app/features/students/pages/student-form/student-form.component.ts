import { Component, inject, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, finalize, forkJoin, switchMap, tap } from 'rxjs';
import { StudentService } from '../../services/student.service';
import { PlatformUserService } from '../../../../core/services/platform-user.service';
import { CourseService } from '../../../courses/services/course.service';
import { CommunityService } from '../../../communities/services/community.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PlatformUser } from '../../../../core/models/platform-user.model';
import { Course } from '../../../../core/models/course.model';
import { Community } from '../../../../core/models/community.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    NgIf, NgFor, RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatAutocompleteModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatRadioModule, TranslateModule
  ],
  templateUrl: './student-form.component.html',
  styleUrl: '../../../communities/pages/community-form/community-form.component.scss'
})
export class StudentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);
  private platformUserService = inject(PlatformUserService);
  private courseService = inject(CourseService);
  private communityService = inject(CommunityService);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);

  studentId: number | null = null;
  saving = false;
  loading = false;

  communities: Community[] = [];
  communitiesLoading = true;

  /** Fixed set so the field is a combo instead of free text; mirrors the seed data in MockStoreService. */
  readonly educationLevels: string[] = [
    'Ensino Fundamental incompleto',
    'Ensino Fundamental completo',
    'Ensino Médio incompleto',
    'Ensino Médio completo',
    'Ensino Superior incompleto',
    'Ensino Superior completo',
    'Pós-graduação'
  ];

  courses: Course[] = [];

  /**
   * Registered platform users, used to link the talent to an existing
   * account. Typed to also hold a `PlatformUser` (not just the raw search
   * text) because Angular Material writes the selected option's value
   * straight into this control - see `displayUser` for how that renders.
   */
  linkedUserControl = new FormControl<string | PlatformUser | null>('');
  filteredUsers: PlatformUser[] = [];
  usersLoading = false;
  selectedUser: PlatformUser | null = null;

  form = this.fb.group({
    communityId: [null as number | null, Validators.required],
    userId: [null as number | null],
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    address: [''],
    education: [''],
    coursePreferences: [[] as number[]],
    status: ['ACTIVE', Validators.required],
    isPcd: [false],
    pcdDescription: ['']
  });

  get isEditMode(): boolean {
    return this.studentId !== null;
  }

  get isPcd(): boolean {
    return this.form.controls.isPcd.value === true;
  }

  ngOnInit(): void {
    // Description is only meaningful (and required) while the talent is
    // marked as PCD - toggle its validator live as the radio changes.
    this.form.controls.isPcd.valueChanges.subscribe(isPcd => {
      const descriptionControl = this.form.controls.pcdDescription;
      if (isPcd) {
        descriptionControl.setValidators([Validators.required]);
      } else {
        descriptionControl.clearValidators();
        descriptionControl.setValue('');
      }
      descriptionControl.updateValueAndValidity();
    });

    // Loads the communities first and only *then* resolves - patching the
    // student onto the form before this resolves would race the
    // mat-select's options (still empty) against the value, and the
    // community could end up not shown as selected. Chaining with
    // switchMap below (in the edit-mode branch) guarantees the options
    // exist by the time we patch the value.
    const communities$ = this.communityService.list(0, 100).pipe(
      tap(page => (this.communities = page.content)),
      finalize(() => (this.communitiesLoading = false))
    );

    this.courseService.list(0, 100).subscribe({
      next: result => (this.courses = result.content),
      error: () => (this.courses = [])
    });

    this.linkedUserControl.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap(term => {
          this.usersLoading = true;
          // A previously selected user's display text also flows through
          // here on selection - don't treat that as a new search.
          const search = typeof term === 'string' ? term : '';
          return this.platformUserService.list(search);
        }),
        finalize(() => (this.usersLoading = false))
      )
      .subscribe({
        next: users => {
          this.usersLoading = false;
          this.filteredUsers = users;
        },
        error: () => {
          this.usersLoading = false;
          this.filteredUsers = [];
        }
      });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.studentId = Number(idParam);
      this.loading = true;
      communities$
        .pipe(
          switchMap(() =>
            forkJoin({
              student: this.studentService.getById(this.studentId!),
              users: this.platformUserService.list()
            })
          ),
          finalize(() => (this.loading = false))
        )
        .subscribe(({ student, users }) => {
          this.form.patchValue({
            communityId: student.communityId,
            userId: student.userId ?? null,
            fullName: student.fullName,
            email: student.email,
            phone: student.phone,
            address: student.address,
            education: student.education,
            coursePreferences: student.coursePreferences ?? [],
            status: student.status,
            isPcd: student.isPcd ?? false,
            pcdDescription: student.pcdDescription ?? ''
          });
          const linked = users.find(u => u.id === student.userId) ?? null;
          this.linkedUserControl.setValue(linked, { emitEvent: false });
          this.selectUser(linked, { silent: true });
        });
    } else {
      communities$.subscribe({
        next: () => {
          if (this.communities.length === 1) {
            this.form.controls.communityId.setValue(this.communities[0].id);
          }
        },
        error: () => (this.communities = [])
      });
    }
  }

  displayUser = (user: PlatformUser | string | null): string => {
    if (!user || typeof user === 'string') {
      return '';
    }
    return `${user.fullName} (${user.email})`;
  };

  onUserSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectUser(event.option.value as PlatformUser);
  }

  clearLinkedUser(): void {
    this.linkedUserControl.setValue('', { emitEvent: false });
    this.selectUser(null);
  }

  private selectUser(user: PlatformUser | null, options: { silent?: boolean } = {}): void {
    this.selectedUser = user;
    this.form.patchValue({ userId: user?.id ?? null });
    if (!options.silent) {
      // Convenience: pre-fill name/email from the linked account when the
      // person hasn't typed anything in those fields yet.
      if (user && !this.form.controls.fullName.value) {
        this.form.controls.fullName.setValue(user.fullName);
      }
      if (user && !this.form.controls.email.value) {
        this.form.controls.email.setValue(user.email);
      }
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
      ? this.studentService.update(this.studentId!, value)
      : this.studentService.create(value);

    request$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        const key = this.isEditMode ? 'students.notifications.updated' : 'students.notifications.created';
        this.notification.success(this.translate.instant(key));
        this.router.navigate(['/talentos']);
      }
    });
  }
}
