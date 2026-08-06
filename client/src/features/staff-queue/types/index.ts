import { TicketTokenItem } from '@/features/queue/types';
import { CounterItem } from '@/features/counter/types';

export interface CounterDashboardData {
  counter: CounterItem;
  currentServingToken: TicketTokenItem | null;
  waitingTokensCount: number;
  nextWaitingTokens: TicketTokenItem[];
}

export interface CallNextPayload {
  counterId: string;
}
