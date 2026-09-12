import { Component, inject, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { CommunityService } from '../../services/community.service';
import { Community } from '../../../../core/models/community.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-community-detail',
  standalone: true,
  imports: [
    NgIf, RouterLink,
    MatCardModule, MatTabsModule, MatChipsModule, MatButtonModule, MatIconModule,
    LoadingSpinnerComponent, TranslateModule
  ],
  templateUrl: './community-detail.component.html',
  styleUrl: './community-detail.component.scss'
})
export class CommunityDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private communityService = inject(CommunityService);

  community: Community | null = null;
  loading = true;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.communityService.getById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(community => (this.community = community));
  }
}
