"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";

type UserProfile = { id: string };

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await apiGet<UserProfile>("/auth/me");
        setUser(data);
      } catch {
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  const links = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" }
  ];

  return (
    <nav className="fixed left-0 right-0 top-4 z-50 px-4">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between rounded-full border border-white/10 bg-[#0c0f0d]/80 px-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-black text-primary">T</span>
          <span className="text-lg font-bold text-white">Taxmate</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-white/55 transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm font-medium text-white/60 transition hover:text-white">
            Sign In
          </Link>
          <Link
            href={user ? "/dashboard" : "/register"}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-[#111411] transition hover:bg-accent"
          >
            {user ? <LayoutDashboard className="h-4 w-4" /> : null}
            {user ? "Dashboard" : "Get Started"}
          </Link>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white md:hidden"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "mx-auto mt-3 max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0c0f0d]/95 px-5 text-white shadow-xl backdrop-blur-xl transition-all md:hidden",
          isMobileMenuOpen ? "max-h-96 py-5 opacity-100" : "max-h-0 py-0 opacity-0"
        )}
      >
        <div className="flex flex-col gap-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-white/70">
              {link.label}
            </Link>
          ))}
          <Link
            href={user ? "/dashboard" : "/register"}
            onClick={() => setIsMobileMenuOpen(false)}
            className="inline-flex h-11 items-center justify-center rounded-full bg-white text-sm font-bold text-[#111411]"
          >
            {user ? "Open Dashboard" : "Get Started"}
          </Link>
        </div>
      </div>
    </nav>
  );
}
