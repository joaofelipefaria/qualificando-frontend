import { EntityStatus } from './status.model';

/** ONLINE modules are self-paced content; PRESENCIAL modules happen in person, run by a partner company. */
export type ModuleModality = 'ONLINE' | 'PRESENCIAL';

/** A single meeting/date within a presencial module's agenda. */
export interface PresencialSession {
  id: number;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
}

export interface PresencialSessionFormValue {
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
}

/** Present only when modality === 'PRESENCIAL'. */
export interface PresencialInfo {
  companyId: number;
  companyName?: string;
  sessions: PresencialSession[];
}

export interface CourseModule {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  order: number;
  modality: ModuleModality;
  status: EntityStatus;
  presencial?: PresencialInfo;
  /** Gamification points awarded to a student when this module is completed. */
  points?: number;
}

export interface CourseModuleFormValue {
  title: string;
  description?: string;
  order: number;
  modality: ModuleModality;
  status: EntityStatus;
  /** Required when modality === 'PRESENCIAL'. */
  presencialCompanyId?: number | null;
  /** Gamification points awarded to a student when this module is completed. */
  points?: number | null;
}
