export type PriorityLevel = 'NORMAL' | 'SENIOR_CITIZEN' | 'EMERGENCY' | 'VIP';

export interface ServiceItem {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  prefix: string;
  description?: string | null;
  avgServiceTimeMins: number;
  priority?: PriorityLevel;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  department?: {
    id: string;
    name: string;
    code: string;
    branchId: string;
    branch?: {
      id: string;
      name: string;
      code: string;
      organizationId: string;
    } | null;
  } | null;
  _count?: {
    counterServices: number;
    queues: number;
  };
}

export interface CreateServiceInput {
  branchId: string;
  name: string;
  code: string;
  description?: string;
  avgServiceTime: number;
  priority?: PriorityLevel;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  avgServiceTime?: number;
  priority?: PriorityLevel;
  isActive?: boolean;
}
