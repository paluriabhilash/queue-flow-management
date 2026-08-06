import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { counterApiService } from '../services/counter.service';
import {
  CounterItem,
  CounterServiceItem,
  CreateCounterInput,
  UpdateCounterInput,
  AssignStaffInput,
  AssignServicesInput,
  StaffProfileItem,
} from '../types';

export const counterKeys = {
  all: ['counters'] as const,
  list: (branchId?: string) => [...counterKeys.all, 'list', branchId] as const,
  detail: (id: string) => [...counterKeys.all, 'detail', id] as const,
  counterServices: (counterId: string) => [...counterKeys.all, 'services', counterId] as const,
  staffProfiles: () => [...counterKeys.all, 'staffProfiles'] as const,
};

export const useCounters = (branchId?: string) => {
  return useQuery<CounterItem[], Error>({
    queryKey: counterKeys.list(branchId),
    queryFn: () => counterApiService.getCounters(branchId),
    staleTime: 1000 * 60 * 3,
  });
};

export const useCounterDetails = (id?: string) => {
  return useQuery<CounterItem, Error>({
    queryKey: counterKeys.detail(id || ''),
    queryFn: () => counterApiService.getCounterById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 3,
  });
};

export const useCreateCounter = () => {
  const queryClient = useQueryClient();
  return useMutation<CounterItem, Error, CreateCounterInput>({
    mutationFn: (payload) => counterApiService.createCounter(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: counterKeys.all });
    },
  });
};

export const useUpdateCounter = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<CounterItem, Error, UpdateCounterInput>({
    mutationFn: (payload) => counterApiService.updateCounter(id, payload),
    onSuccess: (updatedCounter) => {
      queryClient.setQueryData(counterKeys.detail(id), updatedCounter);
      queryClient.invalidateQueries({ queryKey: counterKeys.all });
    },
  });
};

export const useDeleteCounter = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => counterApiService.deleteCounter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: counterKeys.all });
    },
  });
};

// Staff Assignment Hooks
export const useStaffProfiles = () => {
  return useQuery<StaffProfileItem[], Error>({
    queryKey: counterKeys.staffProfiles(),
    queryFn: () => counterApiService.getStaffProfiles(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useAssignStaff = (counterId: string) => {
  const queryClient = useQueryClient();
  return useMutation<CounterItem, Error, AssignStaffInput>({
    mutationFn: (payload) => counterApiService.assignStaff(counterId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: counterKeys.detail(counterId) });
      queryClient.invalidateQueries({ queryKey: counterKeys.all });
    },
  });
};

export const useRemoveStaff = (counterId: string) => {
  const queryClient = useQueryClient();
  return useMutation<CounterItem, Error, string>({
    mutationFn: (staffProfileId) => counterApiService.removeStaff(counterId, staffProfileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: counterKeys.detail(counterId) });
      queryClient.invalidateQueries({ queryKey: counterKeys.all });
    },
  });
};

// Service Mapping Hooks
export const useCounterServices = (counterId: string) => {
  return useQuery<CounterServiceItem[], Error>({
    queryKey: counterKeys.counterServices(counterId),
    queryFn: () => counterApiService.getCounterServices(counterId),
    enabled: !!counterId,
  });
};

export const useAssignServices = (counterId: string) => {
  const queryClient = useQueryClient();
  return useMutation<CounterServiceItem[], Error, AssignServicesInput>({
    mutationFn: (payload) => counterApiService.assignServices(counterId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: counterKeys.counterServices(counterId) });
      queryClient.invalidateQueries({ queryKey: counterKeys.detail(counterId) });
    },
  });
};

export const useRemoveService = (counterId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (serviceId) => counterApiService.removeService(counterId, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: counterKeys.counterServices(counterId) });
      queryClient.invalidateQueries({ queryKey: counterKeys.detail(counterId) });
    },
  });
};
