export interface Ticket {
  id: string;
  tokenNumber: string;
  departmentName: string;
  serviceName: string;
  counterNumber?: number;
  status: 'WAITING' | 'CALLED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  positionInQueue: number;
  estimatedWaitMins: number;
  createdAt: string;
}
