"use client";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "")
).replace(/\/$/, "");

type ApiOptions = RequestInit & { authenticated?: boolean };

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (options.authenticated) {
    const token = localStorage.getItem("max-auth-token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({ success: false, message: "Invalid server response" }));
  if (!response.ok) throw new Error(payload.message || "Request failed");
  return payload as T;
}

export function saveApiSession(token: string, user: { name: string; email: string; role?: string }) {
  localStorage.setItem("max-auth-token", token);
  localStorage.setItem("max-session", JSON.stringify(user));
  dispatchEvent(new Event("max-state"));
}

export function clearApiSession() {
  localStorage.removeItem("max-auth-token");
  localStorage.removeItem("max-session");
  dispatchEvent(new Event("max-state"));
}
