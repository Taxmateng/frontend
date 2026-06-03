"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, ExternalLink, FileWarning, ReceiptText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiGet, isUnauthorizedError, redirectToLogin } from "@/lib/api";

type PaymentItem = {
  id: string;
  taxItemName: string;
  category?: string | null;
  tin: string;
  amountLabel: string;
  status: string;
  createdAt: string;
  receiptUrl?: string | null;
  txHash?: string | null;
};

const filters = ["ALL", "PENDING", "CONFIRMED", "FAILED"];
const statCards: { label: string; icon: LucideIcon; kind: "confirmed" | "pending" | "failed" }[] = [
  { label: "Confirmed", icon: CheckCircle2, kind: "confirmed" },
  { label: "Pending", icon: Clock3, kind: "pending" },
  { label: "Issues", icon: FileWarning, kind: "failed" }
];

function statusClass(status: string): string {
  if (status === "CONFIRMED" || status === "PAID") {
    return "bg-accent text-primary";
  }
  if (status === "FAILED") {
    return "bg-[#fbe8ed] text-rose-600";
  }
  return "bg-[#fff3c9] text-amber-700";
}

export default function PaymentsPage() {
  const [rows, setRows] = useState<PaymentItem[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const data = await apiGet<{ items: PaymentItem[] }>("/user/payment-history");
        setRows(data.items);
      } catch (fetchError) {
        if (isUnauthorizedError(fetchError)) {
          redirectToLogin();
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : "Unable to load payment history");
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  const filteredRows = useMemo(() => {
    if (filter === "ALL") {
      return rows;
    }
    return rows.filter((row) => row.status === filter);
  }, [filter, rows]);

  if (loading) {
    return <div className="grid min-h-80 place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>;
  }

  if (error) {
    return (
      <div className="rounded-[1.5rem] border border-[#e2e5dc] bg-white p-8 shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
        <h1 className="text-2xl font-black">Payment history unavailable</h1>
        <p className="mt-2 font-medium text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-normal text-[#252a24]">Payment History</h1>
          <p className="mt-2 text-lg font-medium text-muted">Review invoices, payment status, receipts, and chain confirmations.</p>
        </div>
        <div className="flex flex-wrap gap-2 rounded-[1.1rem] border border-[#e2e5dc] bg-white p-1">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={filter === item ? "h-10 rounded-[0.85rem] bg-primary px-4 text-sm font-black text-white" : "h-10 rounded-[0.85rem] px-4 text-sm font-black text-muted"}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-[#e2e5dc] bg-white shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
        <div className="grid gap-4 border-b border-[#edf0e8] p-6 md:grid-cols-3">
          {statCards.map(({ label, icon: Icon, kind }) => {
            const value = kind === "confirmed" ? rows.filter((row) => row.status === "CONFIRMED" || row.status === "PAID").length : kind === "pending" ? rows.filter((row) => row.status === "PENDING").length : rows.filter((row) => row.status === "FAILED").length;
            return (
              <div key={label} className="flex items-center gap-4 rounded-[1.1rem] bg-[#f7f8f4] p-4">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-primary"><Icon className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-bold text-muted">{label}</p>
                  <p className="text-2xl font-black">{value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#edf0e8] text-muted">
                <th className="p-5 font-black">Tax Item</th>
                <th className="p-5 font-black">TIN</th>
                <th className="p-5 font-black">Amount</th>
                <th className="p-5 font-black">Date</th>
                <th className="p-5 font-black">Status</th>
                <th className="p-5 text-right font-black">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length ? filteredRows.map((row) => (
                <tr key={row.id} className="border-b border-[#f0f2ec] last:border-0">
                  <td className="p-5">
                    <p className="font-black">{row.taxItemName}</p>
                    <p className="mt-1 text-xs font-bold text-muted">{row.category ?? "Tax obligation"}</p>
                  </td>
                  <td className="p-5 font-mono font-bold text-muted">{row.tin}</td>
                  <td className="p-5 font-mono font-black">{row.amountLabel}</td>
                  <td className="p-5 font-bold text-muted">{new Date(row.createdAt).toLocaleDateString("en-NG")}</td>
                  <td className="p-5">
                    <span className={`inline-flex rounded-full px-4 py-2 text-xs font-black ${statusClass(row.status)}`}>{row.status}</span>
                  </td>
                  <td className="p-5 text-right">
                    {row.receiptUrl || row.txHash ? (
                      <a href={row.receiptUrl ?? "#"} className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-4 text-xs font-black text-primary">
                        <ExternalLink className="h-4 w-4" />
                        View
                      </a>
                    ) : (
                      <span className="inline-flex h-10 items-center gap-2 rounded-full bg-[#f7f8f4] px-4 text-xs font-black text-muted">
                        <ReceiptText className="h-4 w-4" />
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center font-bold text-muted">
                    No payments match this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
