import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize, forkJoin } from 'rxjs';
import { CourseContentGateway } from '../../services/course-content.gateway';
import { CompanyService } from '../../../companies/services/company.service';
import { AuthenticationService } from '../../../../core/authentication/authentication.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CourseModule, PresencialSession } from '../../../../core/models/course-module.model';
import { MediaAsset } from '../../../../core/models/media-asset.model';
import { ModuleContentBlock, TextContentBlock, MediaContentBlock } from '../../../../core/models/module-content.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-course-module-detail',
  standalone: true,
  imports: [
    NgIf, NgFor, RouterLink, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatListModule, MatDialogModule,
    LoadingSpinnerComponent, EmptyStateComponent, TranslateModule
  ],
  templateUrl: './course-module-detail.component.html',
  styleUrl: './course-module-detail.component.scss'
})
export class CourseModuleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private gateway = inject(CourseContentGateway);
  private companyService = inject(CompanyService);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  auth = inject(AuthenticationService);

  courseId!: number;
  moduleId!: number;
  module: CourseModule | null = null;
  companyName = '';
  blocks: ModuleContentBlock[] = [];
  media: Record<number, MediaAsset> = {};
  loading = true;
  savingSession = false;
  addingSession = false;

  sessionForm = this.fb.group({
    date: ['', Validators.required],
    startTime: [''],
    endTime: [''],
    location: [''],
    notes: ['']
  });

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    this.moduleId = Number(this.route.snapshot.paramMap.get('moduleId'));
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    forkJoin({
      module: this.gateway.getModule(this.moduleId),
      blocks: this.gateway.listContentBlocks(this.moduleId),
      mediaList: this.gateway.listMedia(this.courseId)
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(({ module, blocks, mediaList }) => {
        this.module = module;
        this.blocks = blocks;
        this.media = Object.fromEntries(mediaList.map(m => [m.id, m]));

        if (module.presencial) {
          this.companyService.getById(module.presencial.companyId).subscribe({
            next: company => (this.companyName = company.name),
            error: () => (this.companyName = '')
          });
        }
      });
  }

  textOf(block: ModuleContentBlock): TextContentBlock | null {
    return block.type === 'TEXT' ? block : null;
  }

  mediaOf(block: ModuleContentBlock): MediaContentBlock | null {
    return block.type === 'MEDIA' ? block : null;
  }

  mediaFor(block: ModuleContentBlock): MediaAsset | null {
    return block.type === 'MEDIA' ? this.media[block.mediaId] ?? null : null;
  }

  toggleAddSession(): void {
    this.addingSession = !this.addingSession;
    if (this.addingSession) this.sessionForm.reset();
  }

  submitSession(): void {
    if (this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched();
      return;
    }
    this.savingSession = true;
    const value = this.sessionForm.getRawValue() as any;
    this.gateway.addSession(this.moduleId, value)
      .pipe(finalize(() => (this.savingSession = false)))
      .subscribe(() => {
        this.notification.success(this.translate.instant('courseModules.detail.sessionAdded'));
        this.addingSession = false;
        this.fetch();
      });
  }

  deleteSession(session: PresencialSession): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('courseModules.detail.deleteSessionTitle'),
        message: this.translate.instant('courseModules.detail.deleteSessionMessage', { date: session.date })
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.gateway.deleteSession(this.moduleId, session.id).subscribe(() => {
        this.notification.success(this.translate.instant('courseModules.detail.sessionDeleted'));
        this.fetch();
      });
    });
  }

  deleteModule(): void {
    if (!this.module) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('courseModules.deleteDialog.title'),
        message: this.translate.instant('courseModules.deleteDialog.message', { name: this.module.title })
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.gateway.deleteModule(this.moduleId).subscribe(() => {
        this.notification.success(this.translate.instant('courseModules.notifications.deleted'));
        window.history.back();
      });
    });
  }
}
