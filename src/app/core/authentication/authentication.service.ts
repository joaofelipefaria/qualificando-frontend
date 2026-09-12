import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FirebaseAuthService } from './firebase-auth.service';
import { UserProfile } from '../models/user.model';
import { AppRole } from '../models/role.model';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

interface UserProfileApiResponse {
  id: number;
  keycloakId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  communityId: number;
  communityName: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private firebaseAuth = inject(FirebaseAuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  private userRole: string | null = null;

  async init(): Promise<boolean> {
    const authenticated = await this.firebaseAuth.init();
    if (authenticated) {
      await this.fetchUserRole();
    }
    return authenticated;
  }

  async login(email?: string, password?: string): Promise<void> {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    await this.firebaseAuth.login(email, password);
    await this.fetchUserRole();
  }

  async logout(): Promise<void> {
    this.userRole = null;
    await this.firebaseAuth.logout();
    await this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.firebaseAuth.authenticated;
  }

  async getToken(): Promise<string | undefined> {
    return this.firebaseAuth.getToken();
  }

  private async fetchUserRole(): Promise<void> {
    try {
      const response = await firstValueFrom(this.http.get<UserProfileApiResponse>(
        `${environment.apiUrl}/users/me`
      ));
      this.userRole = response?.role ?? null;
    } catch (error) {
      console.error('Failed to fetch user role', error);
      this.userRole = null;
    }
  }

  hasRole(role: string): boolean {
    if (!this.isAuthenticated()) {
      return false;
    }

    if (!this.userRole) {
      return false;
    }

    return this.userRole === role;
  }

  hasAnyRole(...roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  isAdmin(): boolean {
    return this.hasRole(AppRole.ADMIN);
  }

  isEmpresario(): boolean {
    return this.hasRole(AppRole.EMPRESARIO);
  }

  isAluno(): boolean {
    return this.hasRole(AppRole.ALUNO);
  }

  isPoderPublico(): boolean {
    return this.hasRole(AppRole.PODER_PUBLICO);
  }

  getHomeRoute(): string {
    if (this.isAuthenticated()) {
      return '/dashboard';
    }

    return '/profile';
  }

  getUserProfile(): UserProfile {
    const user = this.firebaseAuth.user;

    if (!user) {
      return {
        username: 'unknown',
        roles: []
      };
    }

    return {
      username: user.displayName ?? user.email ?? user.uid,
      email: user.email ?? undefined,
      firstName: user.displayName?.split(' ')[0],
      lastName: user.displayName?.split(' ').slice(1).join(' ') || undefined,
      roles: this.userRole ? [this.userRole] : []
    };
  }

  get role(): string | null {
    return this.userRole;
  }
}
