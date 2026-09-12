import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

/**
 * Sits on the bare '' route. Never lets the app render anything at '/' -
 * it always redirects to the signed-in user's home area:
 * ADMIN -> /dashboard, EMPRESARIO -> /talentos, ALUNO -> /courses.
 */
export const homeRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthenticationService);
  const router = inject(Router);
  return router.parseUrl(auth.getHomeRoute());
};
