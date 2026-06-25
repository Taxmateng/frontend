"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CircleHelp, CreditCard, FileText, LayoutDashboard, LogOut, Settings, ShieldCheck, UserRound } from "lucide-react";
import { apiGet, apiPost, isUnauthorizedError, redirectToLogin } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tax Items", href: "/dashboard/tax-items", icon: FileText },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Profile", href: "/dashboard/profile", icon: UserRound },
  { name: "Analytics", href: "/dashboard", icon: BarChart3 }
];

const baseGeneralItems = [
  { name: "Settings", href: "/dashboard/profile", icon: Settings },
  { name: "Help", href: "/", icon: CircleHelp }
];

type AuthUser = {
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
};

export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<AuthUser["role"]>();

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await apiGet<AuthUser>("/auth/me");
        setRole(user.role);
      } catch (error) {
        if (isUnauthorizedError(error)) {
          redirectToLogin();
        }
      }
    }

    fetchUser();
  }, []);

  const generalItems = role === "ADMIN" || role === "SUPER_ADMIN"
    ? [{ name: "Admin", href: "/admin", icon: ShieldCheck }, ...baseGeneralItems]
    : baseGeneralItems;

  async function signOut() {
    if (typeof window !== "undefined") {
      await apiPost("/auth/logout", {}).catch(() => undefined);
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] border-r border-[#e2e5dc] bg-[#fbfcf8] px-5 py-6 lg:flex lg:flex-col">
      <Link href="/" className="flex items-center gap-3">
        <Logo size={44} />
        <span className="text-xl font-black text-[#252a24]">Taxmate</span>
      </Link>

      <div className="mt-10 flex-1">
        <p className="mb-3 px-1 text-xs font-bold uppercase tracking-[0.08em] text-muted">Menu</p>
        <nav className="grid gap-2">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex h-12 items-center gap-3 rounded-[1.25rem] px-4 text-sm font-bold transition",
                  active ? "bg-primary text-white shadow-[0_12px_28px_rgba(4,118,59,0.18)]" : "text-muted hover:bg-[#eef3e9] hover:text-[#252a24]"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <p className="mb-3 mt-10 px-1 text-xs font-bold uppercase tracking-[0.08em] text-muted">General</p>
        <nav className="grid gap-2">
          {generalItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex h-12 items-center gap-3 rounded-[1.25rem] px-4 text-sm font-bold text-muted transition hover:bg-[#eef3e9] hover:text-[#252a24]"
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <button
        onClick={signOut}
        className="flex h-12 items-center gap-3 rounded-[1.25rem] px-4 text-sm font-bold text-muted transition hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </button>
    </aside>
  );
}
