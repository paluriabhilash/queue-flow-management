export const ACCESS_TOKEN_KEY = 'queueflow_access_token';
export const REFRESH_TOKEN_KEY = 'queueflow_refresh_token';
export const USER_KEY = 'queueflow_user';

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const removeAccessToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const removeRefreshToken = (): void => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getUserFromStorage = <T = unknown>(): T | null => {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
};

export const setUserInStorage = (user: unknown): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeUserFromStorage = (): void => {
  localStorage.removeItem(USER_KEY);
};

export const clearAuthStorage = (): void => {
  removeAccessToken();
  removeRefreshToken();
  removeUserFromStorage();
};

export const parseJwtPayload = <T = unknown>(token: string): T | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as T;
  } catch {
    return null;
  }
};
