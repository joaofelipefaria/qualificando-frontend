import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
import { CommunityService } from '../communities/services/community.service';
import { StudentService } from '../students/services/student.service';
import { CompanyService } from '../companies/services/company.service';
import { CourseService } from '../courses/services/course.service';
import { Page } from '../../core/models/page.model';

export interface DashboardSummary {
  communitiesCount: number;
  studentsCount: number;
  companiesCount: number;
  coursesCount: number;
}

/** Which stat cards to actually fetch - see DashboardComponent, this mirrors each card's route guard. */
export interface DashboardSummaryOptions {
  communities: boolean;
  students: boolean;
  companies: boolean;
  courses: boolean;
}

const EMPTY_PAGE: Page<unknown> = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 };

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private communityService = inject(CommunityService);
  private studentService = inject(StudentService);
  private companyService = inject(CompanyService);
  private courseService = inject(CourseService);

  /**
   * Only calls the services for the cards the current role can actually
   * see/open (see DashboardComponent) - e.g. a partner (EMPRESARIO) has no
   * access to /communities, so `options.communities` is false and this
   * never calls CommunityService, which otherwise fired a `/communities`
   * request nobody needed.
   */
  getSummary(options: DashboardSummaryOptions): Observable<DashboardSummary> {
    return forkJoin({
      communities: options.communities ? this.communityService.list(0, 1) : of(EMPTY_PAGE),
      students: options.students ? this.studentService.list(0, 1) : of(EMPTY_PAGE),
      companies: options.companies ? this.companyService.list(0, 1) : of(EMPTY_PAGE),
      courses: options.courses ? this.courseService.list(0, 5) : of(EMPTY_PAGE)
    }).pipe(
      map(({ communities, students, companies, courses }) => ({
        communitiesCount: communities.totalElements,
        studentsCount: students.totalElements,
        companiesCount: companies.totalElements,
        coursesCount: courses.totalElements
      }))
    );
  }

  getRecentCourses() {
    return this.courseService.list(0, 5);
  }
}
