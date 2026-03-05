const USER_KEY = "hr_logged_user";
const ACCESS_TOKEN_KEY = "hr_access_token";
const REFRESH_TOKEN_KEY = "hr_refresh_token";

export const saveUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearUser = () => {
  localStorage.removeItem(USER_KEY);
};

export const saveTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/** Clear user and tokens (full logout). */
export const clearAuth = () => {
  clearUser();
  clearTokens();
};
