import { api, ApiSuccessResponse } from '@/config/api';
import {
  TicketTokenItem,
  GenerateTokenPayload,
  GenerateTokenResponse,
  TokenPositionResponse,
} from '../types';

export const queueApiService = {
  generateToken: async (payload: GenerateTokenPayload): Promise<GenerateTokenResponse> => {
    const response = await api.post<ApiSuccessResponse<GenerateTokenResponse>>('/queue/token', payload);
    return response.data.data;
  },

  getMyActiveTokens: async (): Promise<TicketTokenItem[]> => {
    const response = await api.get<ApiSuccessResponse<TicketTokenItem[]>>('/queue/my-token');
    return response.data.data;
  },

  getTokenPosition: async (tokenId: string): Promise<TokenPositionResponse> => {
    const response = await api.get<ApiSuccessResponse<TokenPositionResponse>>(`/queue/position/${tokenId}`);
    return response.data.data;
  },

  cancelToken: async (tokenId: string): Promise<TicketTokenItem> => {
    const response = await api.post<ApiSuccessResponse<TicketTokenItem>>(`/queue/${tokenId}/cancel`);
    return response.data.data;
  },
};
