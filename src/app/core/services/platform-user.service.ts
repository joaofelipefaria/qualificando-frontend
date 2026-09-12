import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PlatformUser, PlatformUserFormValue } from '../models/platform-user.model';
import { MockStoreService } from '../mock/mock-store.service';

/**
 * TEMPORARY MOCK service exposing the pool of registered platform users
 * (created from the Administration section). Backed by the same
 * in-memory `MockStoreService` used by every other mocked entity - see
 * that file for the "single source of truth" rationale.
 *
 * Used by:
 *  - `AdminHomeComponent`, to list/register users.
 *  - `StudentFormComponent`, to power the search-filterable "linked
 *    user" select when registering/editing a talent.
 *
 * TODO: once quali-core-api exposes a real users endpoint, split this
 * into a `PlatformUserDataSource` (mock/http) pair, same pattern as
 * `StudentDataSource` - nothing calling this service needs to change.
 */
@Injectable({ providedIn: 'root' })
export class PlatformUserService {
  private store = inject(MockStoreService);

  list(search = ''): Observable<PlatformUser[]> {
    return this.store.listUsers(search);
  }

  getById(id: number): Observable<PlatformUser> {
    return this.store.getUser(id);
  }

  /**
   * Looks up a platform user by exact email match (case-insensitive).
   * Used by `CurrentUserContextService` to resolve the logged-in person's
   * community from their Keycloak email claim.
   */
  getByEmail(email: string): Observable<PlatformUser | undefined> {
    return of(this.store.findUserByEmail(email));
  }

  create(value: PlatformUserFormValue): Observable<PlatformUser> {
    return this.store.createUser(value);
  }

  update(id: number, value: PlatformUserFormValue): Observable<PlatformUser> {
    return this.store.updateUser(id, value);
  }
}
