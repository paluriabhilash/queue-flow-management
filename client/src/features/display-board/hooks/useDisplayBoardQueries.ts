import { useQuery } from '@tanstack/react-query';
import { displayBoardApiService } from '../services/display-board.service';
import { DisplayBoardData } from '../types';

export const displayBoardKeys = {
  all: ['display-board'] as const,
  branch: (branchId: string) => [...displayBoardKeys.all, 'branch', branchId] as const,
};

export const useBranchDisplayBoard = (branchId?: string) => {
  return useQuery<DisplayBoardData, Error>({
    queryKey: displayBoardKeys.branch(branchId || ''),
    queryFn: () => displayBoardApiService.getBranchDisplayBoard(branchId!),
    enabled: !!branchId,
    staleTime: 1000 * 5,
  });
};
