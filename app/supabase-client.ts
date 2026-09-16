"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured. Set the public project URL and publishable key, then rebuild.");
  if (!client && typeof window !== "undefined") {
    // Supabase consumes the URL fragment during initialization. Preserve the
    // purpose first so invitations landing at Site URL can open password setup.
    const type = new URLSearchParams(window.location.hash.slice(1)).get("type");
    if (type === "invite" || type === "recovery") sessionStorage.setItem("max-auth-flow", type);
  }
  client ||= createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "implicit" },
  });
  return client;
}

export async function signOut() {
  const { error } = await getSupabase().auth.signOut({ scope: "local" });
  if (error) throw error;
  sessionStorage.removeItem("max-auth-flow");
  localStorage.removeItem("max-auth-token");
  localStorage.removeItem("max-session");
  dispatchEvent(new Event("max-state"));
}
