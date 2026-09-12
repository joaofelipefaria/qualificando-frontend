import { Component, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule } from '@ngx-translate/core';
import { map, shareReplay } from 'rxjs';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { APP_VERSION } from '../../core/config/app-version';
import { AppRole } from '../../core/models/role.model';
import { PartnersTopBarComponent } from '../../features/marketing/partners-top-bar/partners-top-bar.component';

interface NavItem {
  labelKey: string;
  icon: string;
  route: string;
  /** Nav item is only shown to users holding at least one of these roles. */
  roles: AppRole[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    AsyncPipe, NgFor, NgIf,
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule,
    TranslateModule, PartnersTopBarComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  private auth = inject(AuthenticationService);
  private breakpointObserver = inject(BreakpointObserver);

  /** Shown next to the user menu in the toolbar - see main-layout.component.html. */
  readonly appVersion = APP_VERSION;

  private allNavItems: NavItem[] = [
    { labelKey: 'nav.dashboard', icon: 'dashboard', route: '/dashboard', roles: [AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.ALUNO, AppRole.PODER_PUBLICO] },
    { labelKey: 'nav.admin', icon: 'admin_panel_settings', route: '/admin', roles: [AppRole.ADMIN] },
    { labelKey: 'nav.communities', icon: 'groups', route: '/communities', roles: [AppRole.ADMIN] },
    { labelKey: 'nav.talentos', icon: 'school', route: '/talentos', roles: [AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.PODER_PUBLICO] },
    { labelKey: 'nav.companies', icon: 'business', route: '/companies', roles: [AppRole.ADMIN, AppRole.ALUNO, AppRole.PODER_PUBLICO] },
    { labelKey: 'nav.jobs', icon: 'work_outline', route: '/vagas', roles: [AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.ALUNO, AppRole.PODER_PUBLICO] },
    { labelKey: 'nav.courses', icon: 'menu_book', route: '/courses', roles: [AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.ALUNO, AppRole.PODER_PUBLICO] },
    { labelKey: 'nav.coursesTech', icon: 'computer', route: '/courses-tech', roles: [AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.ALUNO, AppRole.PODER_PUBLICO] },
    { labelKey: 'nav.partners', icon: 'handshake', route: '/parceiros', roles: [AppRole.ADMIN, AppRole.EMPRESARIO, AppRole.ALUNO, AppRole.PODER_PUBLICO] }
  ];

  get navItems(): NavItem[] {
    return this.allNavItems.filter(item => this.auth.hasAnyRole(...item.roles));
  }

  isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(result => result.matches),
    shareReplay(1)
  );

  profile = this.auth.getUserProfile();

  get displayName(): string {
    const { firstName, lastName, username } = this.profile;
    return firstName ? `${firstName} ${lastName ?? ''}`.trim() : username;
  }

  get initials(): string {
    const name = this.displayName;
    return name.slice(0, 2).toUpperCase();
  }

  logout(): void {
    this.auth.logout();
  }
}
