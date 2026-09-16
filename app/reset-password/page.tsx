"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabase, signOut } from "../supabase-client";

export default function ResetPasswordPage() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let active = true;
    const fragment = new URLSearchParams(location.hash.slice(1));
    const fragmentError = fragment.has("error") || sessionStorage.getItem("max-auth-link-error") === "1";
    const linkAttempt = fragment.has("access_token") || fragmentError || fragment.get("type") === "recovery";
    Promise.resolve().then(() => getSupabase().auth.getSession()).then(({ data, error }) => {
      if (!active) return;
      if (linkAttempt && (fragmentError || error || !data.session)) {
        setMessage("This reset link is invalid, expired, or already used. Request another link.");
      }
      sessionStorage.removeItem("max-auth-link-error");
      // Remove recovery credentials from browser history after the SDK processes them.
      if (linkAttempt && location.hash) history.replaceState(null, "", location.pathname + location.search);
    }).catch(() => {
      if (active && linkAttempt) setMessage("Unable to verify this reset link. Request another link.");
    }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || checking || done) return;
    const form = new FormData(event.currentTarget);
    if (form.get("password") !== form.get("confirm")) { setMessage("Passwords do not match."); return; }
    setBusy(true);
    setMessage("");
    try {
      const supabase = getSupabase();
      const email = String(form.get("email") || "").trim().toLowerCase();
      const code = String(form.get("code") || "").trim();
      if (code || email) {
        if (!email || !/^\d{6}$/.test(code)) throw new Error("Enter your email and the 6-digit code from the reset email.");
        const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "recovery" });
        if (error || !data.session) throw new Error("That code is invalid or expired. Request another reset email.");
      } else {
        const flow = sessionStorage.getItem("max-auth-flow");
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session || (flow !== "recovery" && flow !== "invite")) throw new Error("Open the reset link from your email, or enter your email and 6-digit code.");
      }
      const { error } = await supabase.auth.updateUser({ password: String(form.get("password")) });
      if (error) throw error;
      setDone(true);
      try { await signOut(); }
      catch { setMessage("Password updated, but sign out failed. Close this tab, then sign in with your new password."); return; }
      history.replaceState(null, "", "/reset-password");
      location.replace("/login?passwordReset=1");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to reset password. Please try again.");
    } finally { setBusy(false); }
  }

  return <section className="auth-page forgot">
    <div className="auth-copy"><p className="eyebrow">MAX CARS IDENTITY</p><h1>Choose a new password.</h1><p>Open the reset link from your email, or enter its 6-digit code. Then choose a new password.</p></div>
    <form className="authcard" onSubmit={submit}>
      <span className="auth-wordmark">MAX <em>CARS</em></span><h2>Reset password</h2>
      {!done && <>
        <label>Email address (for code only)<input name="email" type="email" autoComplete="email" /></label>
        <label>6-digit email code (optional for link)<input name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} /></label>
        <label>New password<input name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={256} /></label>
        <label>Confirm password<input name="confirm" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={256} /></label>
        <label className="check"><input type="checkbox" checked={showPassword} onChange={event => setShowPassword(event.target.checked)} /> Show passwords</label>
        <button className="red" disabled={busy || checking}>{busy ? "Saving…" : checking ? "Checking link…" : "Update password"}</button>
      </>}
      {message && <p className="form-message" role="status">{message}</p>}
      <a href="/login">Return to login</a><a href="/forgot-password">Request another link</a>
    </form>
  </section>;
}
