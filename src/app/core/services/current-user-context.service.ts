import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { AuthenticationService } from '../authentication/authentication.service';
import { PlatformUserService } from './platform-user.service';

/**
 * Resolves which community the CURRENT logged-in person's data should be
 * scoped to, so CompanyService/CourseService/StudentService can filter
 * their lists accordingly (see those services' `list()`).
 *
 *  - ROLE_ADMIN sees every community: `getCommunityId()` resolves `null`.
 *  - Every other role is scoped to their own community, resolved by
 *    matching their Keycloak email against the registered `PlatformUser`
 *    pool (see Administration > Usuários).
 *  - If a non-admin has no community assigned yet (or no matching
 *    PlatformUser record at all, e.g. a Keycloak account created without
 *    going through Administration), falls back to community id 1
 *    (Caldas Novas) rather than showing nothing.
 *
 * TODO: once quali-core-api issues tokens carrying the community as a JWT
 * claim, resolve it directly from `AuthenticationService.getUserProfile()`
 * instead of this email-lookup - the public API (`getCommunityId()`) stays
 * the same either way.
 */
@Injectable({ providedIn: 'root' })
export class CurrentUserContextService {
  static readonly DEFAULT_COMMUNITY_ID = 1;

  private auth = inject(AuthenticationService);
  private platformUsers = inject(PlatformUserService);

  /**
   * `null` means "no restriction, show every community" (admins only).
   * Any other value is the single community id the caller must filter by.
   */
  getCommunityId(): Observable<number | null> {
    if (this.auth.isAdmin()) {
      return of(null);
    }

    const email = this.auth.getUserProfile().email;
    if (!email) {
      return of(CurrentUserContextService.DEFAULT_COMMUNITY_ID);
    }

    return this.platformUsers
      .getByEmail(email)
      .pipe(map(user => user?.communityId ?? CurrentUserContextService.DEFAULT_COMMUNITY_ID));
  }
}
