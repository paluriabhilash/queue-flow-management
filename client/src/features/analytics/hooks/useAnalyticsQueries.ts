import { useQuery } from '@tanstack/react-query';
import { analyticsApiService } from '../services/analytics.service';
import { BranchAnalyticsData } from '../types';

export const analyticsKeys = {
  all: ['analytics'] as const,
  branch: (branchId: string) => [...analyticsKeys.all, 'branch', branchId] as const,
};

export const useAnalyticsDashboard = (branchId?: string) => {
  return useQuery<BranchAnalyticsData, Error>({
    queryKey: analyticsKeys.branch(branchId || ''),
    queryFn: () => analyticsApiService.getBranchAnalytics(branchId!),
    enabled: !!branchId,
    staleTime: 1000 * 60 * 2, // 2 mins cache
  });
};
