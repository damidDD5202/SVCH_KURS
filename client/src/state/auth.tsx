import React, { createContext, useContext, useMemo, useState } from "react";

type Role = "CLIENT" | "MANAGER" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

type AuthContextValue = AuthState & {
  setAuth: (next: AuthState) => void;
  logout: () => void;
};

const LS_KEY = "coworking.auth.v1";

const AuthContext = createContext<AuthContextValue | null>(null);

function readInitial(): AuthState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw) as AuthState;
    if (typeof parsed?.token !== "string") return { token: null, user: null };
    if (!parsed.user) return { token: parsed.token, user: null };
    return parsed;
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => readInitial());

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      setAuth: (next) => {
        setState(next);
        localStorage.setItem(LS_KEY, JSON.stringify(next));
      },
      logout: () => {
        setState({ token: null, user: null });
        localStorage.removeItem(LS_KEY);
      },
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider is missing");
  return ctx;
}

