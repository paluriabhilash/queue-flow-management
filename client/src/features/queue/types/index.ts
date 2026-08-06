import { PriorityLevel } from '@/features/service/types';
export type { PriorityLevel };

export type TokenStatus = 'WAITING' | 'CALLED' | 'SERVING' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED';

export interface TicketTokenItem {
  id: string;
  tokenNumber: string;
  seqNumber: number;
  priority: PriorityLevel;
  status: TokenStatus;
  queueId: string;
  serviceId: string;
  counterId?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customer?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
  } | null;
  notes?: string | null;
  estimatedTime?: string | null;
  calledAt?: string | null;
  servedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  service?: {
    id: string;
    name: string;
    code: string;
    prefix: string;
    avgServiceTimeMins: number;
  };
  counter?: {
    id: string;
    number: number;
    name: string;
  } | null;
  queue?: {
    id: string;
    date: string;
    branchId: string;
    serviceId: string;
    branch?: {
      id: string;
      name: string;
      code: string;
      address?: string | null;
    };
  };
  queuePosition?: number;
  queueAheadCount?: number;
  estimatedWaitTime?: number;
}

export interface GenerateTokenPayload {
  branchId: string;
  serviceId: string;
  priority?: PriorityLevel;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface GenerateTokenResponse {
  token: TicketTokenItem;
  queuePosition: number;
  estimatedWaitTime: number;
}

export interface TokenPositionResponse {
  token: TicketTokenItem;
  queuePosition: number;
  queueAheadCount: number;
  estimatedWaitTime: number;
}
