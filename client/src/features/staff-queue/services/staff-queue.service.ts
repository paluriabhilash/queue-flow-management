import { api, ApiSuccessResponse } from '@/config/api';
import { CounterDashboardData, CallNextPayload } from '../types';
import { TicketTokenItem } from '@/features/queue/types';

export const staffQueueApiService = {
  getCounterDashboard: async (counterId: string): Promise<CounterDashboardData> => {
    const response = await api.get<ApiSuccessResponse<CounterDashboardData>>(`/queue/counter/${counterId}`);
    return response.data.data;
  },

  callNextToken: async (payload: CallNextPayload): Promise<TicketTokenItem> => {
    const response = await api.post<ApiSuccessResponse<TicketTokenItem>>('/queue/next', payload);
    return response.data.data;
  },

  startToken: async (tokenId: string): Promise<TicketTokenItem> => {
    const response = await api.post<ApiSuccessResponse<TicketTokenItem>>(`/queue/${tokenId}/start`);
    return response.data.data;
  },

  completeToken: async (tokenId: string): Promise<TicketTokenItem> => {
    const response = await api.post<ApiSuccessResponse<TicketTokenItem>>(`/queue/${tokenId}/complete`);
    return response.data.data;
  },

  skipToken: async (tokenId: string): Promise<TicketTokenItem> => {
    const response = await api.post<ApiSuccessResponse<TicketTokenItem>>(`/queue/${tokenId}/skip`);
    return response.data.data;
  },
};
