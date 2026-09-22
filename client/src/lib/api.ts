import { useMemo } from "react";
import { useAuth } from "../state/auth";

export const API_BASE = "http://localhost:4000/api";

export type ApiError = { message: string };

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  if (init.token) headers.set("authorization", `Bearer ${init.token}`);

  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error((body?.message as string) ?? "Request failed");
  }
  return body as T;
}

export function useApi() {
  const { token } = useAuth();
  return useMemo(
    () => ({
      get: <T,>(path: string) => apiFetch<T>(path, { method: "GET", token }),
      post: <T,>(path: string, data?: unknown) =>
        apiFetch<T>(path, {
          method: "POST",
          body: data !== undefined ? JSON.stringify(data) : undefined,
          token,
        }),
      patch: <T,>(path: string, data: unknown) =>
        apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(data), token }),
      delete: <T,>(path: string) => apiFetch<T>(path, { method: "DELETE", token }),
    }),
    [token],
  );
}

