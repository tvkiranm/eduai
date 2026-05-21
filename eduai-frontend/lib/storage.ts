const TOKEN_KEY = "eduai_token";
const USER_KEY = "eduai_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function getUser<TUser>(): TUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TUser;
  } catch {
    return null;
  }
}

export function setUser(user: unknown) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  window.localStorage.removeItem(USER_KEY);
}

export function clearAuth() {
  clearToken();
  clearUser();
}

