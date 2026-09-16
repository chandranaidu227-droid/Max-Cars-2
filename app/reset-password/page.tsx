"use client";

import { FormEvent, useState } from "react";
import { getSupabase, signOut } from "../supabase-client";

export default function ResetPasswordPage() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
        if (error || !data.session) throw new Error("That code is invalid or expired. Request a new reset email.");
      } else {
        const flow = sessionStorage.getItem("max-auth-flow");
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session || (flow !== "recovery" && flow !== "invite")) throw new Error("Open the recovery link from your email, or enter your email and 6-digit code.");
      }
      const { error } = await supabase.auth.updateUser({ password: String(form.get("password")) });
      if (error) throw error;
      await signOut();
      window.history.replaceState(null, "", "/reset-password");
      setDone(true);
      setMessage("Your password has been updated. Log in with your new password.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to reset password."); }
    finally { setBusy(false); }
  }

  return <section className="auth-page forgot">
    <div className="auth-copy"><p className="eyebrow">MAX CARS IDENTITY</p><h1>Choose a new password.</h1><p>Enter the code from your reset email, or open its reset link. Then choose a new password.</p></div>
    <form className="authcard" onSubmit={submit}>
      <span className="auth-wordmark">MAX <em>CARS</em></span><h2>Reset password</h2>
      {!done && <>
        <label>Email address<input name="email" type="email" autoComplete="email" /></label>
        <label>6-digit email code<input name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} /></label>
        <label>New password<input name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={256} /></label>
        <label>Confirm password<input name="confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={256} /></label>
        <button className="red" disabled={busy}>{busy ? "Saving…" : "Save new password"}</button>
      </>}
      {message && <p className="form-message" role="status">{message}</p>}
      <a href="/login">Return to login</a><a href="/forgot-password">Request a new recovery link</a>
    </form>
  </section>;
}
