import { api, ApiSuccessResponse } from '@/config/api';
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

export const branchApiService = {
  getBranches: async (organizationId?: string): Promise<Branch[]> => {
    const params = organizationId ? { organizationId } : undefined;
    const response = await api.get<ApiSuccessResponse<Branch[]>>('/branches', { params });
    return response.data.data;
  },

  getBranchById: async (id: string): Promise<Branch> => {
    const response = await api.get<ApiSuccessResponse<Branch>>(`/branches/${id}`);
    return response.data.data;
  },

  createBranch: async (payload: CreateBranchInput): Promise<Branch> => {
    const response = await api.post<ApiSuccessResponse<Branch>>('/branches', payload);
    return response.data.data;
  },

  updateBranch: async (id: string, payload: UpdateBranchInput): Promise<Branch> => {
    const response = await api.put<ApiSuccessResponse<Branch>>(`/branches/${id}`, payload);
    return response.data.data;
  },

  deleteBranch: async (id: string): Promise<void> => {
    await api.delete(`/branches/${id}`);
  },

  // Working Hours
  getWorkingHours: async (branchId: string): Promise<WorkingHour[]> => {
    const response = await api.get<ApiSuccessResponse<WorkingHour[]>>(`/branches/${branchId}/working-hours`);
    return response.data.data;
  },

  createWorkingHour: async (branchId: string, payload: CreateWorkingHourInput): Promise<WorkingHour> => {
    const response = await api.post<ApiSuccessResponse<WorkingHour>>(`/branches/${branchId}/working-hours`, payload);
    return response.data.data;
  },

  updateWorkingHour: async (id: string, payload: UpdateWorkingHourInput): Promise<WorkingHour> => {
    const response = await api.put<ApiSuccessResponse<WorkingHour>>(`/working-hours/${id}`, payload);
    return response.data.data;
  },

  deleteWorkingHour: async (id: string): Promise<void> => {
    await api.delete(`/working-hours/${id}`);
  },

  // Holidays
  getHolidays: async (branchId: string): Promise<Holiday[]> => {
    const response = await api.get<ApiSuccessResponse<Holiday[]>>(`/branches/${branchId}/holidays`);
    return response.data.data;
  },

  createHoliday: async (branchId: string, payload: CreateHolidayInput): Promise<Holiday> => {
    const response = await api.post<ApiSuccessResponse<Holiday>>(`/branches/${branchId}/holidays`, payload);
    return response.data.data;
  },

  updateHoliday: async (id: string, payload: UpdateHolidayInput): Promise<Holiday> => {
    const response = await api.put<ApiSuccessResponse<Holiday>>(`/holidays/${id}`, payload);
    return response.data.data;
  },

  deleteHoliday: async (id: string): Promise<void> => {
    await api.delete(`/holidays/${id}`);
  },
};
