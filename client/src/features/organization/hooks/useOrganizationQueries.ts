import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationApiService } from '../services/organization.service';
import {
  OrganizationDetails,
  OrganizationSettings,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  UpdateOrganizationSettingsInput,
} from '../types';

export const organizationKeys = {
  all: ['organizations'] as const,
  details: (id: string) => [...organizationKeys.all, 'details', id] as const,
  settings: (id: string) => [...organizationKeys.all, 'settings', id] as const,
};

export const useOrganizationDetails = (id?: string) => {
  return useQuery<OrganizationDetails, Error>({
    queryKey: organizationKeys.details(id || ''),
    queryFn: () => organizationApiService.getDetails(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
};

export const useOrganizationSettings = (id?: string) => {
  return useQuery<OrganizationSettings, Error>({
    queryKey: organizationKeys.settings(id || ''),
    queryFn: () => organizationApiService.getSettings(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation<OrganizationDetails, Error, CreateOrganizationInput>({
    mutationFn: (payload) => organizationApiService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
};

export const useUpdateOrganization = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<OrganizationDetails, Error, UpdateOrganizationInput>({
    mutationFn: (payload) => organizationApiService.update(id, payload),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(organizationKeys.details(id), updatedData);
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
};

export const useUpdateOrganizationSettings = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<OrganizationSettings, Error, UpdateOrganizationSettingsInput>({
    mutationFn: (payload) => organizationApiService.updateSettings(id, payload),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(organizationKeys.settings(id), updatedSettings);
      queryClient.invalidateQueries({ queryKey: organizationKeys.details(id) });
    },
  });
};
