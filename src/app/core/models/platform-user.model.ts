import { AppRole } from './role.model';

/**
 * A registered platform user, created from the Administration section.
 * This is the pool of accounts shown when linking a "talento" (Student)
 * to an existing user via the search-filterable select on the talent
 * form - see `PlatformUserService` / `MockStoreService.listUsers`.
 */
export interface PlatformUser {
  id: number;
  fullName: string;
  email: string;
  role: AppRole;
  phone?: string;
  address?: string;
  /**
   * The community this user's data is scoped to. Not applicable to
   * ROLE_ADMIN, who can see every community. Used by
   * `CurrentUserContextService` to filter Company/Course/Student lists
   * for non-admin roles.
   */
  communityId?: number;
  /** The company this empresario user is linked to. */
  companyId?: number;
}

export interface PlatformUserFormValue {
  fullName: string;
  email: string;
  role: AppRole;
  phone?: string;
  address?: string;
  communityId?: number;
  companyId?: number;
}
