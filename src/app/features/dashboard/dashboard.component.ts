import { Component, inject, OnInit } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { DashboardService, DashboardSummary, DashboardSummaryOptions } from './dashboard.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { Course } from '../../core/models/course.model';
import { AuthenticationService } from '../../core/authentication/authentication.service';

interface SummaryCard {
  key: keyof DashboardSummaryOptions;
  labelKey: string;
  icon: string;
  route: string;
  accent: string;
}

/**
 * One entry per potential dashboard card. Each mirrors the role guard on
 * its `route` in app.routes.ts - a role that can't open the route doesn't
 * get the card, and (see ngOnInit) its underlying data isn't even fetched.
 */
const ALL_CARDS: SummaryCard[] = [
  { key: 'communities', labelKey: 'dashboard.cardCommunities', icon: 'groups', route: '/communities', accent: 'accent-blue' },
  { key: 'students', labelKey: 'dashboard.cardStudents', icon: 'school', route: '/talentos', accent: 'accent-green' },
  { key: 'companies', labelKey: 'dashboard.cardCompanies', icon: 'business', route: '/companies', accent: 'accent-orange' },
  { key: 'courses', labelKey: 'dashboard.cardCourses', icon: 'menu_book', route: '/courses', accent: 'accent-purple' }
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, RouterLink, MatCardModule, MatIconModule, LoadingSpinnerComponent, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private auth = inject(AuthenticationService);

  loading = true;
  cards: (SummaryCard & { value: number })[] = [];
  recentCourses: Course[] = [];

  ngOnInit(): void {
    // /communities is ADMIN-only, /companies excludes EMPRESARIO - same
    // guards as app.routes.ts. isAdmin() sees every card either way.
    const isAdmin = this.auth.isAdmin();
    const options: DashboardSummaryOptions = {
      communities: isAdmin,
      students: isAdmin || this.auth.isEmpresario() || this.auth.isPoderPublico(),
      companies: isAdmin || this.auth.isAluno() || this.auth.isPoderPublico(),
      courses: true
    };
    const visibleCards = ALL_CARDS.filter(card => options[card.key]);

    this.dashboardService.getSummary(options)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (summary: DashboardSummary) => {
          const values: Record<keyof DashboardSummaryOptions, number> = {
            communities: summary.communitiesCount,
            students: summary.studentsCount,
            companies: summary.companiesCount,
            courses: summary.coursesCount
          };
          this.cards = visibleCards.map(card => ({ ...card, value: values[card.key] }));
        },
        error: () => {
          this.cards = [];
        }
      });

    this.dashboardService.getRecentCourses().subscribe({
      next: page => (this.recentCourses = page.content),
      error: () => (this.recentCourses = [])
    });
  }
}
