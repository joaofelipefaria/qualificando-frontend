import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { CourseTechService } from '../../services/course-tech.service';
import { CourseTechContentGateway } from '../../services/course-tech-content.gateway';
import { CourseTech } from '../../../../core/models/course-tech.model';
import { CourseModule } from '../../../../core/models/course-module.model';
import { Student } from '../../../../core/models/student.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { StudentAvatarComponent } from '../../../../shared/components/student-avatar/student-avatar.component';
import { AuthenticationService } from '../../../../core/authentication/authentication.service';

@Component({
  selector: 'app-course-tech-detail',
  standalone: true,
  imports: [
    NgIf, NgFor, RouterLink,
    MatButtonModule, MatIconModule, MatListModule, MatChipsModule,
    LoadingSpinnerComponent, EmptyStateComponent, StudentAvatarComponent, TranslateModule
  ],
  templateUrl: './course-tech-detail.component.html',
  styleUrl: './course-tech-detail.component.scss'
})
export class CourseTechDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courseTechService = inject(CourseTechService);
  private courseTechContentGateway = inject(CourseTechContentGateway);

  auth = inject(AuthenticationService);

  course: CourseTech | null = null;
  students: Student[] = [];
  modules: CourseModule[] = [];
  modulesLoading = true;
  loading = true;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.courseTechService.getById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(course => (this.course = course));

    this.courseTechService.getEnrolledStudents(id).subscribe({
      next: students => (this.students = students),
      error: () => (this.students = [])
    });

    this.courseTechContentGateway.listModules(id)
      .pipe(finalize(() => (this.modulesLoading = false)))
      .subscribe({
        next: modules => (this.modules = modules),
        error: () => (this.modules = [])
      });
  }
}
