export interface CounterSession {
  id: string;
  counterNumber: number;
  departmentName: string;
  status: 'OPEN' | 'CLOSED' | 'PAUSED';
  currentTicket?: {
    tokenNumber: string;
    customerName?: string;
    serviceName: string;
  };
}
