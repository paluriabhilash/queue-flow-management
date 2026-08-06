import { api, ApiSuccessResponse } from '@/config/api';
import {
  OrganizationDetails,
  OrganizationSettings,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  UpdateOrganizationSettingsInput,
} from '../types';

export const organizationApiService = {
  getDetails: async (id: string): Promise<OrganizationDetails> => {
    const response = await api.get<ApiSuccessResponse<OrganizationDetails>>(`/organizations/${id}`);
    return response.data.data;
  },

  getSettings: async (id: string): Promise<OrganizationSettings> => {
    const response = await api.get<ApiSuccessResponse<OrganizationSettings>>(`/organizations/${id}/settings`);
    return response.data.data;
  },

  create: async (payload: CreateOrganizationInput): Promise<OrganizationDetails> => {
    const response = await api.post<ApiSuccessResponse<OrganizationDetails>>('/organizations', payload);
    return response.data.data;
  },

  update: async (id: string, payload: UpdateOrganizationInput): Promise<OrganizationDetails> => {
    const response = await api.put<ApiSuccessResponse<OrganizationDetails>>(`/organizations/${id}`, payload);
    return response.data.data;
  },

  updateSettings: async (
    id: string,
    payload: UpdateOrganizationSettingsInput
  ): Promise<OrganizationSettings> => {
    const response = await api.put<ApiSuccessResponse<OrganizationSettings>>(`/organizations/${id}/settings`, payload);
    return response.data.data;
  },
};
