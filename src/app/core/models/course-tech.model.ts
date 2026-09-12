import { EntityStatus } from './status.model';

export interface CourseTech {
  id: number;
  communityId: number;
  name: string;
  description?: string;
  duration?: string;
  imageUrl?: string;
  status: EntityStatus;
  studentsCount?: number;
}

export interface CourseTechFormValue {
  communityId: number;
  name: string;
  description?: string;
  duration?: string;
  imageUrl?: string;
  status: EntityStatus;
}
