"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, Bell, CheckCircle2, CreditCard, FileClock, LayoutDashboard, Search, ShieldCheck, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiGet, isForbiddenError, isUnauthorizedError, redirectToLogin } from "@/lib/api";
import { Logo } from "@/components/Logo";

type AuthUser = {
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
};

type AdminOverview = {
  kpis: {
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    totalRevenueLabel: string;
    activeTaxItems: number;
    pendingPayments: number;
    confirmedPayments: number;
    pendingChainConfirms: number;
  };
};

type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  profileType?: string | null;
  tin?: string | null;
};

type AdminPayment = {
  id: string;
  userEmail?: string | null;
  taxItemName: string;
  category?: string | null;
  amountLabel: string;
  status: string;
  createdAt: string;
};

type CategoryTotal = {
  category: string;
  count: number;
  total: number;
  totalLabel: string;
};

type AuditItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
};

const adminNavItems: { label: string; icon: LucideIcon }[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Users", icon: UsersRound },
  { label: "Payments", icon: CreditCard },
  { label: "Analytics", icon: BarChart3 },
  { label: "Audit", icon: ShieldCheck }
];

function statusClass(status: string): string {
  if (status === "ACTIVE" || status === "CONFIRMED" || status === "PAID") {
    return "bg-accent text-primary";
  }
  if (status === "SUSPENDED" || status === "FAILED") {
    return "bg-[#fbe8ed] text-rose-600";
  }
  return "bg-[#fff3c9] text-amber-700";
}

export default function AdminPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [categories, setCategories] = useState<CategoryTotal[]>([]);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [auditRestricted, setAuditRestricted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    async function fetchAdmin() {
      try {
        const currentUser = await apiGet<AuthUser>("/auth/me");
        if (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
          setForbidden(true);
          return;
        }

        const [overviewData, userData, paymentData, categoryData] = await Promise.all([
          apiGet<AdminOverview>("/admin/analytics/overview"),
          apiGet<{ items: AdminUser[] }>("/admin/users"),
          apiGet<{ items: AdminPayment[] }>("/admin/payments"),
          apiGet<{ items: CategoryTotal[] }>("/admin/analytics/by-category")
        ]);

        setOverview(overviewData);
        setUsers(userData.items);
        setPayments(paymentData.items);
        setCategories(categoryData.items);

        try {
          const auditData = await apiGet<{ items: AuditItem[] }>("/admin/audit-log");
          setAudit(auditData.items);
        } catch (auditError) {
          if (isUnauthorizedError(auditError)) {
            redirectToLogin();
            return;
          }
          if (isForbiddenError(auditError)) {
            setAuditRestricted(true);
            return;
          }
          throw auditError;
        }
      } catch (fetchError) {
        if (isUnauthorizedError(fetchError)) {
          redirectToLogin();
          return;
        }
        if (isForbiddenError(fetchError)) {
          setForbidden(true);
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : "Unable to load admin dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchAdmin();
  }, []);

  const chartValues = useMemo(() => {
    const max = Math.max(...categories.map((item) => item.total), 1);
    return categories.map((item) => ({ ...item, height: Math.max(22, Math.round((item.total / max) * 100)) }));
  }, [categories]);

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-background"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>;
  }

  if (forbidden) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5 text-[#252a24]">
        <div className="max-w-md rounded-[1.5rem] border border-[#e2e5dc] bg-white p-8 text-center shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
          <h1 className="text-2xl font-black">Admin access required</h1>
          <p className="mt-2 font-medium text-muted">Your current account does not have permission to view this dashboard.</p>
          <Link href="/dashboard" className="mt-6 inline-flex h-12 items-center justify-center rounded-[1rem] bg-primary px-5 text-sm font-black text-white">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5 text-[#252a24]">
        <div className="max-w-md rounded-[1.5rem] border border-[#e2e5dc] bg-white p-8 text-center shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
          <h1 className="text-2xl font-black">Admin dashboard unavailable</h1>
          <p className="mt-2 font-medium text-muted">{error ?? "Admin metrics could not be loaded."}</p>
        </div>
      </div>
    );
  }

  const metricCards: { label: string; value: string | number; icon: LucideIcon; primary: boolean }[] = [
    { label: "Total Users", value: overview.kpis.totalUsers, icon: UsersRound, primary: true },
    { label: "Revenue", value: overview.kpis.totalRevenueLabel, icon: CreditCard, primary: false },
    { label: "Active Tax Items", value: overview.kpis.activeTaxItems, icon: ShieldCheck, primary: false },
    { label: "Pending Confirms", value: overview.kpis.pendingChainConfirms, icon: FileClock, primary: false }
  ];

  return (
    <div className="min-h-screen bg-background text-[#252a24]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] border-r border-[#e2e5dc] bg-[#fbfcf8] px-5 py-6 lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={44} />
          <span className="text-xl font-black">Taxmate</span>
        </Link>
        <div className="mt-10 flex-1">
          <p className="mb-3 text-xs font-black uppercase text-muted">Admin</p>
          {adminNavItems.map(({ label, icon: Icon }, index) => (
            <button key={label} className={index === 0 ? "mb-2 flex h-12 w-full items-center gap-3 rounded-[1.25rem] bg-primary px-4 text-sm font-black text-white shadow-[0_12px_28px_rgba(4,118,59,0.18)]" : "mb-2 flex h-12 w-full items-center gap-3 rounded-[1.25rem] px-4 text-sm font-black text-muted transition hover:bg-[#eef3e9]"}>
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
        <Link href="/dashboard" className="flex h-12 items-center justify-center rounded-[1.25rem] border border-[#e2e5dc] bg-white text-sm font-black">
          Taxpayer View
        </Link>
      </aside>

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 flex h-24 items-center justify-between gap-4 bg-background/90 px-5 backdrop-blur-xl lg:px-8">
          <div className="relative hidden w-full max-w-xl md:block">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input className="h-14 w-full rounded-[1.25rem] border border-[#e2e5dc] bg-white pl-12 pr-4 text-sm font-medium outline-none focus:border-primary" placeholder="Search taxpayers, TINs, payments" />
          </div>
          <button className="relative ml-auto grid h-11 w-11 place-items-center rounded-full text-[#252a24] hover:bg-white">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
          </button>
        </header>

        <main className="grid gap-5 px-5 pb-10 lg:px-8 xl:grid-cols-[1fr_360px]">
          <section className="min-w-0">
            <div className="mb-6">
              <h1 className="text-4xl font-black">Admin Dashboard</h1>
              <p className="mt-2 text-lg font-medium text-muted">Monitor taxpayers, payments, tax items, and confirmation operations.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              {metricCards.map(({ label, value, icon: Icon, primary }) => (
                <article key={label} className={primary ? "rounded-[1.5rem] bg-primary p-6 text-white shadow-[0_16px_32px_rgba(4,118,59,0.22)]" : "rounded-[1.5rem] border border-[#e2e5dc] bg-white p-6 shadow-[0_10px_24px_rgba(31,36,30,0.06)]"}>
                  <div className="mb-12 flex items-start justify-between">
                    <p className={primary ? "text-sm font-bold text-white/80" : "text-sm font-black text-muted"}>{label}</p>
                    <span className={primary ? "grid h-9 w-9 place-items-center rounded-full bg-white/16" : "grid h-9 w-9 place-items-center rounded-full bg-primary text-white"}><Icon className="h-4 w-4" /></span>
                  </div>
                  <p className="text-3xl font-black">{value}</p>
                  <p className={primary ? "mt-8 text-sm font-semibold text-white/75" : "mt-8 text-sm font-semibold text-muted"}>Updated from live tables</p>
                </article>
              ))}
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <article className="rounded-[1.5rem] border border-[#e2e5dc] bg-white p-7 shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
                <h2 className="text-2xl font-black">Revenue by Category</h2>
                {chartValues.length ? (
                  <div className="mt-10 flex h-72 items-end gap-7 px-4">
                    {chartValues.map((item) => (
                      <div key={item.category} className="flex flex-1 flex-col items-center gap-3">
                        <span className="w-full rounded-t-[1rem] bg-primary/80" style={{ height: `${item.height}%` }} />
                        <span className="text-sm font-black text-muted">{item.category}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-7 rounded-[1.1rem] bg-[#f7f8f4] p-6 text-center font-bold text-muted">
                    No payment category totals are available.
                  </div>
                )}
              </article>

              <article className="rounded-[1.5rem] border border-[#e2e5dc] bg-white p-7 shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
                <h2 className="text-2xl font-black">Payment Queue</h2>
                <div className="mt-7 grid gap-3">
                  {payments.length ? payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="rounded-[1.1rem] bg-[#f7f8f4] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-black">{payment.taxItemName}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(payment.status)}`}>{payment.status}</span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-muted">{payment.userEmail ?? "Unknown user"} • {payment.amountLabel}</p>
                    </div>
                  )) : (
                    <div className="rounded-[1.1rem] bg-[#f7f8f4] p-6 text-center font-bold text-muted">No payments found.</div>
                  )}
                </div>
              </article>
            </div>

            <article className="mt-5 rounded-[1.5rem] border border-[#e2e5dc] bg-white p-7 shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
              <div className="mb-7 flex items-center justify-between">
                <h2 className="text-2xl font-black">Taxpayer Directory</h2>
                <span className="rounded-full bg-accent px-4 py-2 text-sm font-black text-primary">{overview.kpis.activeUsers} active</span>
              </div>
              <div className="grid gap-3">
                {users.length ? users.slice(0, 6).map((user) => (
                  <div key={user.id} className="grid gap-3 rounded-[1.1rem] px-4 py-4 transition hover:bg-[#f3f5ef] md:grid-cols-[1fr_auto_auto] md:items-center">
                    <div>
                      <p className="font-black">{user.displayName}</p>
                      <p className="mt-1 text-sm font-medium text-muted">{user.email}</p>
                    </div>
                    <p className="font-mono text-sm font-black text-muted">{user.tin ?? "No TIN"}</p>
                    <span className={`w-fit rounded-full px-4 py-2 text-xs font-black ${statusClass(user.status)}`}>{user.status}</span>
                  </div>
                )) : (
                  <div className="rounded-[1.1rem] bg-[#f7f8f4] p-6 text-center font-bold text-muted">No users found.</div>
                )}
              </div>
            </article>
          </section>

          <aside className="grid h-fit gap-5">
            <article className="rounded-[1.5rem] border border-[#e2e5dc] bg-white p-7 shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
              <h2 className="text-2xl font-black">System Snapshot</h2>
              <div className="mt-8 grid gap-4">
                {[
                  ["Registered Users", overview.kpis.totalUsers],
                  ["Active Users", overview.kpis.activeUsers],
                  ["Pending Payments", overview.kpis.pendingPayments],
                  ["Confirmed Payments", overview.kpis.confirmedPayments]
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-[1rem] bg-[#f7f8f4] px-4 py-3">
                    <span className="font-bold text-muted">{label}</span>
                    <span className="flex items-center gap-2 font-black text-primary"><CheckCircle2 className="h-4 w-4" /> {value}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[1.5rem] bg-[#182018] p-7 text-white shadow-[0_14px_30px_rgba(24,32,24,0.22)]">
              <ShieldCheck className="h-7 w-7" />
              <h2 className="mt-8 text-2xl font-black">Admin Controls</h2>
              <p className="mt-2 text-sm font-medium text-white/55">Use protected API endpoints to update user status, create admins, and review audit activity.</p>
              <Link href="/dashboard" className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-[1rem] bg-white text-sm font-black text-[#182018]">
                Open Taxpayer View
              </Link>
            </article>

            <article className="rounded-[1.5rem] border border-[#e2e5dc] bg-white p-7 shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
              <h2 className="text-2xl font-black">Audit Preview</h2>
              <div className="mt-7 grid gap-3">
                {auditRestricted ? (
                  <div className="rounded-[1rem] bg-[#f7f8f4] p-4 font-bold text-muted">Super admin access is required to view audit activity.</div>
                ) : audit.length ? audit.slice(0, 4).map((item) => (
                  <div key={item.id} className="rounded-[1rem] bg-[#f7f8f4] p-4">
                    <p className="font-black">{item.action}</p>
                    <p className="mt-1 text-xs font-bold text-muted">{item.entityType} • {new Date(item.createdAt).toLocaleDateString("en-NG")}</p>
                  </div>
                )) : (
                  <div className="rounded-[1rem] bg-[#f7f8f4] p-4 font-bold text-muted">No audit events found.</div>
                )}
              </div>
            </article>
          </aside>
        </main>
      </div>
    </div>
  );
}
