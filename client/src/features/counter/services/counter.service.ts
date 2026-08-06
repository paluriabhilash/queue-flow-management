import { api, ApiSuccessResponse } from '@/config/api';
import {
  CounterItem,
  CounterServiceItem,
  CreateCounterInput,
  UpdateCounterInput,
  AssignStaffInput,
  AssignServicesInput,
  StaffProfileItem,
} from '../types';

export const counterApiService = {
  getCounters: async (branchId?: string): Promise<CounterItem[]> => {
    const params = branchId ? { branchId } : undefined;
    const response = await api.get<ApiSuccessResponse<CounterItem[]>>('/counters', { params });
    return response.data.data;
  },

  getCounterById: async (id: string): Promise<CounterItem> => {
    const response = await api.get<ApiSuccessResponse<CounterItem>>(`/counters/${id}`);
    return response.data.data;
  },

  createCounter: async (payload: CreateCounterInput): Promise<CounterItem> => {
    const response = await api.post<ApiSuccessResponse<CounterItem>>('/counters', payload);
    return response.data.data;
  },

  updateCounter: async (id: string, payload: UpdateCounterInput): Promise<CounterItem> => {
    const response = await api.put<ApiSuccessResponse<CounterItem>>(`/counters/${id}`, payload);
    return response.data.data;
  },

  deleteCounter: async (id: string): Promise<void> => {
    await api.delete(`/counters/${id}`);
  },

  // Staff Assignment
  assignStaff: async (counterId: string, payload: AssignStaffInput): Promise<CounterItem> => {
    const response = await api.post<ApiSuccessResponse<CounterItem>>(`/counters/${counterId}/staff`, payload);
    return response.data.data;
  },

  removeStaff: async (counterId: string, staffProfileId: string): Promise<CounterItem> => {
    const response = await api.delete<ApiSuccessResponse<CounterItem>>(`/counters/${counterId}/staff/${staffProfileId}`);
    return response.data.data;
  },

  getStaffProfiles: async (): Promise<StaffProfileItem[]> => {
    const response = await api.get<ApiSuccessResponse<StaffProfileItem[]>>('/admin/staff');
    return response.data.data;
  },

  // Service Mapping
  assignServices: async (counterId: string, payload: AssignServicesInput): Promise<CounterServiceItem[]> => {
    const response = await api.post<ApiSuccessResponse<CounterServiceItem[]>>(`/counters/${counterId}/services`, payload);
    return response.data.data;
  },

  getCounterServices: async (counterId: string): Promise<CounterServiceItem[]> => {
    const response = await api.get<ApiSuccessResponse<CounterServiceItem[]>>(`/counters/${counterId}/services`);
    return response.data.data;
  },

  removeService: async (counterId: string, serviceId: string): Promise<void> => {
    await api.delete(`/counters/${counterId}/services/${serviceId}`);
  },
};
