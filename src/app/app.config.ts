import { ApplicationConfig, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthenticationService } from './core/authentication/authentication.service';
import { environment } from '../environments/environment';
import { CourseContentGateway } from './features/courses/services/course-content.gateway';
import { CourseContentMockService } from './features/courses/services/course-content-mock.service';
import { CourseTechContentGateway } from './features/courses-tech/services/course-tech-content.gateway';
import { CourseTechContentMockService } from './features/courses-tech/services/course-tech-content-mock.service';
import { CommunityDataSource } from './features/communities/services/community.datasource';
import { CommunityHttpDataSource } from './features/communities/services/community-http.datasource';
import { CommunityMockDataSource } from './features/communities/services/community-mock.datasource';
import { CompanyDataSource } from './features/companies/services/company.datasource';
import { CompanyHttpDataSource } from './features/companies/services/company-http.datasource';
import { CompanyMockDataSource } from './features/companies/services/company-mock.datasource';
import { CourseDataSource } from './features/courses/services/course.datasource';
import { CourseHttpDataSource } from './features/courses/services/course-http.datasource';
import { CourseMockDataSource } from './features/courses/services/course-mock.datasource';
import { CourseTechDataSource } from './features/courses-tech/services/course-tech.datasource';
import { CourseTechHttpDataSource } from './features/courses-tech/services/course-tech-http.datasource';
import { CourseTechMockDataSource } from './features/courses-tech/services/course-tech-mock.datasource';
import { StudentDataSource } from './features/students/services/student.datasource';
import { StudentHttpDataSource } from './features/students/services/student-http.datasource';
import { StudentMockDataSource } from './features/students/services/student-mock.datasource';
import { JobDataSource } from './features/jobs/services/job.datasource';
import { JobMockDataSource } from './features/jobs/services/job-mock.datasource';

/**
 * Ensures Firebase authentication has finished initializing BEFORE Angular
 * renders anything, so the app knows whether the user is already
 * authenticated.
 */
function initializeAuthentication(auth: AuthenticationService) {
  return () => auth.init();
}

/**
 * ngx-translate loads translation files from /assets/i18n/<lang>.json via
 * plain HTTP, so it needs its own HttpClient instance (kept independent from
 * the app's authenticated HttpClient/interceptors).
 */
export function httpLoaderFactory(http: HttpClient): TranslateLoader {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

export const DEFAULT_LANGUAGE = 'pt-BR';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: DEFAULT_LANGUAGE,
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient]
        }
      })
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuthentication,
      deps: [AuthenticationService],
      multi: true
    },
    // Course modules/content/media currently run on an in-memory mock
    // (quali-courses-api doesn't expose these endpoints yet). Every
    // component depends on the abstract CourseContentGateway, so swapping
    // to the real backend later is just changing `useClass` here to a new
    // CourseContentHttpService - no other file needs to change.
    { provide: CourseContentGateway, useClass: CourseContentMockService },
    { provide: CourseTechContentGateway, useClass: CourseTechContentMockService },

    // Communities/Companies/Courses/Students: single switch, driven by
    // `environment.useMockApi` (see environment.ts), between the in-memory
    // MockStore and the real quali-core-api/quali-courses-api HTTP calls.
    // Every component depends only on the corresponding *Service
    // (CommunityService, CompanyService, CourseService, StudentService),
    // which in turn depends only on the abstract *DataSource below - so
    // flipping the flag is the only change needed anywhere in the app.
    { provide: CommunityDataSource, useClass: environment.useMockApi ? CommunityMockDataSource : CommunityHttpDataSource },
    { provide: CompanyDataSource, useClass: environment.useMockApi ? CompanyMockDataSource : CompanyHttpDataSource },
    { provide: CourseDataSource, useClass: environment.useMockApi ? CourseMockDataSource : CourseHttpDataSource },
    { provide: CourseTechDataSource, useClass: environment.useMockApi ? CourseTechMockDataSource : CourseTechHttpDataSource },
    { provide: StudentDataSource, useClass: environment.useMockApi ? StudentMockDataSource : StudentHttpDataSource },

    // Jobs: creation is supported (via the mock store) for EMPRESARIO/ADMIN
    // roles; listing remains community-scoped. There's no quali-core-api
    // endpoint (and no *HttpDataSource) yet - always backed by the mock
    // store. Once a real endpoint exists, add a JobHttpDataSource and
    // switch this the same way as the providers above.
    { provide: JobDataSource, useClass: JobMockDataSource }
  ]
};
