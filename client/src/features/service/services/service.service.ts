import { api, ApiSuccessResponse } from '@/config/api';
import { ServiceItem, CreateServiceInput, UpdateServiceInput } from '../types';

export const serviceApiService = {
  getServices: async (branchId?: string): Promise<ServiceItem[]> => {
    const params = branchId ? { branchId } : undefined;
    const response = await api.get<ApiSuccessResponse<ServiceItem[]>>('/services', { params });
    return response.data.data;
  },

  getServiceById: async (id: string): Promise<ServiceItem> => {
    const response = await api.get<ApiSuccessResponse<ServiceItem>>(`/services/${id}`);
    return response.data.data;
  },

  createService: async (payload: CreateServiceInput): Promise<ServiceItem> => {
    const response = await api.post<ApiSuccessResponse<ServiceItem>>('/services', payload);
    return response.data.data;
  },

  updateService: async (id: string, payload: UpdateServiceInput): Promise<ServiceItem> => {
    const response = await api.put<ApiSuccessResponse<ServiceItem>>(`/services/${id}`, payload);
    return response.data.data;
  },

  deleteService: async (id: string): Promise<void> => {
    await api.delete(`/services/${id}`);
  },
};
