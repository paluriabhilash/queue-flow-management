import { api, ApiSuccessResponse } from '@/config/api';
import { LoginRequest, AuthResponse, UserProfile, RegisterRequest } from '../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiSuccessResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiSuccessResponse<AuthResponse>>('/auth/register', payload);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post<ApiSuccessResponse<null>>('/auth/logout');
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await api.get<ApiSuccessResponse<UserProfile>>('/auth/me');
    return response.data.data;
  },
};
