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
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) throw new Error("This recovery link is invalid or expired. Request a new email.");
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
    <div className="auth-copy"><p className="eyebrow">MAX CARS IDENTITY</p><h1>Choose a new password.</h1><p>Open the recovery link from your email, then enter your new password.</p></div>
    <form className="authcard" onSubmit={submit}>
      <span className="auth-wordmark">MAX <em>CARS</em></span><h2>Reset password</h2>
      {!done && <>
        <label>New password<input name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={256} /></label>
        <label>Confirm password<input name="confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={256} /></label>
        <button className="red" disabled={busy}>{busy ? "Saving…" : "Save new password"}</button>
      </>}
      {message && <p className="form-message" role="status">{message}</p>}
      <a href="/login">Return to login</a><a href="/forgot-password">Request a new recovery link</a>
    </form>
  </section>;
}
