import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuth } from '@/context/AuthContext';
import { LoginRequest, RegisterRequest, AuthResponse, UserProfile } from '../types';

export const CURRENT_USER_QUERY_KEY = ['auth', 'currentUser'];

export const useLogin = () => {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (data) => {
      login(data.tokens, data.user);
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, data.user);
    },
  });
};

export const useRegister = () => {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: (payload) => authService.register(payload),
    onSuccess: (data) => {
      login(data.tokens, data.user);
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, data.user);
    },
  });
};

export const useCurrentUser = () => {
  const { isAuthenticated } = useAuth();

  return useQuery<UserProfile, Error>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useLogout = () => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
