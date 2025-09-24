import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { User } from '@shared/schema';

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery<AuthUser>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: () => {
      window.location.href = '/api/login';
      return Promise.resolve();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => {
      window.location.href = '/api/logout';
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}