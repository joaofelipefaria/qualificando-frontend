import { EntityStatus } from './status.model';

/** Days of the week the company can host presencial training, Mon-Sat. */
export type TrainingWeekday = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';

export interface Company {
  id: number;
  communityId: number;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  /** Whether the company offers presencial (in-person) training. */
  ofereceTreinamentoPresencial: boolean;
  /** Only meaningful when `ofereceTreinamentoPresencial` is true. */
  diasTreinamentoPresencial?: TrainingWeekday[];
  /** Only meaningful when `ofereceTreinamentoPresencial` is true, e.g. "08:00". */
  horarioTreinamentoInicio?: string;
  /** Only meaningful when `ofereceTreinamentoPresencial` is true, e.g. "12:00". */
  horarioTreinamentoFim?: string;
  status: EntityStatus;
}

export interface CompanyFormValue {
  communityId: number;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  ofereceTreinamentoPresencial: boolean;
  diasTreinamentoPresencial?: TrainingWeekday[];
  horarioTreinamentoInicio?: string;
  horarioTreinamentoFim?: string;
  status: EntityStatus;
}
