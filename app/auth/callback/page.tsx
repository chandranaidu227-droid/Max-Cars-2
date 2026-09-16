"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "../../supabase-client";
export default function AuthCallback() {
  const [message, setMessage] = useState("Confirming your account…");
  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    if (fragment.has("error")) { setMessage("This email link is invalid, expired, or already used. Request another link."); return; }
    getSupabase().auth.getSession().then(({ data, error }) => {
      if (error || !data.session) { setMessage("This confirmation link is invalid or expired. Try logging in or request a new confirmation email."); return; }
      const flow = sessionStorage.getItem("max-auth-flow");
      window.location.replace(flow === "invite" || flow === "recovery" ? "/reset-password" : "/dashboard");
    }).catch(() => setMessage("Unable to confirm your account. Please try again."));
  }, []);
  return <section className="auth-page"><div className="authcard"><h1>Email confirmation</h1><p role="status">{message}</p><a href="/forgot-password">Request another reset link</a><a href="/login">Return to login</a></div></section>;
}
