"use client";
import { useEffect } from "react";
import { switchAccountCache } from "./account-cache";
import { getSupabase } from "./supabase-client";

export default function SupabaseSession() {
  useEffect(() => {
    // Old MongoDB/local demo sessions cannot authorize Supabase requests.
    localStorage.removeItem("max-local-users");
    try {
      const { data } = getSupabase().auth.onAuthStateChange((_event, session) => {
        switchAccountCache(session?.user.id || null);
        if (session) {
          const user = session.user;
          localStorage.setItem("max-auth-token", session.access_token);
          localStorage.setItem("max-session", JSON.stringify({ id: user.id, email: user.email, name: user.user_metadata?.name || "Driver" }));
        } else {
          localStorage.removeItem("max-auth-token");
          localStorage.removeItem("max-session");
        }
        dispatchEvent(new Event("max-state"));
      });
      return () => data.subscription.unsubscribe();
    } catch {
      localStorage.removeItem("max-auth-token");
      localStorage.removeItem("max-session");
    }
  }, []);
  return null;
}
