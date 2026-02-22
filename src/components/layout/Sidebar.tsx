"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  Settings, 
  LogOut,
  HelpCircle
} from "lucide-react";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tax Items", href: "/dashboard/taxes", icon: FileText },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen max-h-screen bg-[#18412e] text-white flex flex-col fixed left-0 top-0 border-r border-[#015428]/30">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none">T</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Taxmate</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 px-2">Menu</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group",
                isActive 
                  ? "bg-[#015428] text-white shadow-inner" 
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-accent" : "text-white/50 group-hover:text-white/80")} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Footer Nav */}
      <div className="p-4 border-t border-white/10 flex flex-col gap-2">
        <Link
          href="/support"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm text-white/70 hover:bg-white/5 hover:text-white group"
        >
          <HelpCircle className="w-5 h-5 text-white/50 group-hover:text-white/80" />
          Support
        </Link>
        <button
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 group w-full text-left"
        >
          <LogOut className="w-5 h-5 opacity-70 group-hover:opacity-100" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
