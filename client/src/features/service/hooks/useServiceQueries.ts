import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceApiService } from '../services/service.service';
import { ServiceItem, CreateServiceInput, UpdateServiceInput } from '../types';

export const serviceKeys = {
  all: ['services'] as const,
  list: (branchId?: string) => [...serviceKeys.all, 'list', branchId] as const,
  detail: (id: string) => [...serviceKeys.all, 'detail', id] as const,
};

export const useServices = (branchId?: string) => {
  return useQuery<ServiceItem[], Error>({
    queryKey: serviceKeys.list(branchId),
    queryFn: () => serviceApiService.getServices(branchId),
    staleTime: 1000 * 60 * 3,
  });
};

export const useServiceDetails = (id?: string) => {
  return useQuery<ServiceItem, Error>({
    queryKey: serviceKeys.detail(id || ''),
    queryFn: () => serviceApiService.getServiceById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 3,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation<ServiceItem, Error, CreateServiceInput>({
    mutationFn: (payload) => serviceApiService.createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
};

export const useUpdateService = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ServiceItem, Error, UpdateServiceInput>({
    mutationFn: (payload) => serviceApiService.updateService(id, payload),
    onSuccess: (updatedService) => {
      queryClient.setQueryData(serviceKeys.detail(id), updatedService);
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => serviceApiService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
};
