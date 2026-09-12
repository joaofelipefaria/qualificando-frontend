import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { CourseTechContentGateway } from '../../services/course-tech-content.gateway';
import { AuthenticationService } from '../../../../core/authentication/authentication.service';
import { CourseModule } from '../../../../core/models/course-module.model';
import { MediaAsset } from '../../../../core/models/media-asset.model';
import { ModuleContentBlock, TextContentBlock, MediaContentBlock } from '../../../../core/models/module-content.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-course-tech-module-detail',
  standalone: true,
  imports: [
    NgIf, NgFor, RouterLink,
    MatButtonModule, MatIconModule, MatCardModule,
    LoadingSpinnerComponent, EmptyStateComponent, TranslateModule
  ],
  templateUrl: './course-tech-module-detail.component.html',
  styleUrl: './course-tech-module-detail.component.scss'
})
export class CourseTechModuleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private gateway = inject(CourseTechContentGateway);

  auth = inject(AuthenticationService);

  courseId!: number;
  moduleId!: number;
  module: CourseModule | null = null;
  blocks: ModuleContentBlock[] = [];
  media: Record<number, MediaAsset> = {};
  loading = true;

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    this.moduleId = Number(this.route.snapshot.paramMap.get('moduleId'));
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.gateway.getModule(this.moduleId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(module => (this.module = module));

    this.gateway.listContentBlocks(this.moduleId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(blocks => {
        this.blocks = blocks;
      });

    this.gateway.listMedia(this.courseId).subscribe(mediaList => {
      this.media = Object.fromEntries(mediaList.map(m => [m.id, m]));
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
}
