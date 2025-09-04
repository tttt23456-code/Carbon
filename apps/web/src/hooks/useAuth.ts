import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, type LoginRequest, type RegisterRequest } from '../services/auth';
import { useAuthStore } from './useAuthStore';

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await authService.login(data);
      return response;
    },
    onSuccess: (data) => {
      authService.setTokens(data.accessToken, data.refreshToken);
      setAuth(data.user);
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

export const useRegister = () => {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await authService.register(data);
      return response;
    },
    onSuccess: (data) => {
      authService.setTokens(data.accessToken, data.refreshToken);
      setAuth(data.user);
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });
};

export const useLogout = () => {
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authService.logout();
    },
    onSuccess: () => {
      authService.clearTokens();
      clearAuth();
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // 即使失败也清除本地状态
      authService.clearTokens();
      clearAuth();
      queryClient.clear();
    },
  });
};