import * as React from "react";

import { apiFetch, clearSessionToken, getSessionToken, setSessionToken } from "@/lib/api";

export type Role = "patient" | "doctor" | "admin";

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: Role;
  is_active: boolean;
}

export interface RegisterInput {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthTokenResponse {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  sessionNotice: string | null;
  clearSessionNotice: () => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [sessionNotice, setSessionNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      if (!getSessionToken()) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const me = await apiFetch<AuthUser>("/auth/me");
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    const onExpired = () => {
      setUser(null);
      setSessionNotice("your session has ended, please sign in again");
    };
    window.addEventListener("session-expired", onExpired);
    return () => window.removeEventListener("session-expired", onExpired);
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const res = await apiFetch<AuthTokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setSessionToken(res.token);
    setUser(res.user);
    setSessionNotice(null);
    return res.user;
  }, []);

  const register = React.useCallback(async (input: RegisterInput) => {
    const res = await apiFetch<AuthTokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setSessionToken(res.token);
    setUser(res.user);
    setSessionNotice(null);
    return res.user;
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // The token may already be invalid server-side; clear it locally regardless.
    } finally {
      clearSessionToken();
      setUser(null);
    }
  }, []);

  const clearSessionNotice = React.useCallback(() => setSessionNotice(null), []);

  const value = React.useMemo(
    () => ({ user, loading, sessionNotice, clearSessionNotice, login, register, logout }),
    [user, loading, sessionNotice, clearSessionNotice, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export const ROLE_HOME: Record<Role, string> = {
  patient: "find-a-doctor",
  doctor: "doctor-workspace",
  admin: "admin-console",
};
