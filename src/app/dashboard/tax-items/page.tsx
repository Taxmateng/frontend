"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Loader2, ReceiptText, ShieldCheck } from "lucide-react";
import { apiGet, apiPost, isUnauthorizedError, redirectToLogin } from "@/lib/api";
import { toast } from "@/lib/toast";

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

type InvoiceResponse = {
  item: {
    id: string;
    taxItemName: string;
    amountLabel: string;
    status: string;
  };
};

export default function TaxItemsPage() {
  const [items, setItems] = useState<TaxItem[]>([]);
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  async function createInvoice(item: TaxItem) {
    const amount = Number(amounts[item.onChainItemId] || "50000");
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    setLoadingId(item.onChainItemId);
    try {
      const response = await apiPost<InvoiceResponse>("/payments/invoice", {
        onChainItemId: item.onChainItemId,
        amount
      });
      toast.success(`${response.item.taxItemName} invoice created for ${response.item.amountLabel}`);
    } catch (invoiceError) {
      if (isUnauthorizedError(invoiceError)) {
        redirectToLogin();
        return;
      }
      toast.error(invoiceError instanceof Error ? invoiceError.message : "Unable to create invoice");
    } finally {
      setLoadingId(null);
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
        <p className="mt-2 text-lg font-medium text-muted">Select a tax category and create a Monnify-backed invoice.</p>
      </div>

      {items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
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
                onClick={() => createInvoice(item)}
                disabled={loadingId === item.onChainItemId || !item.isActive}
                className={index === 0 ? "mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-white text-sm font-black text-primary disabled:opacity-60" : "mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-primary text-sm font-black text-white disabled:opacity-60"}
              >
                {loadingId === item.onChainItemId ? <Loader2 className="h-4 w-4 animate-spin" /> : <ReceiptText className="h-4 w-4" />}
                Pay Now
                {loadingId === item.onChainItemId ? null : <ArrowUpRight className="h-4 w-4" />}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-[#e2e5dc] bg-white p-8 text-center shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
          <h2 className="text-2xl font-black">No active tax items</h2>
          <p className="mt-2 font-medium text-muted">The tax catalogue has not been synced yet.</p>
        </div>
      )}
    </div>
  );
}
