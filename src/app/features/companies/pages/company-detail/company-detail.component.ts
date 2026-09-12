import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { CompanyService } from '../../services/company.service';
import { Company } from '../../../../core/models/company.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, LoadingSpinnerComponent, TranslateModule],
  templateUrl: './company-detail.component.html',
  styleUrl: '../../../communities/pages/community-detail/community-detail.component.scss'
})
export class CompanyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private companyService = inject(CompanyService);

  company: Company | null = null;
  loading = true;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.companyService.getById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(company => (this.company = company));
  }
}
