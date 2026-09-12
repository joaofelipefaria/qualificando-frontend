import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { AppRole } from '../models/role.model';

/**
 * Restricts a route to users holding at least one of the given realm roles.
 * Usage in app.routes.ts: canActivate: [roleGuard(AppRole.ADMIN)]
 * or, for a route shared by more than one profile: roleGuard(AppRole.ADMIN, AppRole.EMPRESARIO)
 *
 * Remember (guidelines §15): this is a UX convenience only, the backend
 * remains the actual source of truth for authorization.
 */
export function roleGuard(...requiredRoles: AppRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthenticationService);
    const router = inject(Router);

    if (auth.hasAnyRole(...requiredRoles)) {
      return true;
    }

    // Don't hardcode a single fallback route: someone without ADMIN might
    // still be blocked from /dashboard, but sending them back to /dashboard
    // would just bounce them here again. Send each user to THEIR home instead.
    router.navigateByUrl(auth.getHomeRoute());
    return false;
  };
}
