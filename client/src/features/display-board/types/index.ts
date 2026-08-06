import { TicketTokenItem } from '@/features/queue/types';

export interface DisplayBranchInfo {
  id: string;
  name: string;
  code: string;
  address?: string | null;
}

export interface DisplayBoardData {
  branch: DisplayBranchInfo;
  currentlyServing: TicketTokenItem[];
  nextWaiting: TicketTokenItem[];
}
