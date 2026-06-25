"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

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
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between rounded-full border border-[#e2e5dc] bg-white/85 px-4 shadow-[0_12px_40px_-12px_rgba(31,36,30,0.18)] backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={40} />
          <span className="text-lg font-bold text-[#1b1f1a]">Taxmate</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted transition hover:text-[#1b1f1a]">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm font-medium text-muted transition hover:text-[#1b1f1a]">
            Sign In
          </Link>
          <Link
            href={user ? "/dashboard" : "/register"}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white transition hover:bg-secondary"
          >
            {user ? <LayoutDashboard className="h-4 w-4" /> : null}
            {user ? "Dashboard" : "Get Started"}
          </Link>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e2e5dc] text-[#1b1f1a] md:hidden"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "mx-auto mt-3 max-w-5xl overflow-hidden rounded-3xl border border-[#e2e5dc] bg-white/95 px-5 text-[#1b1f1a] shadow-xl backdrop-blur-xl transition-all md:hidden",
          isMobileMenuOpen ? "max-h-96 py-5 opacity-100" : "max-h-0 py-0 opacity-0"
        )}
      >
        <div className="flex flex-col gap-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-muted transition hover:text-[#1b1f1a]">
              {link.label}
            </Link>
          ))}
          <Link
            href={user ? "/dashboard" : "/register"}
            onClick={() => setIsMobileMenuOpen(false)}
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
          >
            {user ? "Open Dashboard" : "Get Started"}
          </Link>
        </div>
      </div>
    </nav>
  );
}
