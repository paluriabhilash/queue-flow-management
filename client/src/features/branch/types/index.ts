export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface WorkingHour {
  id: string;
  branchId: string;
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
  lunchStartTime?: string | null;
  lunchEndTime?: string | null;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Holiday {
  id: string;
  branchId: string;
  name: string;
  date: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  timeZone: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  organization?: {
    id: string;
    name: string;
    code: string;
  } | null;
  workingHours?: WorkingHour[];
  holidays?: Holiday[];
  _count?: {
    departments: number;
    counters: number;
    queues?: number;
  };
}

export interface CreateBranchInput {
  organizationId: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  timeZone?: string;
}

export interface UpdateBranchInput {
  name?: string;
  address?: string;
  phone?: string;
  timeZone?: string;
  isActive?: boolean;
}

export interface CreateWorkingHourInput {
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
  lunchStartTime?: string;
  lunchEndTime?: string;
  isClosed?: boolean;
}

export interface UpdateWorkingHourInput {
  openTime?: string;
  closeTime?: string;
  lunchStartTime?: string;
  lunchEndTime?: string;
  isClosed?: boolean;
}

export interface CreateHolidayInput {
  name: string;
  date: string;
  description?: string;
}

export interface UpdateHolidayInput {
  name?: string;
  date?: string;
  description?: string;
}
