import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfileDetails, ProfileFormValue } from '../models/profile.model';
import { MockStoreService } from '../mock/mock-store.service';

/**
 * TEMPORARY MOCK service for the logged-in person's own "Meu perfil" edits
 * (name/email/address/phone). Backed by MockStoreService - see that file's
 * `getOwnProfile`/`updateOwnProfile` for why this isn't wired to Keycloak
 * or a real backend endpoint yet.
 */
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private store = inject(MockStoreService);

  get(defaults: ProfileDetails): Observable<ProfileDetails> {
    return this.store.getOwnProfile(defaults);
  }

  update(value: ProfileFormValue): Observable<ProfileDetails> {
    return this.store.updateOwnProfile(value);
  }
}
