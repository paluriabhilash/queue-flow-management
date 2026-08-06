import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queueApiService } from '../services/queue.service';
import {
  TicketTokenItem,
  GenerateTokenPayload,
  GenerateTokenResponse,
  TokenPositionResponse,
} from '../types';

export const queueKeys = {
  all: ['queue'] as const,
  myTokens: () => [...queueKeys.all, 'my-tokens'] as const,
  position: (tokenId: string) => [...queueKeys.all, 'position', tokenId] as const,
};

export const useGenerateToken = () => {
  const queryClient = useQueryClient();
  return useMutation<GenerateTokenResponse, Error, GenerateTokenPayload>({
    mutationFn: (payload) => queueApiService.generateToken(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueKeys.myTokens() });
    },
  });
};

export const useMyTokens = () => {
  return useQuery<TicketTokenItem[], Error>({
    queryKey: queueKeys.myTokens(),
    queryFn: () => queueApiService.getMyActiveTokens(),
    staleTime: 1000 * 5,
  });
};

export const useTokenPosition = (tokenId?: string) => {
  return useQuery<TokenPositionResponse, Error>({
    queryKey: queueKeys.position(tokenId || ''),
    queryFn: () => queueApiService.getTokenPosition(tokenId!),
    enabled: !!tokenId,
    staleTime: 1000 * 5,
  });
};

export const useCancelToken = () => {
  const queryClient = useQueryClient();
  return useMutation<TicketTokenItem, Error, string>({
    mutationFn: (tokenId) => queueApiService.cancelToken(tokenId),
    onSuccess: (_, tokenId) => {
      queryClient.invalidateQueries({ queryKey: queueKeys.position(tokenId) });
      queryClient.invalidateQueries({ queryKey: queueKeys.myTokens() });
    },
  });
};
