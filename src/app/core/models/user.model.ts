import { EntityStatus } from './status.model';

export interface AppUser {
  id: number;
  identityProviderId: string;
  firstName: string;
  lastName?: string;
  email: string;
  status: EntityStatus;
  communityId: number;
}

export interface UserProfile {
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  role?: string;
}
