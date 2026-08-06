import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, AuthTokens } from '../features/auth/types';
import {
  getAccessToken,
  getUserFromStorage,
  setAccessToken,
  setRefreshToken,
  setUserInStorage,
  clearAuthStorage,
} from '../utils/auth.utils';
import { authService } from '../features/auth/services/auth.service';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: AuthTokens, user: UserProfile) => void;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => getUserFromStorage<UserProfile>());
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and verify authentication state on startup
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getAccessToken();
      if (storedToken) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          setUserInStorage(currentUser);
        } catch {
          // Token invalid or expired
          clearAuthStorage();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback((tokens: AuthTokens, newUser: UserProfile) => {
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    setUserInStorage(newUser);
    setToken(tokens.accessToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getAccessToken()) {
        await authService.logout();
      }
    } catch (error) {
      console.warn('[AUTH] Error during logout backend call:', error);
    } finally {
      clearAuthStorage();
      setToken(null);
      setUser(null);
    }
  }, []);

  const refetchUser = useCallback(async () => {
    if (!getAccessToken()) return;
    try {
      const updatedUser = await authService.getCurrentUser();
      setUser(updatedUser);
      setUserInStorage(updatedUser);
    } catch {
      await logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
