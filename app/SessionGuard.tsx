"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getSupabase } from "./supabase-client";
const protectedPrefixes = ["/dashboard", "/profile", "/admin", "/orders", "/favourites", "/notifications"];
export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const protectedPage = protectedPrefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!protectedPage) return;
    setReady(false);
    let active = true;
    const verify = async () => {
      try {
        const { data, error } = await getSupabase().auth.getSession();
        if (!active) return;
        if (error || !data.session) location.replace(`/login?returnTo=${encodeURIComponent(path + location.search)}`);
        else setReady(true);
      } catch { if (active) location.replace("/login"); }
    };
    void verify();
    return () => { active = false; };
  }, [path, protectedPage]);
  if (protectedPage && !ready) return <main className="auth-page"><p role="status">Checking your session...</p></main>;
  return children;
}
