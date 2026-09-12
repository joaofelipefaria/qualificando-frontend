import { EntityStatus } from './status.model';

export interface Course {
  id: number;
  communityId: number;
  name: string;
  description?: string;
  duration?: string;
  imageUrl?: string;
  status: EntityStatus;
  studentsCount?: number;
}

export interface CourseFormValue {
  communityId: number;
  name: string;
  description?: string;
  duration?: string;
  imageUrl?: string;
  status: EntityStatus;
}
