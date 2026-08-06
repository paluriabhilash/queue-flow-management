import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchApiService } from '../services/branch.service';
import {
  Branch,
  WorkingHour,
  Holiday,
  CreateBranchInput,
  UpdateBranchInput,
  CreateWorkingHourInput,
  UpdateWorkingHourInput,
  CreateHolidayInput,
  UpdateHolidayInput,
} from '../types';

export const branchKeys = {
  all: ['branches'] as const,
  list: (orgId?: string) => [...branchKeys.all, 'list', orgId] as const,
  detail: (id: string) => [...branchKeys.all, 'detail', id] as const,
  workingHours: (branchId: string) => [...branchKeys.all, 'workingHours', branchId] as const,
  holidays: (branchId: string) => [...branchKeys.all, 'holidays', branchId] as const,
};

export const useBranches = (organizationId?: string) => {
  return useQuery<Branch[], Error>({
    queryKey: branchKeys.list(organizationId),
    queryFn: () => branchApiService.getBranches(organizationId),
    staleTime: 1000 * 60 * 3,
  });
};

export const useBranchDetails = (id?: string) => {
  return useQuery<Branch, Error>({
    queryKey: branchKeys.detail(id || ''),
    queryFn: () => branchApiService.getBranchById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 3,
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation<Branch, Error, CreateBranchInput>({
    mutationFn: (payload) => branchApiService.createBranch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.all });
    },
  });
};

export const useUpdateBranch = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<Branch, Error, UpdateBranchInput>({
    mutationFn: (payload) => branchApiService.updateBranch(id, payload),
    onSuccess: (updatedBranch) => {
      queryClient.setQueryData(branchKeys.detail(id), updatedBranch);
      queryClient.invalidateQueries({ queryKey: branchKeys.all });
    },
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => branchApiService.deleteBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.all });
    },
  });
};

// --- Working Hours ---

export const useWorkingHours = (branchId: string) => {
  return useQuery<WorkingHour[], Error>({
    queryKey: branchKeys.workingHours(branchId),
    queryFn: () => branchApiService.getWorkingHours(branchId),
    enabled: !!branchId,
  });
};

export const useCreateWorkingHour = (branchId: string) => {
  const queryClient = useQueryClient();
  return useMutation<WorkingHour, Error, CreateWorkingHourInput>({
    mutationFn: (payload) => branchApiService.createWorkingHour(branchId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.workingHours(branchId) });
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(branchId) });
    },
  });
};

export const useUpdateWorkingHour = (branchId: string) => {
  const queryClient = useQueryClient();
  return useMutation<WorkingHour, Error, { id: string; data: UpdateWorkingHourInput }>({
    mutationFn: ({ id, data }) => branchApiService.updateWorkingHour(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.workingHours(branchId) });
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(branchId) });
    },
  });
};

export const useDeleteWorkingHour = (branchId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => branchApiService.deleteWorkingHour(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.workingHours(branchId) });
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(branchId) });
    },
  });
};

// --- Holidays ---

export const useHolidays = (branchId: string) => {
  return useQuery<Holiday[], Error>({
    queryKey: branchKeys.holidays(branchId),
    queryFn: () => branchApiService.getHolidays(branchId),
    enabled: !!branchId,
  });
};

export const useCreateHoliday = (branchId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Holiday, Error, CreateHolidayInput>({
    mutationFn: (payload) => branchApiService.createHoliday(branchId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.holidays(branchId) });
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(branchId) });
    },
  });
};

export const useUpdateHoliday = (branchId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Holiday, Error, { id: string; data: UpdateHolidayInput }>({
    mutationFn: ({ id, data }) => branchApiService.updateHoliday(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.holidays(branchId) });
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(branchId) });
    },
  });
};

export const useDeleteHoliday = (branchId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => branchApiService.deleteHoliday(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.holidays(branchId) });
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(branchId) });
    },
  });
};
