"use client";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "")
).replace(/\/$/, "");

type ApiOptions = RequestInit & { authenticated?: boolean };

type LocalUser = {
  name: string;
  email: string;
  phone: string;
  city: string;
  passwordHash: string;
  role: "customer";
};

async function passwordHash(value: string) {
  const bytes = new TextEncoder().encode(value);
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
  }
  let first = 2166136261;
  let second = 2246822519;
  for (const byte of bytes) {
    first = Math.imul(first ^ byte, 16777619);
    second = Math.imul(second ^ byte, 3266489917);
  }
  return `${(first >>> 0).toString(16).padStart(8, "0")}${(second >>> 0).toString(16).padStart(8, "0")}`;
}

function localToken() {
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}.${Math.random().toString(36).slice(2)}`;
  return `local.${id}`;
}

async function localAuthFallback<T>(path: string, options: ApiOptions): Promise<T> {
  const body = JSON.parse(String(options.body || "{}"));
  const users = JSON.parse(localStorage.getItem("max-local-users") || "[]") as LocalUser[];
  const email = String(body.email || "").trim().toLowerCase();

  if (path === "/api/auth/register") {
    if (users.some(user => user.email === email)) throw new Error("An account with this email already exists");
    const user: LocalUser = {
      name: String(body.name || "").trim(),
      email,
      phone: String(body.phone || "").trim(),
      city: String(body.city || "").trim(),
      passwordHash: await passwordHash(String(body.password || "")),
      role: "customer",
    };
    users.push(user);
    localStorage.setItem("max-local-users", JSON.stringify(users));
    return { token: localToken(), user: { name: user.name, email: user.email, role: user.role } } as T;
  }

  if (path === "/api/auth/login") {
    const user = users.find(candidate => candidate.email === email);
    if (!user || user.passwordHash !== await passwordHash(String(body.password || ""))) throw new Error("Invalid email or password");
    return { token: localToken(), user: { name: user.name, email: user.email, role: user.role } } as T;
  }

  if (path === "/api/auth/forgot-password") {
    return { message: "If the account exists, recovery instructions will be sent when email delivery is configured" } as T;
  }

  throw new Error("Unable to contact the MAX CARS API.");
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (options.authenticated) {
    const token = localStorage.getItem("max-auth-token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  let response: Response;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 2500);
  options.signal?.addEventListener("abort", () => controller.abort(), { once: true });
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers, signal: controller.signal });
  } catch (error) {
    if (path.startsWith("/api/auth/")) return localAuthFallback<T>(path, options);
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
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
