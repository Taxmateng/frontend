"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, Loader2, ReceiptText, ShieldCheck, X } from "lucide-react";
import { apiGet, apiPost, isUnauthorizedError, redirectToLogin } from "@/lib/api";
import { toast } from "@/lib/toast";
import { EXPLORER_TX_URL, STAGE_MESSAGE, STAGE_TITLE, StageTracker, isTerminal, type FlowStage } from "@/components/payment-flow";

type TaxItem = {
  id: string;
  onChainItemId: number;
  name: string;
  description?: string | null;
  category: string;
  rateLabel: string;
  rateBasisPoints: number;
  isActive: boolean;
};

type InvoiceSummary = {
  id: string;
  taxItemName: string;
  amountLabel: string;
  status: string;
  txHash?: string | null;
  receiptUrl?: string | null;
};

type CreateInvoiceResponse = {
  item: InvoiceSummary;
  payment?: { checkoutUrl?: string | null };
};

type Flow = {
  item: TaxItem;
  invoiceId?: string;
  amountLabel?: string;
  stage: FlowStage;
  message: string;
  checkoutUrl?: string | null;
  txHash?: string | null;
  receiptUrl?: string | null;
};

export default function TaxItemsPage() {
  const [items, setItems] = useState<TaxItem[]>([]);
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flow, setFlow] = useState<Flow | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        const data = await apiGet<{ items: TaxItem[] }>("/tax-items");
        setItems(data.items);
      } catch (fetchError) {
        if (isUnauthorizedError(fetchError)) {
          redirectToLogin();
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : "Unable to load tax items");
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  // Poll the invoice while it moves through payment -> on-chain recording.
  useEffect(() => {
    const invoiceId = flow?.invoiceId;
    if (!invoiceId || flow?.stage === "confirmed" || flow?.stage === "failed" || flow?.stage === "expired") {
      return;
    }

    let active = true;
    let polls = 0;
    const maxPolls = 100; // ~5 minutes at 3s

    async function poll() {
      if (!active) return;
      try {
        const { item } = await apiGet<{ item: InvoiceSummary }>(`/payments/invoice/${invoiceId}`);
        if (!active) return;

        if (item.status === "CONFIRMED") {
          setFlow((f) => (f ? { ...f, stage: "confirmed", message: STAGE_MESSAGE.confirmed, txHash: item.txHash, receiptUrl: item.receiptUrl } : f));
          return;
        }
        if (item.status === "FAILED") {
          setFlow((f) => (f ? { ...f, stage: "failed", message: STAGE_MESSAGE.failed } : f));
          return;
        }
        if (item.status === "EXPIRED") {
          setFlow((f) => (f ? { ...f, stage: "expired", message: STAGE_MESSAGE.expired } : f));
          return;
        }
        if (item.status === "PAID") {
          setFlow((f) => (f && f.stage !== "recording" ? { ...f, stage: "recording", message: STAGE_MESSAGE.recording } : f));
        }
      } catch {
        // transient error — keep polling
      }

      polls += 1;
      if (active && polls < maxPolls) {
        setTimeout(poll, 3000);
      } else if (active) {
        setFlow((f) => (f ? { ...f, message: "Still processing. You can close this and check Payment History shortly." } : f));
      }
    }

    const starter = setTimeout(poll, 1500);
    return () => {
      active = false;
      clearTimeout(starter);
    };
  }, [flow?.invoiceId, flow?.stage]);

  async function startPayment(item: TaxItem) {
    const amount = Number(amounts[item.onChainItemId] || "50000");
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    setFlow({ item, stage: "creating", message: STAGE_MESSAGE.creating });
    try {
      const response = await apiPost<CreateInvoiceResponse>("/payments/invoice", {
        onChainItemId: item.onChainItemId,
        amount
      });

      const checkoutUrl = response.payment?.checkoutUrl ?? null;
      if (checkoutUrl) {
        window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      }

      setFlow({
        item,
        invoiceId: response.item.id,
        amountLabel: response.item.amountLabel,
        stage: "awaiting_payment",
        message: checkoutUrl
          ? STAGE_MESSAGE.awaiting_payment
          : "Payment gateway is not configured in this environment. Waiting for a payment webhook to confirm…",
        checkoutUrl
      });
    } catch (invoiceError) {
      if (isUnauthorizedError(invoiceError)) {
        redirectToLogin();
        return;
      }
      setFlow((f) => (f ? { ...f, stage: "error", message: invoiceError instanceof Error ? invoiceError.message : STAGE_MESSAGE.error } : f));
    }
  }

  if (loading) {
    return <div className="grid min-h-80 place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>;
  }

  if (error) {
    return (
      <div className="rounded-[1.5rem] border border-[#e2e5dc] bg-white p-8 shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
        <h1 className="text-2xl font-black">Tax items unavailable</h1>
        <p className="mt-2 font-medium text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-4xl font-black tracking-normal text-[#252a24]">Tax Items</h1>
        <p className="mt-2 text-lg font-medium text-muted">Select a tax category, pay via Monnify, and we record the receipt on-chain.</p>
      </div>

      {items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => {
            const busy = flow?.item.onChainItemId === item.onChainItemId && flow?.stage === "creating";
            return (
              <article
                key={item.id}
                className={index === 0 ? "rounded-[1.5rem] bg-primary p-6 text-white shadow-[0_16px_32px_rgba(4,118,59,0.22)]" : "rounded-[1.5rem] border border-[#e2e5dc] bg-white p-6 shadow-[0_10px_24px_rgba(31,36,30,0.06)]"}
              >
                <div className="flex items-start justify-between">
                  <div className={index === 0 ? "grid h-12 w-12 place-items-center rounded-full bg-white/16" : "grid h-12 w-12 place-items-center rounded-full bg-accent text-primary"}>
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <span className={index === 0 ? "rounded-full bg-white/16 px-3 py-1 text-sm font-black text-white" : "rounded-full bg-accent px-3 py-1 text-sm font-black text-primary"}>
                    {item.category}
                  </span>
                </div>

                <h2 className="mt-8 text-2xl font-black">{item.name}</h2>
                <p className={index === 0 ? "mt-3 min-h-14 text-sm font-medium leading-6 text-white/75" : "mt-3 min-h-14 text-sm font-medium leading-6 text-muted"}>
                  {item.description}
                </p>

                <div className={index === 0 ? "mt-6 rounded-[1.1rem] bg-white/12 p-4" : "mt-6 rounded-[1.1rem] bg-[#f7f8f4] p-4"}>
                  <p className={index === 0 ? "text-xs font-black uppercase text-white/60" : "text-xs font-black uppercase text-muted"}>Rate</p>
                  <p className="mt-1 text-3xl font-black">{item.rateLabel}</p>
                </div>

                <label className={index === 0 ? "mt-6 block text-sm font-black text-white/75" : "mt-6 block text-sm font-black text-muted"}>
                  Payment Amount
                </label>
                <input
                  value={amounts[item.onChainItemId] ?? ""}
                  onChange={(event) => setAmounts((current) => ({ ...current, [item.onChainItemId]: event.target.value }))}
                  type="number"
                  min="1"
                  placeholder="50000"
                  className={index === 0 ? "mt-2 h-12 w-full rounded-[1rem] border border-white/16 bg-white/12 px-4 font-bold text-white outline-none placeholder:text-white/50" : "mt-2 h-12 w-full rounded-[1rem] border border-[#e2e5dc] bg-white px-4 font-bold outline-none focus:border-primary"}
                />

                <button
                  onClick={() => startPayment(item)}
                  disabled={Boolean(flow) || !item.isActive}
                  className={index === 0 ? "mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-white text-sm font-black text-primary disabled:opacity-60" : "mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-primary text-sm font-black text-white disabled:opacity-60"}
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ReceiptText className="h-4 w-4" />}
                  Pay Now
                  {busy ? null : <ArrowUpRight className="h-4 w-4" />}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-[#e2e5dc] bg-white p-8 text-center shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
          <h2 className="text-2xl font-black">No active tax items</h2>
          <p className="mt-2 font-medium text-muted">The tax catalogue has not been synced yet.</p>
        </div>
      )}

      {flow ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.75rem] bg-white p-7 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-[#252a24]">{STAGE_TITLE[flow.stage]}</h2>
                <p className="mt-1 text-sm font-semibold text-muted">{flow.item.name}{flow.amountLabel ? ` • ${flow.amountLabel}` : ""}</p>
              </div>
              {isTerminal(flow.stage) ? (
                <button onClick={() => setFlow(null)} className="grid h-9 w-9 place-items-center rounded-full bg-[#f3f5ef] text-muted hover:text-[#252a24]" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="mt-7">
              <StageTracker stage={flow.stage} />
            </div>

            <p className={`mt-6 rounded-[1rem] px-4 py-3 text-sm font-semibold ${flow.stage === "failed" || flow.stage === "expired" || flow.stage === "error" ? "bg-[#fbe8ed] text-rose-700" : flow.stage === "confirmed" ? "bg-accent text-primary" : "bg-[#f7f8f4] text-muted"}`}>
              {flow.message}
            </p>

            <div className="mt-5 grid gap-3">
              {flow.stage === "awaiting_payment" && flow.checkoutUrl ? (
                <a href={flow.checkoutUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-primary text-sm font-black text-white">
                  <ExternalLink className="h-4 w-4" />
                  Open payment page
                </a>
              ) : null}

              {flow.stage === "confirmed" ? (
                <>
                  {flow.txHash ? (
                    <a href={`${EXPLORER_TX_URL}${flow.txHash}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-primary text-sm font-black text-white">
                      <ExternalLink className="h-4 w-4" />
                      View on-chain transaction
                    </a>
                  ) : null}
                  {flow.receiptUrl ? (
                    <a href={flow.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] border border-[#e2e5dc] text-sm font-black text-[#252a24]">
                      <ReceiptText className="h-4 w-4" />
                      View IPFS receipt
                    </a>
                  ) : null}
                  <Link href="/dashboard/payments" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-[#f3f5ef] text-sm font-black text-[#252a24]">
                    Go to Payment History
                  </Link>
                </>
              ) : null}

              {flow.stage === "failed" || flow.stage === "expired" || flow.stage === "error" ? (
                <button onClick={() => startPayment(flow.item)} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-primary text-sm font-black text-white">
                  Try again
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
