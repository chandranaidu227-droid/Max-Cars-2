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
    const { getSupabase } = await import("./supabase-client");
    const { data, error } = await getSupabase().auth.getSession();
    if (error || !data.session) throw new Error("Please log in to continue.");
    headers.set("Authorization", `Bearer ${data.session.access_token}`);
  }
  let response: Response;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30000);
  const abort = () => controller.abort();
  if (options.signal?.aborted) abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers, signal: controller.signal });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new Error("Unable to reach MAX CARS. Please check your connection and try again.");
  } finally {
    window.clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abort);
  }
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => { throw new Error("Invalid server response. Please try again later."); });
  if (!response.ok) throw new Error(payload.message || "Request failed");
  if (payload.success === false) throw new Error(payload.message || "Request failed");
  if (payload.token && payload.refreshToken) {
    const { getSupabase } = await import("./supabase-client");
    const { error } = await getSupabase().auth.setSession({ access_token: payload.token, refresh_token: payload.refreshToken });
    if (error) throw new Error("Unable to establish your session. Please log in again.");
  }
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

export async function syncLocalRecords() {
  type SyncRecord = Record<string, unknown>;
  const token = localStorage.getItem("max-auth-token");
  if (token?.startsWith("local.")) {
    clearApiSession();
    localStorage.removeItem("max-local-users");
    return;
  }
  if (!token || !localStorage.getItem("max-data-owner")) return;
  const synced = JSON.parse(localStorage.getItem("max-api-sync") || "{}") as Record<string, string[]>;
  const remember = (kind: string, key: string) => {
    synced[kind] = [...new Set([...(synced[kind] || []), key])].slice(-500);
  };
  const pending = async (kind: string, records: unknown[], send: (record: SyncRecord) => Promise<unknown>) => {
    for (const record of records as SyncRecord[]) {
      if (record.backendSaved) continue;
      const key = String(record.id || record.reference || record.vehicleId || record.registration || JSON.stringify(record));
      if (synced[kind]?.includes(key)) continue;
      try { await send(record); remember(kind, key); } catch { /* Keep local data until the API is available. */ }
    }
  };
  const read = (key: string) => {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
  };
  await pending("favourites", read("max-favs").map((vehicleId: string) => ({ vehicleId })), record => apiRequest("/api/favourites", { method: "POST", authenticated: true, body: JSON.stringify(record) }));
  const bookingRecords = read("max-bookings");
  const bookingReference = localStorage.getItem("max-booking");
  if (bookingReference) bookingRecords.push({ id: bookingReference, vehicleId: localStorage.getItem("max-book-car"), location: "MAX CARS Experience Centre" });
  await pending("bookings", bookingRecords, record => apiRequest("/api/bookings", { method: "POST", authenticated: true, body: JSON.stringify({ vehicleId: record.vehicleId || record.carId || "catalogue-request", location: record.location || "MAX CARS Experience Centre", appointmentAt: record.appointmentAt || record.date || new Date().toISOString(), notes: record.notes || "" }) }));
  const orderRecords = read("max-orders");
  const latestOrder = localStorage.getItem("max-order");
  if (latestOrder) { try { orderRecords.push(JSON.parse(latestOrder)); } catch {} }
  await pending("orders", orderRecords, record => apiRequest("/api/orders", { method: "POST", authenticated: true, body: JSON.stringify({ items: record.items || record.cart || [], customer: record.customer || {}, fulfilment: record.fulfilment || {}, }) }));
  await pending("listings", read("max-listings"), record => apiRequest("/api/listings", { method: "POST", authenticated: true, body: JSON.stringify({ registration: record.registration, brand: record.brand, model: record.model, year: record.year, price: Number(record.price) || 0, details: record }) }));
  await pending("support", read("max-tickets"), record => apiRequest("/api/support", { method: "POST", authenticated: true, body: JSON.stringify({ topic: record.topic || "General support", subject: record.subject || "MAX CARS support request", description: String(record.description || record.message || "Support request from MAX CARS user"), vehicleId: record.vehicleId }) }));
  localStorage.setItem("max-api-sync", JSON.stringify(synced));
}
