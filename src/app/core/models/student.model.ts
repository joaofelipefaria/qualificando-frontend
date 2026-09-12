import { EntityStatus } from './status.model';

export interface Student {
  id: number;
  /** Every talent belongs to a community, same as Course/Company. */
  communityId: number;
  /**
   * Optional: links the talent to an existing platform user account
   * (see `PlatformUser`). A talent can be registered without one.
   */
  userId?: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  education?: string;
  /** Course ids the talent expressed interest in - optional. */
  coursePreferences?: number[];
  status: EntityStatus;
  /** Whether the talent is a person with disabilities (PCD). */
  isPcd?: boolean;
  /** Free-text description of the disability - only meaningful when `isPcd` is true. */
  pcdDescription?: string;
  /**
   * Not returned by the backend yet - reserved for when profile photo
   * upload exists. Until then, UI falls back to an initials placeholder
   * (see StudentAvatarComponent).
   */
  photoUrl?: string;
}

export interface StudentFormValue {
  communityId: number;
  /**
   * Optional: links the talent to an existing platform user account. When
   * omitted, the talent is registered as a standalone record (mock: by
   * MockStoreService; real backend: however quali-courses-api decides to
   * handle a student created without a pre-existing user).
   */
  userId?: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  education?: string;
  coursePreferences?: number[];
  status: EntityStatus;
  /** Whether the talent is a person with disabilities (PCD). */
  isPcd?: boolean;
  /** Free-text description of the disability - only meaningful when `isPcd` is true. */
  pcdDescription?: string;
}
