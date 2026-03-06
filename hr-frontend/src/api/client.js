import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearAuth,
} from "../utils/authStorage";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

/** Paths that must not send Bearer token (login, signup, refresh). */
const NO_AUTH_PATHS = ["/auth/login", "/auth/web/login", "/auth/signup", "/auth/refresh"];

const isNoAuthPath = (url) =>
  NO_AUTH_PATHS.some((path) => url && url.includes(path));

/** Event dispatched when session is invalid (e.g. refresh failed). App should clear user and show login. */
export const AUTH_LOGOUT_EVENT = "auth:logout";

export function dispatchAuthLogout() {
  window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
}

/** Axios instance for authenticated API calls. Use this everywhere except login/signup. */
export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/** Plain axios for login/signup/refresh (no Bearer, no retry). */
export const authApi = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(accessToken) {
  refreshSubscribers.forEach((cb) => cb(accessToken));
  refreshSubscribers = [];
}

function onRefreshFailed() {
  refreshSubscribers.forEach((cb) => cb(null));
  refreshSubscribers = [];
}

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

/** Attempt refresh and return new access token or null. */
async function doRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await authApi.post("/auth/refresh", { refresh_token: refreshToken });
    const data = res.data || {};
    const newAccess = data.access_token || data.accessToken;
    const newRefresh = data.refresh_token ?? data.refreshToken ?? refreshToken;
    if (newAccess) {
      saveTokens(newAccess, newRefresh);
      return newAccess;
    }
    return null;
  } catch {
    return null;
  }
}

// ----- Request interceptor: add Bearer token -----
api.interceptors.request.use(
  (config) => {
    if (isNoAuthPath(config.url)) return config;
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// ----- Response interceptor: on 401 try refresh, then retry or logout -----
api.interceptors.response.use(
  (response) => response,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(err);
    }

    if (isNoAuthPath(originalRequest.url)) {
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((accessToken) => {
          if (accessToken) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            resolve(api(originalRequest));
          } else {
            resolve(Promise.reject(err));
          }
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const newAccessToken = await doRefresh();
    isRefreshing = false;

    if (newAccessToken) {
      onRefreshed(newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    }

    onRefreshFailed();
    clearAuth();
    dispatchAuthLogout();
    return Promise.reject(err);
  }
);

export default api;
