"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CreditCard,
  ExternalLink,
  FileClock,
  FileText,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  Settings,
  ShieldCheck,
  Trash2,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiDelete, apiGet, apiPatch, apiPost, isForbiddenError, isUnauthorizedError, redirectToLogin } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Logo } from "@/components/Logo";
import { EXPLORER_TX_URL } from "@/components/payment-flow";

type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

type Kpis = {
  totalUsers: number;
  activeUsers: number;
  totalRevenueLabel: string;
  activeTaxItems: number;
  pendingPayments: number;
  confirmedPayments: number;
  pendingChainConfirms: number;
};

type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  status: string;
  profileType?: string | null;
  tin?: string | null;
  walletAddress?: string | null;
  onChainRegistered?: boolean;
  createdAt: string;
};

type AdminPayment = {
  id: string;
  userEmail?: string | null;
  taxItemName: string;
  category?: string | null;
  tin: string;
  amountLabel: string;
  status: string;
  txHash?: string | null;
  createdAt: string;
};

type CategoryTotal = { category: string; count: number; total: number; totalLabel: string };
type TaxItem = { id: string; onChainItemId: number; name: string; category: string; rateLabel: string; rateBasisPoints: number; isActive: boolean };
type AuditItem = { id: string; action: string; entityType: string; entityId: string; createdAt: string };
type SystemInfo = {
  contractAddress?: string | null;
  network?: string | null;
  adminWalletConfigured?: boolean;
  taxItemCount?: number;
  integrations?: Record<string, boolean>;
};

type Section = "overview" | "taxpayers" | "payments" | "tax-items" | "admins" | "audit" | "settings";

const SECTIONS: { key: Section; label: string; icon: LucideIcon; superOnly: boolean }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard, superOnly: false },
  { key: "taxpayers", label: "Taxpayers", icon: UsersRound, superOnly: false },
  { key: "payments", label: "Payments", icon: CreditCard, superOnly: false },
  { key: "tax-items", label: "Tax Items", icon: FileText, superOnly: false },
  { key: "admins", label: "Admins", icon: ShieldCheck, superOnly: true },
  { key: "audit", label: "Audit Log", icon: FileClock, superOnly: true },
  { key: "settings", label: "Settings", icon: Settings, superOnly: true }
];

const CARD = "rounded-[1.5rem] border border-[#e2e5dc] bg-white shadow-[0_10px_24px_rgba(31,36,30,0.06)]";

function statusClass(status: string): string {
  if (status === "ACTIVE" || status === "CONFIRMED" || status === "PAID") return "bg-accent text-primary";
  if (status === "SUSPENDED" || status === "FAILED" || status === "EXPIRED") return "bg-[#fbe8ed] text-rose-600";
  return "bg-[#fff3c9] text-amber-700";
}

export default function AdminPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [section, setSection] = useState<Section>("overview");
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [categories, setCategories] = useState<CategoryTotal[]>([]);
  const [taxItems, setTaxItems] = useState<TaxItem[]>([]);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [system, setSystem] = useState<SystemInfo | null>(null);

  const isSuper = role === "SUPER_ADMIN";

  const refreshUsers = useCallback(async () => {
    setUsers((await apiGet<{ items: AdminUser[] }>("/admin/users")).items);
  }, []);
  const refreshTaxItems = useCallback(async () => {
    setTaxItems((await apiGet<{ items: TaxItem[] }>("/admin/tax-items")).items);
  }, []);
  const refreshPayments = useCallback(async () => {
    setPayments((await apiGet<{ items: AdminPayment[] }>("/admin/payments")).items);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const me = await apiGet<{ role?: Role }>("/auth/me");
        if (me.role !== "ADMIN" && me.role !== "SUPER_ADMIN") {
          setForbidden(true);
          return;
        }
        setRole(me.role);
        const superUser = me.role === "SUPER_ADMIN";

        const [overview, userData, paymentData, categoryData, taxItemData] = await Promise.all([
          apiGet<{ kpis: Kpis }>("/admin/analytics/overview"),
          apiGet<{ items: AdminUser[] }>("/admin/users"),
          apiGet<{ items: AdminPayment[] }>("/admin/payments"),
          apiGet<{ items: CategoryTotal[] }>("/admin/analytics/by-category"),
          apiGet<{ items: TaxItem[] }>("/admin/tax-items")
        ]);
        setKpis(overview.kpis);
        setUsers(userData.items);
        setPayments(paymentData.items);
        setCategories(categoryData.items);
        setTaxItems(taxItemData.items);

        if (superUser) {
          const [auditData, systemData] = await Promise.all([
            apiGet<{ items: AuditItem[] }>("/admin/audit-log"),
            apiGet<SystemInfo>("/admin/system")
          ]);
          setAudit(auditData.items);
          setSystem(systemData);
        }
      } catch (err) {
        if (isUnauthorizedError(err)) return redirectToLogin();
        if (isForbiddenError(err)) return setForbidden(true);
        setError(err instanceof Error ? err.message : "Unable to load admin dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-background"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }
  if (forbidden) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5 text-[#252a24]">
        <div className={`max-w-md p-8 text-center ${CARD}`}>
          <h1 className="text-2xl font-black">Admin access required</h1>
          <p className="mt-2 font-medium text-muted">Your account does not have permission to view this dashboard.</p>
          <Link href="/dashboard" className="mt-6 inline-flex h-12 items-center justify-center rounded-[1rem] bg-primary px-5 text-sm font-black text-white">Return to Dashboard</Link>
        </div>
      </div>
    );
  }
  if (error || !kpis) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5 text-[#252a24]">
        <div className={`max-w-md p-8 text-center ${CARD}`}>
          <h1 className="text-2xl font-black">Admin dashboard unavailable</h1>
          <p className="mt-2 font-medium text-muted">{error ?? "Admin metrics could not be loaded."}</p>
        </div>
      </div>
    );
  }

  const visibleSections = SECTIONS.filter((item) => !item.superOnly || isSuper);

  return (
    <div className="min-h-screen bg-background text-[#252a24]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col border-r border-[#e2e5dc] bg-[#fbfcf8] px-5 py-6 lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={44} />
          <span className="text-xl font-black">Taxmate</span>
        </Link>
        <p className="mt-1 text-xs font-black uppercase tracking-wide text-primary">{isSuper ? "Super Admin" : "Admin"}</p>

        <nav className="mt-8 flex-1">
          {visibleSections.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={section === key
                ? "mb-2 flex h-12 w-full items-center gap-3 rounded-[1.25rem] bg-primary px-4 text-sm font-black text-white shadow-[0_12px_28px_rgba(4,118,59,0.18)]"
                : "mb-2 flex h-12 w-full items-center gap-3 rounded-[1.25rem] px-4 text-sm font-black text-muted transition hover:bg-[#eef3e9]"}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>
        <Link href="/dashboard" className="flex h-12 items-center justify-center rounded-[1.25rem] border border-[#e2e5dc] bg-white text-sm font-black">Taxpayer View</Link>
      </aside>

      <div className="lg:pl-[280px]">
        <main className="px-5 pb-12 pt-7 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black">{SECTIONS.find((s) => s.key === section)?.label}</h1>
              <p className="mt-2 font-medium text-muted">Taxmate administration console</p>
            </div>
            <span className="rounded-full bg-accent px-4 py-2 text-sm font-black text-primary">{role}</span>
          </div>

          {section === "overview" && <Overview kpis={kpis} categories={categories} payments={payments} />}
          {section === "taxpayers" && <Taxpayers users={users} isSuper={isSuper} onChanged={refreshUsers} />}
          {section === "payments" && <Payments payments={payments} onChanged={refreshPayments} />}
          {section === "tax-items" && <TaxItems items={taxItems} onChanged={refreshTaxItems} />}
          {section === "admins" && isSuper && <Admins users={users} onChanged={refreshUsers} />}
          {section === "audit" && isSuper && <Audit audit={audit} />}
          {section === "settings" && isSuper && <SettingsView system={system} />}
        </main>
      </div>
    </div>
  );
}

function Overview({ kpis, categories, payments }: { kpis: Kpis; categories: CategoryTotal[]; payments: AdminPayment[] }) {
  const cards: { label: string; value: string | number; icon: LucideIcon; primary?: boolean }[] = [
    { label: "Total Revenue", value: kpis.totalRevenueLabel, icon: CreditCard, primary: true },
    { label: "Total Users", value: kpis.totalUsers, icon: UsersRound },
    { label: "Active Tax Items", value: kpis.activeTaxItems, icon: FileText },
    { label: "Pending Chain Confirms", value: kpis.pendingChainConfirms, icon: RefreshCw }
  ];
  const max = Math.max(...categories.map((c) => c.total), 1);
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, primary }) => (
          <article key={label} className={primary ? "rounded-[1.5rem] bg-primary p-6 text-white shadow-[0_16px_32px_rgba(4,118,59,0.22)]" : `${CARD} p-6`}>
            <div className="mb-10 flex items-start justify-between">
              <p className={primary ? "text-sm font-bold text-white/80" : "text-sm font-black text-muted"}>{label}</p>
              <span className={primary ? "grid h-9 w-9 place-items-center rounded-full bg-white/16" : "grid h-9 w-9 place-items-center rounded-full bg-primary text-white"}><Icon className="h-4 w-4" /></span>
            </div>
            <p className="text-3xl font-black">{value}</p>
          </article>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className={`${CARD} p-7`}>
          <div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /><h2 className="text-2xl font-black">Revenue by Category</h2></div>
          {categories.length ? (
            <div className="mt-10 flex h-64 items-end gap-7 px-2">
              {categories.map((c) => (
                <div key={c.category} className="flex flex-1 flex-col items-center gap-3">
                  <span className="text-xs font-bold text-muted">{c.totalLabel}</span>
                  <span className="w-full rounded-t-[1rem] bg-primary/80" style={{ height: `${Math.max(8, Math.round((c.total / max) * 180))}px` }} />
                  <span className="text-sm font-black text-muted">{c.category}</span>
                </div>
              ))}
            </div>
          ) : <p className="mt-7 rounded-[1.1rem] bg-[#f7f8f4] p-6 text-center font-bold text-muted">No payment totals yet.</p>}
        </article>
        <article className={`${CARD} p-7`}>
          <h2 className="text-2xl font-black">Recent Payments</h2>
          <div className="mt-6 grid gap-3">
            {payments.slice(0, 5).map((p) => (
              <div key={p.id} className="rounded-[1.1rem] bg-[#f7f8f4] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black">{p.taxItemName}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(p.status)}`}>{p.status}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-muted">{p.userEmail ?? "Unknown"} • {p.amountLabel}</p>
              </div>
            ))}
            {!payments.length && <p className="rounded-[1.1rem] bg-[#f7f8f4] p-6 text-center font-bold text-muted">No payments yet.</p>}
          </div>
        </article>
      </div>
    </div>
  );
}

function Taxpayers({ users, isSuper, onChanged }: { users: AdminUser[]; isSuper: boolean; onChanged: () => Promise<void> }) {
  const [busy, setBusy] = useState<string | null>(null);
  const taxpayers = users.filter((u) => u.role === "USER");

  async function setStatus(id: string, status: string) {
    setBusy(id);
    try {
      await apiPatch(`/admin/users/${id}/status`, { status });
      await onChanged();
      toast.success(`Taxpayer ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status");
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className={`${CARD} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead><tr className="border-b border-[#edf0e8] text-muted">
            <th className="p-5 font-black">Taxpayer</th><th className="p-5 font-black">TIN</th><th className="p-5 font-black">Type</th>
            <th className="p-5 font-black">On-chain</th><th className="p-5 font-black">Status</th>{isSuper && <th className="p-5 text-right font-black">Action</th>}
          </tr></thead>
          <tbody>
            {taxpayers.map((u) => (
              <tr key={u.id} className="border-b border-[#f0f2ec] last:border-0">
                <td className="p-5"><p className="font-black">{u.displayName}</p><p className="mt-1 text-xs font-bold text-muted">{u.email}</p></td>
                <td className="p-5 font-mono font-bold text-muted">{u.tin ?? "—"}</td>
                <td className="p-5 font-bold text-muted">{u.profileType ?? "—"}</td>
                <td className="p-5">{u.onChainRegistered ? <span className="text-xs font-black text-primary">Registered</span> : <span className="text-xs font-bold text-muted">Pending</span>}</td>
                <td className="p-5"><span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(u.status)}`}>{u.status}</span></td>
                {isSuper && (
                  <td className="p-5 text-right">
                    {u.status === "SUSPENDED" ? (
                      <button disabled={busy === u.id} onClick={() => setStatus(u.id, "ACTIVE")} className="rounded-full bg-accent px-4 py-2 text-xs font-black text-primary disabled:opacity-60">Activate</button>
                    ) : (
                      <button disabled={busy === u.id} onClick={() => setStatus(u.id, "SUSPENDED")} className="rounded-full bg-[#fbe8ed] px-4 py-2 text-xs font-black text-rose-600 disabled:opacity-60">Suspend</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {!taxpayers.length && <tr><td colSpan={6} className="p-8 text-center font-bold text-muted">No taxpayers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function Payments({ payments, onChanged }: { payments: AdminPayment[]; onChanged: () => Promise<void> }) {
  const [filter, setFilter] = useState("ALL");
  const [busy, setBusy] = useState<string | null>(null);
  const filters = ["ALL", "PENDING", "PAID", "CONFIRMED", "FAILED"];
  const rows = useMemo(() => (filter === "ALL" ? payments : payments.filter((p) => p.status === filter)), [filter, payments]);

  async function retry(id: string) {
    setBusy(id);
    try {
      await apiPost(`/admin/payments/${id}/retry-onchain`, {});
      await onChanged();
      toast.success("Re-queued on-chain recording");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not retry");
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className={`${CARD} overflow-hidden`}>
      <div className="flex flex-wrap gap-2 border-b border-[#edf0e8] p-5">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={filter === f ? "h-10 rounded-[0.85rem] bg-primary px-4 text-sm font-black text-white" : "h-10 rounded-[0.85rem] px-4 text-sm font-black text-muted"}>{f}</button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead><tr className="border-b border-[#edf0e8] text-muted">
            <th className="p-5 font-black">Tax Item</th><th className="p-5 font-black">Payer</th><th className="p-5 font-black">Amount</th>
            <th className="p-5 font-black">Status</th><th className="p-5 text-right font-black">On-chain</th>
          </tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-[#f0f2ec] last:border-0">
                <td className="p-5"><p className="font-black">{p.taxItemName}</p><p className="mt-1 text-xs font-bold text-muted">{p.category ?? "Tax"} • {p.tin}</p></td>
                <td className="p-5 font-medium text-muted">{p.userEmail ?? "—"}</td>
                <td className="p-5 font-mono font-black">{p.amountLabel}</td>
                <td className="p-5"><span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(p.status)}`}>{p.status}</span></td>
                <td className="p-5">
                  <div className="flex items-center justify-end gap-2">
                    {p.txHash ? (
                      <a href={`${EXPLORER_TX_URL}${p.txHash}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#f3f5ef] px-3 text-xs font-black"><ExternalLink className="h-3.5 w-3.5" />Tx</a>
                    ) : null}
                    {p.status === "PAID" && !p.txHash ? (
                      <button disabled={busy === p.id} onClick={() => retry(p.id)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-black text-white disabled:opacity-60">
                        {busy === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}Retry
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="p-8 text-center font-bold text-muted">No payments match this view.</td></tr>}
          </tbody>
        </table>
      </div>
    </article>
  );
}

const TAX_CATEGORIES = ["WHT", "PAYE", "VAT", "INCOME_TAX", "CORPORATE_TAX"];

function TaxItems({ items, onChanged }: { items: TaxItem[]; onChanged: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("VAT");
  const [rate, setRate] = useState("");
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);

  async function create() {
    if (!name || !description || !rate) return toast.error("Fill in name, description and rate");
    setCreating(true);
    try {
      await apiPost("/admin/tax-items", { name, description, category, rateBasisPoints: Math.round(Number(rate) * 100) });
      setName(""); setDescription(""); setRate("");
      await onChanged();
      toast.success("Tax item created on-chain");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create tax item");
    } finally {
      setCreating(false);
    }
  }

  async function toggle(item: TaxItem) {
    setBusy(item.onChainItemId);
    try {
      await apiPatch(`/admin/tax-items/${item.onChainItemId}`, { isActive: !item.isActive });
      await onChanged();
      toast.success(item.isActive ? "Deactivated" : "Activated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-5">
      <article className={`${CARD} p-6`}>
        <h2 className="text-xl font-black">Create tax item</h2>
        <p className="mt-1 text-sm font-medium text-muted">Created on-chain via the contract and mirrored to the catalogue. Rate in % (e.g. 7.5).</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. Value Added Tax)" className="h-12 rounded-[1rem] border border-[#e2e5dc] bg-[#f7f8f4] px-4 text-sm font-medium outline-none focus:border-primary" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-12 rounded-[1rem] border border-[#e2e5dc] bg-[#f7f8f4] px-4 text-sm font-bold outline-none focus:border-primary">
            {TAX_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="h-12 rounded-[1rem] border border-[#e2e5dc] bg-[#f7f8f4] px-4 text-sm font-medium outline-none focus:border-primary sm:col-span-2" />
          <input value={rate} onChange={(e) => setRate(e.target.value)} type="number" min="0" step="0.01" placeholder="Rate %" className="h-12 rounded-[1rem] border border-[#e2e5dc] bg-[#f7f8f4] px-4 text-sm font-medium outline-none focus:border-primary" />
          <button onClick={create} disabled={creating} className="inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] bg-primary text-sm font-black text-white disabled:opacity-60">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Create on-chain
          </button>
        </div>
      </article>

      <article className={`${CARD} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead><tr className="border-b border-[#edf0e8] text-muted">
              <th className="p-5 font-black">#</th><th className="p-5 font-black">Name</th><th className="p-5 font-black">Category</th>
              <th className="p-5 font-black">Rate</th><th className="p-5 font-black">Active</th><th className="p-5 text-right font-black">Action</th>
            </tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-[#f0f2ec] last:border-0">
                  <td className="p-5 font-mono font-black text-muted">{item.onChainItemId}</td>
                  <td className="p-5 font-black">{item.name}</td>
                  <td className="p-5 font-bold text-muted">{item.category}</td>
                  <td className="p-5 font-black text-primary">{item.rateLabel}</td>
                  <td className="p-5"><span className={`rounded-full px-3 py-1 text-xs font-black ${item.isActive ? "bg-accent text-primary" : "bg-[#f3f2ea] text-muted"}`}>{item.isActive ? "Active" : "Inactive"}</span></td>
                  <td className="p-5 text-right">
                    <button disabled={busy === item.onChainItemId} onClick={() => toggle(item)} className="rounded-full bg-[#f3f5ef] px-4 py-2 text-xs font-black disabled:opacity-60">{item.isActive ? "Deactivate" : "Activate"}</button>
                  </td>
                </tr>
              ))}
              {!items.length && <tr><td colSpan={6} className="p-8 text-center font-bold text-muted">No tax items yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}

function Admins({ users, onChanged }: { users: AdminUser[]; onChanged: () => Promise<void> }) {
  const admins = users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function create() {
    if (!email || password.length < 8) return toast.error("Valid email and 8+ char password required");
    setCreating(true);
    try {
      await apiPost("/admin/admins", { email, password, role });
      setEmail(""); setPassword("");
      await onChanged();
      toast.success("Admin created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create admin");
    } finally {
      setCreating(false);
    }
  }

  async function demote(id: string) {
    setBusy(id);
    try {
      await apiDelete(`/admin/admins/${id}`);
      await onChanged();
      toast.success("Admin demoted to user");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not demote");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-5">
      <article className={`${CARD} p-6`}>
        <h2 className="text-xl font-black">Create admin</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="h-12 rounded-[1rem] border border-[#e2e5dc] bg-[#f7f8f4] px-4 text-sm font-medium outline-none focus:border-primary" />
          <select value={role} onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPER_ADMIN")} className="h-12 rounded-[1rem] border border-[#e2e5dc] bg-[#f7f8f4] px-4 text-sm font-bold outline-none focus:border-primary">
            <option value="ADMIN">ADMIN</option><option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password (8+ chars)" className="h-12 rounded-[1rem] border border-[#e2e5dc] bg-[#f7f8f4] px-4 text-sm font-medium outline-none focus:border-primary" />
          <button onClick={create} disabled={creating} className="inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] bg-primary text-sm font-black text-white disabled:opacity-60">{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Create admin</button>
        </div>
      </article>
      <article className={`${CARD} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead><tr className="border-b border-[#edf0e8] text-muted"><th className="p-5 font-black">Email</th><th className="p-5 font-black">Role</th><th className="p-5 font-black">Status</th><th className="p-5 text-right font-black">Action</th></tr></thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-b border-[#f0f2ec] last:border-0">
                  <td className="p-5 font-black">{a.email}</td>
                  <td className="p-5"><span className="rounded-full bg-accent px-3 py-1 text-xs font-black text-primary">{a.role}</span></td>
                  <td className="p-5"><span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(a.status)}`}>{a.status}</span></td>
                  <td className="p-5 text-right">
                    <button disabled={busy === a.id} onClick={() => demote(a.id)} className="inline-flex items-center gap-1.5 rounded-full bg-[#fbe8ed] px-4 py-2 text-xs font-black text-rose-600 disabled:opacity-60"><Trash2 className="h-3.5 w-3.5" />Demote</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}

function Audit({ audit }: { audit: AuditItem[] }) {
  return (
    <article className={`${CARD} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead><tr className="border-b border-[#edf0e8] text-muted"><th className="p-5 font-black">Action</th><th className="p-5 font-black">Entity</th><th className="p-5 font-black">Target</th><th className="p-5 font-black">When</th></tr></thead>
          <tbody>
            {audit.map((a) => (
              <tr key={a.id} className="border-b border-[#f0f2ec] last:border-0">
                <td className="p-5 font-black">{a.action}</td>
                <td className="p-5 font-bold text-muted">{a.entityType}</td>
                <td className="p-5 font-mono text-xs text-muted">{a.entityId}</td>
                <td className="p-5 font-medium text-muted">{new Date(a.createdAt).toLocaleString("en-NG")}</td>
              </tr>
            ))}
            {!audit.length && <tr><td colSpan={4} className="p-8 text-center font-bold text-muted">No audit events yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function SettingsView({ system }: { system: SystemInfo | null }) {
  if (!system) return <p className="rounded-[1.1rem] bg-[#f7f8f4] p-6 text-center font-bold text-muted">System info unavailable.</p>;
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <article className={`${CARD} p-7`}>
        <h2 className="text-xl font-black">On-chain</h2>
        <div className="mt-5 grid gap-3 text-sm">
          <Row label="Network" value={system.network ?? "—"} />
          <Row label="Contract" value={system.contractAddress ?? "—"} mono />
          <Row label="Admin wallet configured" value={system.adminWalletConfigured ? "Yes" : "No"} />
          <Row label="Tax items" value={String(system.taxItemCount ?? 0)} />
        </div>
      </article>
      <article className={`${CARD} p-7`}>
        <h2 className="text-xl font-black">Integrations</h2>
        <div className="mt-5 grid gap-3 text-sm">
          {Object.entries(system.integrations ?? {}).map(([name, ok]) => (
            <div key={name} className="flex items-center justify-between rounded-[1rem] bg-[#f7f8f4] px-4 py-3">
              <span className="font-bold capitalize text-muted">{name}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${ok ? "bg-accent text-primary" : "bg-[#fff3c9] text-amber-700"}`}>{ok ? "Live" : "Mock"}</span>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-[1rem] bg-[#f7f8f4] px-4 py-3">
      <span className="font-bold text-muted">{label}</span>
      <span className={`font-black ${mono ? "break-all font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
