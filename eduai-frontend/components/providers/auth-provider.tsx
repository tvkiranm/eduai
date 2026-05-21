"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User, UserRole } from "@/lib/types";
import { api } from "@/lib/api";
import { clearAuth, getToken, getUser, setToken, setUser } from "@/lib/storage";

type AuthState =
  | { status: "loading"; token: string | null; user: User | null }
  | { status: "ready"; token: string | null; user: User | null };

type AuthContextValue = {
  token: string | null;
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = typeof window === "undefined" ? null : getToken();
    const user = typeof window === "undefined" ? null : getUser<User>();
    return { status: "ready", token, user };
  });

  useEffect(() => {
    if (!state.token || state.user) return;
    void (async () => {
      try {
        const res = await api.auth.profile();
        setUser(res.data);
        setState((prev) => ({ ...prev, user: res.data, status: "ready" }));
      } catch {
        clearAuth();
        setState({ status: "ready", token: null, user: null });
      }
    })();
  }, [state.token, state.user]);

  const refreshProfile = useCallback(async () => {
    if (!state.token) return;
    try {
      const res = await api.auth.profile();
      setUser(res.data);
      setState((prev) => ({ ...prev, user: res.data, status: "ready" }));
    } catch {
      clearAuth();
      setState({ status: "ready", token: null, user: null });
    }
  }, [state.token]);

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const res = await api.auth.login(input);
      setToken(res.data.accessToken);
      setUser(res.data.user);
      setState({
        status: "ready",
        token: res.data.accessToken,
        user: res.data.user,
      });
    },
    [],
  );

  const register = useCallback(
    async (input: {
      fullName: string;
      email: string;
      password: string;
      role: UserRole;
    }) => {
      await api.auth.register(input);
      // Auto-login after successful registration
      // await login({ email: input.email, password: input.password });
    },
    [login],
  );

  const logout = useCallback(() => {
    clearAuth();
    setState({ status: "ready", token: null, user: null });
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = state.user;
    return {
      token: state.token,
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(state.token && user),
      refreshProfile,
      login,
      register,
      logout,
    };
  }, [login, refreshProfile, register, state.token, state.user, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function assertAuthRole(role: UserRole, allowed: UserRole[]) {
  if (!allowed.includes(role)) {
    throw new Error(`Role not allowed: ${role}`);
  }
}
