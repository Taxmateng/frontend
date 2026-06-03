"use client";

import { useEffect, useState } from "react";
import { Bell, Mail, Menu, Search, UserRound } from "lucide-react";
import { apiGet, isUnauthorizedError, redirectToLogin } from "@/lib/api";

type UserProfile = {
  firstname?: string;
  lastname?: string;
  email?: string;
  companyName?: string;
  id?: string;
};

export function TopBar() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await apiGet<UserProfile>("/auth/me");
        setUser(data);
      } catch (error) {
        if (isUnauthorizedError(error)) {
          redirectToLogin();
        }
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  const displayName = user?.companyName || (user?.firstname ? `${user.firstname} ${user.lastname ?? ""}`.trim() : "Loading profile");
  const displayEmail = user?.email ?? "";

  return (
    <header className="sticky top-0 z-30 flex h-24 items-center justify-between gap-4 bg-background/90 px-5 backdrop-blur-xl lg:px-8">
      <button className="grid h-11 w-11 place-items-center rounded-full border border-[#e2e5dc] bg-white text-[#252a24] lg:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden w-full max-w-xl md:block">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search TIN, tax item, payment, receipt"
          className="h-14 w-full rounded-[1.25rem] border border-[#e2e5dc] bg-white pl-12 pr-14 text-sm font-medium text-[#252a24] shadow-[0_8px_24px_rgba(31,36,30,0.06)] outline-none transition focus:border-primary"
        />
        <kbd className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md border border-[#e2e5dc] bg-[#f7f8f4] px-2 py-1 text-xs font-black text-muted">⌘F</kbd>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="grid h-11 w-11 place-items-center rounded-full bg-transparent text-[#252a24] transition hover:bg-white" aria-label="Messages">
          <Mail className="h-5 w-5" />
        </button>
        <button className="relative grid h-11 w-11 place-items-center rounded-full bg-transparent text-[#252a24] transition hover:bg-white" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
        </button>
        <div className="h-9 w-px bg-[#e2e5dc]" />
        <button className="flex items-center gap-3 rounded-full px-1 py-1 pr-3 transition hover:bg-white">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary ring-2 ring-white">
            <UserRound className="h-6 w-6" />
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-black text-[#252a24]">{displayName}</span>
            <span className="block text-xs font-medium text-muted">{displayEmail}</span>
          </span>
        </button>
      </div>
    </header>
  );
}
