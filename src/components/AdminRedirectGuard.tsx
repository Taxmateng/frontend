"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";

// Admins/super-admins aren't taxpayers — bounce them from the taxpayer dashboard
// to the admin console.
export function AdminRedirectGuard() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await apiGet<{ role?: string }>("/auth/me");
        if (active && (me.role === "ADMIN" || me.role === "SUPER_ADMIN")) {
          router.replace("/admin");
        }
      } catch {
        // not authenticated / transient — leave routing to the page's own guard
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  return null;
}
