import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize, forkJoin } from 'rxjs';
import { CourseContentGateway } from '../../services/course-content.gateway';
import { NotificationService } from '../../../../core/services/notification.service';
import { ModuleContentBlock, TextContentBlock, MediaContentBlock } from '../../../../core/models/module-content.model';
import { MediaAsset, MediaType } from '../../../../core/models/media-asset.model';
import { CourseModule } from '../../../../core/models/course-module.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-course-module-content',
  standalone: true,
  imports: [
    NgIf, NgFor, RouterLink, ReactiveFormsModule, DragDropModule,
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatTabsModule, MatProgressSpinnerModule, MatDialogModule,
    LoadingSpinnerComponent, EmptyStateComponent, TranslateModule
  ],
  templateUrl: './course-module-content.component.html',
  styleUrl: './course-module-content.component.scss'
})
export class CourseModuleContentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private gateway = inject(CourseContentGateway);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  courseId!: number;
  moduleId!: number;
  module: CourseModule | null = null;
  blocks: ModuleContentBlock[] = [];
  media: MediaAsset[] = [];
  mediaById: Record<number, MediaAsset> = {};
  loading = true;
  savingText = false;
  savingMedia = false;
  uploading = false;

  /**
   * Reordering (drag'n'drop or the up/down arrows) only changes `blocks`
   * in memory - it's NOT sent to the gateway until "Salvar" is clicked
   * (see `saveOrder`). This flag drives that button's enabled state.
   */
  orderDirty = false;
  savingOrder = false;

  textForm = this.fb.group({
    title: [''],
    body: ['', Validators.required]
  });

  mediaForm = this.fb.group({
    mediaId: [null as number | null, Validators.required],
    caption: ['']
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
      media: this.gateway.listMedia(this.courseId)
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(({ module, blocks, media }) => {
        this.module = module;
        this.blocks = blocks;
        this.media = media;
        this.mediaById = Object.fromEntries(media.map(m => [m.id, m]));
        this.orderDirty = false;
      });
  }

  textOf(block: ModuleContentBlock): TextContentBlock | null {
    return block.type === 'TEXT' ? block : null;
  }

  mediaOf(block: ModuleContentBlock): MediaContentBlock | null {
    return block.type === 'MEDIA' ? block : null;
  }

  addText(): void {
    if (this.textForm.invalid) {
      this.textForm.markAllAsTouched();
      return;
    }
    this.savingText = true;
    const value = this.textForm.getRawValue() as any;
    this.gateway.addTextBlock(this.moduleId, value)
      .pipe(finalize(() => (this.savingText = false)))
      .subscribe(() => {
        this.notification.success(this.translate.instant('courseModules.content.textAdded'));
        this.textForm.reset();
        this.fetch();
      });
  }

  addMedia(): void {
    if (this.mediaForm.invalid) {
      this.mediaForm.markAllAsTouched();
      return;
    }
    this.savingMedia = true;
    const { mediaId, caption } = this.mediaForm.getRawValue();
    this.gateway.addMediaBlock(this.moduleId, mediaId!, caption ?? undefined)
      .pipe(finalize(() => (this.savingMedia = false)))
      .subscribe(() => {
        this.notification.success(this.translate.instant('courseModules.content.mediaAdded'));
        this.mediaForm.reset();
        this.fetch();
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const type = this.guessMediaType(file);
    this.uploading = true;
    this.gateway.uploadMedia(this.courseId, file, type)
      .pipe(finalize(() => {
        this.uploading = false;
        input.value = '';
      }))
      .subscribe({
        next: asset => {
          this.notification.success(this.translate.instant('courseModules.content.uploadSuccess'));
          this.media = [...this.media, asset];
          this.mediaById[asset.id] = asset;
          this.mediaForm.patchValue({ mediaId: asset.id });
        },
        error: () => this.notification.error(this.translate.instant('courseModules.content.uploadError'))
      });
  }

  private guessMediaType(file: File): MediaType {
    if (file.type.startsWith('image/')) return 'IMAGE';
    if (file.type.startsWith('video/')) return 'VIDEO';
    return 'DOCUMENT';
  }

  moveBlock(block: ModuleContentBlock, direction: -1 | 1): void {
    const index = this.blocks.findIndex(b => b.id === block.id);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= this.blocks.length) return;

    const reordered = [...this.blocks];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    this.blocks = reordered;
    this.orderDirty = true;
  }

  onDrop(event: CdkDragDrop<ModuleContentBlock[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const reordered = [...this.blocks];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    this.blocks = reordered;
    this.orderDirty = true;
  }

  saveOrder(): void {
    if (!this.orderDirty) return;
    this.savingOrder = true;
    this.gateway.reorderContentBlocks(this.moduleId, this.blocks.map(b => b.id))
      .pipe(finalize(() => (this.savingOrder = false)))
      .subscribe(() => {
        this.orderDirty = false;
        this.notification.success(this.translate.instant('courseModules.content.orderSaved'));
      });
  }

  deleteBlock(block: ModuleContentBlock): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('courseModules.content.deleteBlockTitle'),
        message: this.translate.instant('courseModules.content.deleteBlockMessage')
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.gateway.deleteContentBlock(this.moduleId, block.id).subscribe(() => {
        this.notification.success(this.translate.instant('courseModules.content.blockDeleted'));
        this.fetch();
      });
    });
  }
}
