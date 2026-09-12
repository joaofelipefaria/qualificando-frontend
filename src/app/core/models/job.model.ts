import { EntityStatus } from './status.model';

/** Type of employment relationship offered by the job. */
export type JobType = 'CLT' | 'ESTAGIO' | 'APRENDIZ' | 'TEMPORARIO';

/** Where the work takes place. */
export type JobWorkMode = 'PRESENCIAL' | 'REMOTO' | 'HIBRIDO';

export interface Job {
  id: number;
  communityId: number;
  /** The `Company` (see company.model.ts) that posted this job. */
  companyId: number;
  title: string;
  description?: string;
  /** Where the work takes place, e.g. "Caldas Novas, GO". */
  location?: string;
  type: JobType;
  workMode: JobWorkMode;
  /** Whether the job is reserved for people with disabilities (PCD). */
  isPcd?: boolean;
  /** ISO date string, e.g. "2026-07-01T09:00:00Z". */
  publishedAt: string;
  status: EntityStatus;
}

/**
 * Shape submitted by the job creation form. `communityId` is NOT set by the
 * form itself - it is auto-resolved by `JobService.create` from the current
 * user's community context.
 */
export interface JobFormValue {
  communityId?: number | null;
  companyId: number;
  title: string;
  description?: string;
  location?: string;
  type: JobType;
  workMode: JobWorkMode;
  isPcd?: boolean;
  status: EntityStatus;
}
