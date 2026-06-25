"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, ReceiptText, X } from "lucide-react";
import { apiPost, isUnauthorizedError, redirectToLogin } from "@/lib/api";
import { toast } from "@/lib/toast";
import {
  EXPLORER_TX_URL,
  STAGE_MESSAGE,
  STAGE_TITLE,
  StageTracker,
  statusToStage,
  type FlowStage
} from "./payment-flow";

export type InvoiceModalData = {
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

type View = "details" | FlowStage;

function statusClass(status: string): string {
  if (status === "CONFIRMED" || status === "PAID") return "bg-accent text-primary";
  if (status === "FAILED" || status === "EXPIRED") return "bg-[#fbe8ed] text-rose-600";
  return "bg-[#fff3c9] text-amber-700";
}

export function InvoiceModal({
  invoice,
  onClose,
  onChange
}: {
  invoice: InvoiceModalData;
  onClose: () => void;
  onChange?: () => void;
}) {
  const initialStage = statusToStage(invoice.status);
  const [view, setView] = useState<View>(initialStage ?? "details");
  const [message, setMessage] = useState<string>(initialStage ? STAGE_MESSAGE[initialStage] : "");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(invoice.txHash ?? null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(invoice.receiptUrl ?? null);
  const [verifying, setVerifying] = useState(false);

  // Apply a verified invoice to the modal. Returns true once it's terminal.
  const applyItem = useCallback(
    (item: InvoiceModalData): boolean => {
      if (item.status === "CONFIRMED") {
        setTxHash(item.txHash ?? null);
        setReceiptUrl(item.receiptUrl ?? null);
        setView("confirmed");
        setMessage(STAGE_MESSAGE.confirmed);
        onChange?.();
        return true;
      }
      if (item.status === "FAILED") {
        setView("failed");
        setMessage(STAGE_MESSAGE.failed);
        onChange?.();
        return true;
      }
      if (item.status === "EXPIRED") {
        setView("expired");
        setMessage(STAGE_MESSAGE.expired);
        onChange?.();
        return true;
      }
      if (item.status === "PAID") {
        setView("recording");
        setMessage(STAGE_MESSAGE.recording);
        onChange?.();
      }
      return false;
    },
    [onChange]
  );

  // Reconcile against Monnify (webhook-independent), then progress the invoice.
  const verify = useCallback(async (): Promise<InvoiceModalData> => {
    const { item } = await apiPost<{ item: InvoiceModalData }>(`/payments/invoice/${invoice.id}/verify`, {});
    return item;
  }, [invoice.id]);

  // Poll while payment is settling or being recorded on-chain.
  useEffect(() => {
    if (view !== "awaiting_payment" && view !== "recording") {
      return;
    }

    let active = true;
    let polls = 0;
    const maxPolls = 100; // ~5 minutes at 3s

    async function poll() {
      if (!active) return;
      try {
        const item = await verify();
        if (!active) return;
        if (applyItem(item)) return;
      } catch {
        // transient — keep polling
      }

      polls += 1;
      if (active && polls < maxPolls) {
        setTimeout(poll, 3000);
      } else if (active) {
        setMessage("Still processing. You can close this and check back shortly.");
      }
    }

    const starter = setTimeout(poll, 1500);
    return () => {
      active = false;
      clearTimeout(starter);
    };
  }, [view, verify, applyItem]);

  // On open, reconcile a still-pending invoice once — covers returning from the
  // Monnify tab when no webhook reached us.
  useEffect(() => {
    if (initialStage !== null) {
      return;
    }
    let active = true;
    (async () => {
      try {
        const item = await verify();
        if (active) applyItem(item);
      } catch {
        // ignore — user can retry via the button
      }
    })();
    return () => {
      active = false;
    };
    // run once on open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkStatus() {
    setVerifying(true);
    try {
      const item = await verify();
      applyItem(item);
      if (item.status === "PENDING") {
        toast.error("We haven't received this payment yet. If you just paid, give it a moment and check again.");
      }
    } catch (error) {
      if (isUnauthorizedError(error)) {
        redirectToLogin();
        return;
      }
      toast.error(error instanceof Error ? error.message : "Unable to check payment status");
    } finally {
      setVerifying(false);
    }
  }

  async function pay() {
    setView("creating");
    setMessage(STAGE_MESSAGE.creating);
    try {
      const response = await apiPost<{ payment?: { checkoutUrl?: string | null } }>(`/payments/invoice/${invoice.id}/checkout`, {});
      const url = response.payment?.checkoutUrl ?? null;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      setCheckoutUrl(url);
      setView("awaiting_payment");
      setMessage(
        url
          ? STAGE_MESSAGE.awaiting_payment
          : "Payment gateway is not configured in this environment. Waiting for a payment webhook to confirm…"
      );
      onChange?.();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        redirectToLogin();
        return;
      }
      setView("error");
      setMessage(error instanceof Error ? error.message : STAGE_MESSAGE.error);
    }
  }

  const showDetails = view === "details";
  const payable = ["PENDING", "FAILED", "EXPIRED"].includes(invoice.status);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-[1.75rem] bg-white p-7 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-[#252a24]">{showDetails ? invoice.taxItemName : STAGE_TITLE[view as FlowStage]}</h2>
            <p className="mt-1 text-sm font-semibold text-muted">
              {invoice.category ?? "Tax"} • {invoice.amountLabel}
            </p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#f3f5ef] text-muted hover:text-[#252a24]" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {showDetails ? (
          <div className="mt-6 grid gap-3">
            <dl className="grid gap-2 rounded-[1.1rem] bg-[#f7f8f4] p-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-muted">Tax item</dt>
                <dd className="font-black text-[#252a24]">{invoice.taxItemName}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-muted">TIN</dt>
                <dd className="font-mono font-black text-[#252a24]">{invoice.tin}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-muted">Amount</dt>
                <dd className="font-mono font-black text-[#252a24]">{invoice.amountLabel}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-muted">Created</dt>
                <dd className="font-black text-[#252a24]">{new Date(invoice.createdAt).toLocaleDateString("en-NG")}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-muted">Status</dt>
                <dd>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${statusClass(invoice.status)}`}>{invoice.status}</span>
                </dd>
              </div>
            </dl>

            {payable ? (
              <>
                <button onClick={pay} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-primary text-sm font-black text-white">
                  <ReceiptText className="h-4 w-4" />
                  Pay this invoice
                </button>
                <button
                  onClick={checkStatus}
                  disabled={verifying}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[1rem] border border-[#e2e5dc] text-sm font-black text-[#252a24] disabled:opacity-60"
                >
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  I&apos;ve already paid — check status
                </button>
              </>
            ) : null}
          </div>
        ) : (
          <>
            <div className="mt-7">
              <StageTracker stage={view as FlowStage} />
            </div>

            <p
              className={`mt-6 rounded-[1rem] px-4 py-3 text-sm font-semibold ${
                view === "failed" || view === "expired" || view === "error"
                  ? "bg-[#fbe8ed] text-rose-700"
                  : view === "confirmed"
                    ? "bg-accent text-primary"
                    : "bg-[#f7f8f4] text-muted"
              }`}
            >
              {message}
            </p>

            <div className="mt-5 grid gap-3">
              {view === "awaiting_payment" && checkoutUrl ? (
                <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-primary text-sm font-black text-white">
                  <ExternalLink className="h-4 w-4" />
                  Open payment page
                </a>
              ) : null}

              {view === "confirmed" ? (
                <>
                  {txHash ? (
                    <a href={`${EXPLORER_TX_URL}${txHash}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-primary text-sm font-black text-white">
                      <ExternalLink className="h-4 w-4" />
                      View on-chain transaction
                    </a>
                  ) : null}
                  {receiptUrl ? (
                    <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] border border-[#e2e5dc] text-sm font-black text-[#252a24]">
                      <ReceiptText className="h-4 w-4" />
                      View IPFS receipt
                    </a>
                  ) : null}
                  <Link href="/dashboard/payments" onClick={onClose} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-[#f3f5ef] text-sm font-black text-[#252a24]">
                    Back to Payment History
                  </Link>
                </>
              ) : null}

              {view === "failed" || view === "expired" || view === "error" ? (
                <button onClick={pay} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-primary text-sm font-black text-white">
                  Try again
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
