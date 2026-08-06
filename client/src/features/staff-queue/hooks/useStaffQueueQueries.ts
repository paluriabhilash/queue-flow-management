import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffQueueApiService } from '../services/staff-queue.service';
import { CounterDashboardData, CallNextPayload } from '../types';
import { TicketTokenItem } from '@/features/queue/types';

export const staffQueueKeys = {
  all: ['staff-queue'] as const,
  dashboard: (counterId: string) => [...staffQueueKeys.all, 'dashboard', counterId] as const,
};

export const useCounterQueue = (counterId?: string) => {
  return useQuery<CounterDashboardData, Error>({
    queryKey: staffQueueKeys.dashboard(counterId || ''),
    queryFn: () => staffQueueApiService.getCounterDashboard(counterId!),
    enabled: !!counterId,
    staleTime: 1000 * 5,
  });
};

export const useNextToken = (counterId: string) => {
  const queryClient = useQueryClient();
  return useMutation<TicketTokenItem, Error, CallNextPayload>({
    mutationFn: (payload) => staffQueueApiService.callNextToken(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffQueueKeys.dashboard(counterId) });
    },
  });
};

export const useStartToken = (counterId: string) => {
  const queryClient = useQueryClient();
  return useMutation<TicketTokenItem, Error, string>({
    mutationFn: (tokenId) => staffQueueApiService.startToken(tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffQueueKeys.dashboard(counterId) });
    },
  });
};

export const useCompleteToken = (counterId: string) => {
  const queryClient = useQueryClient();
  return useMutation<TicketTokenItem, Error, string>({
    mutationFn: (tokenId) => staffQueueApiService.completeToken(tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffQueueKeys.dashboard(counterId) });
    },
  });
};

export const useSkipToken = (counterId: string) => {
  const queryClient = useQueryClient();
  return useMutation<TicketTokenItem, Error, string>({
    mutationFn: (tokenId) => staffQueueApiService.skipToken(tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffQueueKeys.dashboard(counterId) });
    },
  });
};
