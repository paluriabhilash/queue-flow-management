import { api, ApiSuccessResponse } from '@/config/api';
import { DisplayBoardData } from '../types';

export const displayBoardApiService = {
  getBranchDisplayBoard: async (branchId: string): Promise<DisplayBoardData> => {
    const response = await api.get<ApiSuccessResponse<DisplayBoardData>>(`/queue/display/${branchId}`);
    return response.data.data;
  },
};
