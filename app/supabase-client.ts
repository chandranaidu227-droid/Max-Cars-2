"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured. Set the public project URL and publishable key, then rebuild.");
  client ||= createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "implicit" },
  });
  return client;
}

export async function signOut() {
  const { error } = await getSupabase().auth.signOut({ scope: "local" });
  if (error) throw error;
  localStorage.removeItem("max-auth-token");
  localStorage.removeItem("max-session");
  dispatchEvent(new Event("max-state"));
}
