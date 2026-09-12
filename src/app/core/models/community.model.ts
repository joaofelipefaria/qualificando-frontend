import { EntityStatus } from './status.model';

export interface Community {
  id: number;
  name: string;
  description?: string;
  status: EntityStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunityFormValue {
  name: string;
  description?: string;
  status: EntityStatus;
}
