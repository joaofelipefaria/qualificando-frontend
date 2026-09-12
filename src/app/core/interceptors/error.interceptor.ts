import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

/**
 * Centralized HTTP error handling (guidelines §22): translates common
 * failures into user-friendly snackbar messages instead of leaking stack
 * traces.
 *
 * IMPORTANT: this interceptor never calls auth.login() itself. Since the
 * app already enforces onLoad: 'login-required' at bootstrap, an
 * authenticated session is guaranteed before any component runs. If a 401
 * still occurs (e.g. an expired token, or a backend/issuer misconfiguration)
 * blindly forcing a fresh login here can create a redirect loop when
 * Keycloak's SSO session is still valid (it silently re-authenticates and
 * redirects straight back, so the failing call fires again immediately).
 * We surface the error instead and let the person decide to refresh.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);
  const translate = inject(TranslateService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        notification.error(translate.instant('errors.sessionInvalid'));
      } else if (error.status === 403) {
        notification.error(translate.instant('errors.forbidden'));
      } else if (error.status === 0) {
        notification.error(translate.instant('errors.unreachable'));
      } else if (error.status >= 500) {
        notification.error(translate.instant('errors.serverError'));
      } else if (error.status >= 400) {
        const message = error.error?.message ?? translate.instant('errors.genericRequestError');
        notification.error(message);
      }
      return throwError(() => error);
    })
  );
};
