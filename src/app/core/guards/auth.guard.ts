import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthenticationService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  // Authentication must be initiated from the login screen,
  // where the user provides credentials.
  return router.parseUrl('/login');
};
