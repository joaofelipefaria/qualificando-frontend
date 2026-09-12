import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { homeRedirectGuard } from './core/guards/home-redirect.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AppRole } from './core/models/role.model';
import { LoginComponent } from './features/auth/pages/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // No default page for everyone: each role has its own home area.
      { path: '', pathMatch: 'full', canActivate: [homeRedirectGuard], children: [] },
      {
        path: 'dashboard',
        canActivate: [roleGuard(AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.ALUNO, AppRole.PODER_PUBLICO)],
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'admin',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/admin/pages/admin-home/admin-home.component').then(m => m.AdminHomeComponent)
      },
      {
        path: 'admin/users/new',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/admin/pages/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'admin/users/:id/edit',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/admin/pages/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'parceiros',
        canActivate: [roleGuard(AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.ALUNO, AppRole.PODER_PUBLICO)],
        loadComponent: () => import('./features/marketing/partners-list/partners-list.component').then(m => m.PartnersListComponent)
      },
      {
        path: 'communities',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/communities/pages/community-list/community-list.component').then(m => m.CommunityListComponent)
      },
      {
        path: 'communities/new',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/communities/pages/community-form/community-form.component').then(m => m.CommunityFormComponent)
      },
      {
        path: 'communities/:id/edit',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/communities/pages/community-form/community-form.component').then(m => m.CommunityFormComponent)
      },
      {
        path: 'communities/:id',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/communities/pages/community-detail/community-detail.component').then(m => m.CommunityDetailComponent)
      },
      // "Talentos": the students area - companies, público and admins manage/browse it.
      {
        path: 'talentos',
        canActivate: [roleGuard(AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.PODER_PUBLICO)],
        loadComponent: () => import('./features/students/pages/student-list/student-list.component').then(m => m.StudentListComponent)
      },
      {
        path: 'talentos/new',
        canActivate: [roleGuard(AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.PODER_PUBLICO)],
        loadComponent: () => import('./features/students/pages/student-form/student-form.component').then(m => m.StudentFormComponent)
      },
      {
        path: 'talentos/:id/edit',
        canActivate: [roleGuard(AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.PODER_PUBLICO)],
        loadComponent: () => import('./features/students/pages/student-form/student-form.component').then(m => m.StudentFormComponent)
      },
      {
        path: 'talentos/:id',
        canActivate: [roleGuard(AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.PODER_PUBLICO)],
        loadComponent: () => import('./features/students/pages/student-detail/student-detail.component').then(m => m.StudentDetailComponent)
      },
      {
        path: 'companies',
        canActivate: [roleGuard(AppRole.ADMIN, AppRole.ALUNO, AppRole.PODER_PUBLICO)],
        loadComponent: () => import('./features/companies/pages/company-list/company-list.component').then(m => m.CompanyListComponent)
      },
      {
        path: 'companies/new',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/companies/pages/company-form/company-form.component').then(m => m.CompanyFormComponent)
      },
      {
        path: 'companies/:id/edit',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/companies/pages/company-form/company-form.component').then(m => m.CompanyFormComponent)
      },
      {
        path: 'companies/:id',
        canActivate: [roleGuard(AppRole.ADMIN, AppRole.ALUNO, AppRole.PODER_PUBLICO)],
        loadComponent: () => import('./features/companies/pages/company-detail/company-detail.component').then(m => m.CompanyDetailComponent)
      },
      // Jobs: read-only listing for now, browsed by everyone (see JobDataSource).
      {
        path: 'vagas',
        canActivate: [roleGuard(AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.ALUNO, AppRole.PODER_PUBLICO)],
        loadComponent: () => import('./features/jobs/pages/job-list/job-list.component').then(m => m.JobListComponent)
      },
      // Courses: browsed by students/companies/público, managed by admins.
      {
        path: 'courses',
        canActivate: [roleGuard(AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.ALUNO, AppRole.PODER_PUBLICO)],
        loadComponent: () => import('./features/courses/pages/course-list/course-list.component').then(m => m.CourseListComponent)
      },
      {
        path: 'courses/new',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/courses/pages/course-form/course-form.component').then(m => m.CourseFormComponent)
      },
      {
        path: 'courses/:id/edit',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/courses/pages/course-form/course-form.component').then(m => m.CourseFormComponent)
      },
      {
        path: 'courses/:id',
        canActivate: [roleGuard(AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.ALUNO, AppRole.PODER_PUBLICO)],
        loadComponent: () => import('./features/courses/pages/course-detail/course-detail.component').then(m => m.CourseDetailComponent)
      },
      {
        path: 'courses/:courseId/enroll',
        canActivate: [roleGuard(AppRole.ADMIN, AppRole.EMPRESARIO)],
        loadComponent: () => import('./features/courses/pages/course-enroll/course-enroll.component').then(m => m.CourseEnrollComponent)
      },
      // Course modules: management (create/edit/content) is ADMIN-only; viewing is
      // open to whoever can view the course itself.
      {
        path: 'courses/:courseId/modules/new',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/courses/pages/course-module-form/course-module-form.component').then(m => m.CourseModuleFormComponent)
      },
      {
        path: 'courses/:courseId/modules/:moduleId/edit',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/courses/pages/course-module-form/course-module-form.component').then(m => m.CourseModuleFormComponent)
      },
      {
        path: 'courses/:courseId/modules/:moduleId/content',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/courses/pages/course-module-content/course-module-content.component').then(m => m.CourseModuleContentComponent)
      },
      {
        path: 'courses/:courseId/modules/:moduleId',
        canActivate: [roleGuard(AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.ALUNO, AppRole.PODER_PUBLICO)],
        loadComponent: () => import('./features/courses/pages/course-module-detail/course-module-detail.component').then(m => m.CourseModuleDetailComponent)
      },

      // Courses Tech: technology-area courses ("Carreira Tech"), fully independent
      // from the regular courses feature (separate model, datasource, service, pages).
      {
        path: 'courses-tech',
        canActivate: [roleGuard(AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.ALUNO, AppRole.PODER_PUBLICO)],
        loadComponent: () => import('./features/courses-tech/pages/course-tech-list/course-tech-list.component').then(m => m.CourseTechListComponent)
      },
      {
        path: 'courses-tech/new',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/courses-tech/pages/course-tech-form/course-tech-form.component').then(m => m.CourseTechFormComponent)
      },
      {
        path: 'courses-tech/:id/edit',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/courses-tech/pages/course-tech-form/course-tech-form.component').then(m => m.CourseTechFormComponent)
      },
      {
        path: 'courses-tech/:id',
        canActivate: [roleGuard(AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.ALUNO, AppRole.PODER_PUBLICO)],
        loadComponent: () => import('./features/courses-tech/pages/course-tech-detail/course-tech-detail.component').then(m => m.CourseTechDetailComponent)
      },
      {
        path: 'courses-tech/:courseId/enroll',
        canActivate: [roleGuard(AppRole.ADMIN, AppRole.EMPRESARIO)],
        loadComponent: () => import('./features/courses-tech/pages/course-tech-enroll/course-tech-enroll.component').then(m => m.CourseTechEnrollComponent)
      },
      {
        path: 'courses-tech/:courseId/modules/new',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/courses-tech/pages/course-tech-module-form/course-tech-module-form.component').then(m => m.CourseTechModuleFormComponent)
      },
      {
        path: 'courses-tech/:courseId/modules/:moduleId/edit',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/courses-tech/pages/course-tech-module-form/course-tech-module-form.component').then(m => m.CourseTechModuleFormComponent)
      },
      {
        path: 'courses-tech/:courseId/modules/:moduleId/content',
        canActivate: [roleGuard(AppRole.ADMIN)],
        loadComponent: () => import('./features/courses-tech/pages/course-tech-module-content/course-tech-module-content.component').then(m => m.CourseTechModuleContentComponent)
      },
      {
        path: 'courses-tech/:courseId/modules/:moduleId',
        canActivate: [roleGuard(AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.ALUNO, AppRole.PODER_PUBLICO)],
        loadComponent: () => import('./features/courses-tech/pages/course-tech-module-detail/course-tech-module-detail.component').then(m => m.CourseTechModuleDetailComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
