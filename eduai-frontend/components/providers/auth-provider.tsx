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
import { clearUser, getUser, setUser } from "@/lib/storage";

type AuthState =
  | { status: "loading"; user: User | null }
  | { status: "ready"; user: User | null };

type AuthContextValue = {
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
    const user = typeof window === "undefined" ? null : getUser<User>();
    return { status: "ready", user };
  });

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.auth.profile();
      setUser(res.data);
      setState((prev) => ({ ...prev, user: res.data, status: "ready" }));
    } catch {
      clearUser();
      setState({ status: "ready", user: null });
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshProfile();
    })();
  }, [refreshProfile]);

  const login = useCallback(async (input: { email: string; password: string }) => {
    const res = await api.auth.login(input);
    setUser(res.data.user);
    setState({
      status: "ready",
      user: res.data.user,
    });
  }, []);

  const register = useCallback(async (input: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
  }) => {
    await api.auth.register(input);
  }, []);

  const logout = useCallback(() => {
    void api.auth.logout();
    clearUser();
    setState({ status: "ready", user: null });
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = state.user;
    return {
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user),
      refreshProfile,
      login,
      register,
      logout,
    };
  }, [login, refreshProfile, register, state.user, logout]);

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
