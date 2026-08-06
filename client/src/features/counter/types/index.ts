import { ServiceItem } from '@/features/service/types';

export type CounterStatus = 'OPEN' | 'PAUSED' | 'CLOSED' | 'MAINTENANCE';

export interface StaffUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: string;
}

export interface StaffProfileItem {
  id: string;
  userId: string;
  organizationId: string;
  branchId: string;
  departmentId?: string | null;
  counterId?: string | null;
  employeeId?: string | null;
  user: StaffUser;
}

export interface CounterServiceItem {
  id: string;
  counterId: string;
  serviceId: string;
  createdAt: string;
  service: ServiceItem;
}

export interface CounterItem {
  id: string;
  number: number;
  name: string;
  branchId: string;
  status: CounterStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  branch?: {
    id: string;
    name: string;
    code: string;
    organizationId: string;
  } | null;
  staffProfile?: StaffProfileItem | null;
  counterServices?: CounterServiceItem[];
  _count?: {
    tickets: number;
  };
}

export interface CreateCounterInput {
  branchId: string;
  name: string;
  number: number;
  status?: CounterStatus;
}

export interface UpdateCounterInput {
  name?: string;
  status?: CounterStatus;
  isActive?: boolean;
}

export interface AssignStaffInput {
  staffProfileId: string;
}

export interface AssignServicesInput {
  serviceIds: string[];
}
