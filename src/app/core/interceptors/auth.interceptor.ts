import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthenticationService } from '../authentication/authentication.service';
import { environment } from '../../../environments/environment';

/**
 * Attaches "Authorization: Bearer <JWT>" to every request made to OUR API.
 * Requests to other origins are left untouched so we never leak the token
 * to third parties.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthenticationService);

  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  return from(auth.getToken()).pipe(
    switchMap(token => {
      if (!token) {
        return next(req);
      }

      return next(req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      }));
    })
  );
};
