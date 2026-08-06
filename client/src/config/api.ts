import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, clearAuthStorage } from '../utils/auth.utils';

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  error: null;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data: null;
  error: {
    message: string;
    statusCode: number;
    details?: unknown;
  };
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically Attach JWT Access Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh Token Placeholder Function
// Will be expanded when Refresh Token rotation logic is activated
export const refreshAccessTokenPlaceholder = async (): Promise<string | null> => {
  // Placeholder: Refresh token support stub
  console.log('[API] Refresh token placeholder triggered');
  return null;
};

// Response Interceptor: Handle 401 Unauthorized Responses
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      // Clear token storage on unauthorized response
      clearAuthStorage();
      
      // Redirect to login if user is not already on an auth route
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';

    return Promise.reject(new Error(errorMessage));
  }
);
