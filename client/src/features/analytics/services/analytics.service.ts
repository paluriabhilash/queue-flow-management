import { api, ApiSuccessResponse } from '@/config/api';
import { BranchAnalyticsData } from '../types';

export const analyticsApiService = {
  getBranchAnalytics: async (branchId: string): Promise<BranchAnalyticsData> => {
    const response = await api.get<ApiSuccessResponse<BranchAnalyticsData>>(`/analytics/dashboard/${branchId}`);
    return response.data.data;
  },
};
