"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, CalendarClock, FileWarning, ReceiptText, ShieldCheck, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiGet, isUnauthorizedError, redirectToLogin } from "@/lib/api";

type UserProfile = {
  firstname?: string;
  lastname?: string;
  email?: string;
  companyName?: string;
  tin?: string;
  walletAddress?: string | null;
  status?: string;
  profileType?: "INDIVIDUAL" | "BUSINESS";
  onChainRegistered?: boolean;
};

type PaymentItem = {
  id: string;
  taxItemName: string;
  category?: string | null;
  amount: number;
  amountLabel: string;
  status: string;
  createdAt: string;
  txHash?: string | null;
};

type TaxItem = {
  id: string;
  name: string;
  category: string;
  rateLabel: string;
  isActive: boolean;
};

const summaryCards: { label: string; icon: LucideIcon; kind: "confirmed" | "pending" | "tax-items"; href: string; caption: string }[] = [
  { label: "Confirmed Receipts", icon: ReceiptText, kind: "confirmed", href: "/dashboard/payments", caption: "View receipts" },
  { label: "Pending Payments", icon: FileWarning, kind: "pending", href: "/dashboard/payments", caption: "Awaiting confirmation" },
  { label: "Active Tax Items", icon: ShieldCheck, kind: "tax-items", href: "/dashboard/tax-items", caption: "Manage tax items" }
];

export default function DashboardIndex() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [taxItems, setTaxItems] = useState<TaxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [profile, paymentData, taxData] = await Promise.all([
          apiGet<UserProfile>("/user/profile"),
          apiGet<{ items: PaymentItem[] }>("/user/payment-history"),
          apiGet<{ items: TaxItem[] }>("/tax-items")
        ]);

        setUser(profile);
        setPayments(paymentData.items);
        setTaxItems(taxData.items);
      } catch (fetchError) {
        if (isUnauthorizedError(fetchError)) {
          redirectToLogin();
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : "Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const confirmedPayments = payments.filter((payment) => payment.status === "CONFIRMED" || payment.status === "PAID");
  const pendingPayments = payments.filter((payment) => payment.status === "PENDING");
  const totalPaid = confirmedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const displayName = user?.companyName || (user?.firstname ? `${user.firstname} ${user.lastname ?? ""}`.trim() : user?.email ?? "Taxpayer");
  const progress = user?.onChainRegistered ? (pendingPayments.length ? 82 : 100) : user?.walletAddress ? 65 : user ? 40 : 0;

  const activity = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return {
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString("en-NG", { weekday: "narrow" }),
        total: 0
      };
    });

    for (const payment of confirmedPayments) {
      const key = new Date(payment.createdAt).toISOString().slice(0, 10);
      const day = days.find((item) => item.key === key);
      if (day) {
        day.total += payment.amount;
      }
    }

    const max = Math.max(...days.map((day) => day.total), 0);
    return days.map((day) => ({
      ...day,
      height: max ? Math.max(8, Math.round((day.total / max) * 100)) : 6
    }));
  }, [confirmedPayments]);

  if (loading) {
    return <div className="grid min-h-80 place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>;
  }

  if (error) {
    return (
      <div className="rounded-[1.5rem] border border-[#e2e5dc] bg-white p-8 shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
        <h1 className="text-2xl font-black">Dashboard unavailable</h1>
        <p className="mt-2 font-medium text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <section className="min-w-0">
        <div className="mb-6">
          <h1 className="text-4xl font-black tracking-normal text-[#252a24]">Dashboard</h1>
          <p className="mt-2 text-lg font-medium text-muted">Track tax obligations, receipts, and wallet-backed compliance from one view.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="/dashboard/tax-items" className="inline-flex h-12 items-center gap-2 rounded-[1.1rem] bg-primary px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(4,118,59,0.2)]">
              + Pay Tax Item
            </a>
            <a href="/dashboard/payments" className="inline-flex h-12 items-center rounded-[1.1rem] border border-[#e2e5dc] bg-white px-5 text-sm font-black text-[#252a24]">
              View Receipts
            </a>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <article className="rounded-[1.5rem] bg-primary p-6 text-white shadow-[0_16px_32px_rgba(4,118,59,0.22)]">
            <div className="mb-12 flex items-start justify-between">
              <p className="text-sm font-bold text-white/80">Total Paid</p>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/16"><ArrowUpRight className="h-4 w-4" /></span>
            </div>
            <p className="text-4xl font-black">₦{totalPaid.toLocaleString("en-NG")}</p>
            <p className="mt-8 flex items-center gap-2 text-sm font-semibold text-white/75"><ArrowUpRight className="h-4 w-4" /> Confirmed receipts only</p>
          </article>

          {summaryCards.map(({ label, icon: Icon, kind, href, caption }) => {
            const value = kind === "confirmed" ? confirmedPayments.length : kind === "pending" ? pendingPayments.length : taxItems.filter((item) => item.isActive).length;
            return (
              <Link
                key={label}
                href={href}
                className="group rounded-[1.5rem] border border-[#e2e5dc] bg-white p-6 shadow-[0_10px_24px_rgba(31,36,30,0.06)] transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_16px_30px_rgba(31,36,30,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <div className="mb-12 flex items-start justify-between">
                  <p className="text-sm font-black text-muted">{label}</p>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white transition group-hover:scale-105"><Icon className="h-4 w-4" /></span>
                </div>
                <p className="text-4xl font-black text-[#252a24]">{value}</p>
                <p className="mt-8 flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors group-hover:text-primary">
                  {caption}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </p>
              </Link>
            );
          })}
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
          <article className="rounded-[1.5rem] border border-[#e2e5dc] bg-white p-7 shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-2xl font-black">Payment Analytics</h2>
              <span className="flex items-center gap-2 text-sm font-bold text-muted"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Last 7 days</span>
            </div>
            <div className="flex h-72 items-end gap-8 px-4">
              {activity.map((item) => (
                <div key={item.key} className="flex flex-1 flex-col items-center gap-3">
                  <span className="w-full rounded-t-[1rem] bg-primary/80" style={{ height: `${Math.max(6, item.height * 2)}px` }} />
                  <span className="text-lg font-bold text-muted">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-[#edf0e8] pt-6 text-lg font-medium text-muted">
              <span>Receipts: <strong className="text-[#252a24]">{confirmedPayments.length}</strong></span>
              <span>Pending: <strong className="text-primary">{pendingPayments.length}</strong></span>
            </div>
          </article>

          <article className="rounded-[1.5rem] border border-[#e2e5dc] bg-white p-7 shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
            <h2 className="text-2xl font-black">Compliance Status</h2>
            <div className="mt-10 grid place-items-center">
              <div className="grid h-48 w-48 place-items-center rounded-full" style={{ background: `conic-gradient(#04763b 0 ${progress}%, #d9e8dc ${progress}% 100%)` }}>
                <div className="grid h-36 w-36 place-items-center rounded-full bg-white text-center">
                  <div>
                    <p className="text-5xl font-black">{progress}%</p>
                    <p className="mt-1 text-sm font-bold text-muted">Complete</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 text-center text-xs font-bold text-muted">
              <span className="rounded-full bg-accent px-3 py-2 text-primary">Confirmed</span>
              <span className="rounded-full bg-[#f3f2ea] px-3 py-2">Pending</span>
              <span className="rounded-full bg-[#fbe8ed] px-3 py-2 text-rose-600">Due</span>
            </div>
          </article>
        </div>

        <article className="mt-5 rounded-[1.5rem] border border-[#e2e5dc] bg-white p-7 shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-black">Recent Payments</h2>
            <a href="/dashboard/payments" className="rounded-full border border-[#e2e5dc] px-4 py-2 text-sm font-black">View all</a>
          </div>
          <div className="grid gap-3">
            {payments.length ? payments.slice(0, 4).map((payment) => (
              <div key={payment.id} className="grid gap-3 rounded-[1.25rem] px-4 py-4 transition hover:bg-[#f3f5ef] sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div>
                  <p className="font-black">{payment.taxItemName}</p>
                  <p className="mt-1 text-sm font-medium text-muted">{payment.category ?? "Tax"} • {new Date(payment.createdAt).toLocaleDateString("en-NG")}</p>
                </div>
                <p className="font-mono font-black">{payment.amountLabel}</p>
                <span className={`rounded-full px-4 py-2 text-sm font-black ${payment.status === "CONFIRMED" ? "bg-accent text-primary" : "bg-[#fff3c9] text-amber-700"}`}>
                  {payment.status}
                </span>
              </div>
            )) : (
              <div className="rounded-[1.25rem] bg-[#f7f8f4] px-4 py-6 text-center font-bold text-muted">
                No payments have been created for this profile.
              </div>
            )}
          </div>
        </article>
      </section>

      <aside className="grid h-fit gap-5">
        <article className="rounded-[1.5rem] border border-[#e2e5dc] bg-white p-7 shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
          <h2 className="text-2xl font-black">Taxpayer Profile</h2>
          <div className="mt-8 rounded-[1.25rem] border border-[#e2e5dc] p-5">
            <p className="text-lg font-black">{displayName}</p>
            <p className="mt-2 text-sm font-bold text-muted">{user?.profileType ?? "Profile pending"}</p>
            <p className="mt-4 break-all rounded-2xl bg-[#f7f8f4] p-4 font-mono text-sm font-black">{user?.tin ?? "TIN unavailable"}</p>
            <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary">
              <BadgeCheck className="h-4 w-4" />
              {user?.status ?? "UNKNOWN"} account
            </div>
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-[#e2e5dc] bg-white p-7 shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
          <h2 className="text-2xl font-black">Reminders</h2>
          <div className="mt-8 rounded-[1.25rem] border border-[#e2e5dc] p-5">
            <p className="font-black">VAT monthly remittance</p>
            <p className="mt-2 text-sm font-medium text-muted">Due window: 21st of every month</p>
            <a href="/dashboard/tax-items" className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[1rem] bg-primary text-sm font-black text-white">
              <CalendarClock className="h-4 w-4" />
              Review Tax Items
            </a>
          </div>
        </article>

        <article className="rounded-[1.5rem] bg-[#182018] p-7 text-white shadow-[0_14px_30px_rgba(24,32,24,0.22)]">
          <WalletCards className="h-7 w-7" />
          <h2 className="mt-8 text-2xl font-black">SCA Wallet</h2>
          <p className="mt-2 text-sm font-medium text-white/55">Managed wallet for chain-backed tax records.</p>
          <p className="mt-6 break-all rounded-[1rem] bg-white/8 p-4 font-mono text-xs text-white/75">
            {user?.walletAddress ?? "Wallet unavailable"}
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-[#e2e5dc] bg-white p-7 shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
          <h2 className="text-2xl font-black">Tax Catalogue</h2>
          <div className="mt-6 grid gap-3">
            {taxItems.length ? taxItems.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-[1rem] bg-[#f7f8f4] px-4 py-3">
                <span className="font-bold">{item.name}</span>
                <span className="text-sm font-black text-primary">{item.rateLabel}</span>
              </div>
            )) : (
              <div className="rounded-[1rem] bg-[#f7f8f4] px-4 py-4 text-sm font-bold text-muted">
                No tax items are available.
              </div>
            )}
          </div>
        </article>
      </aside>
    </div>
  );
}
