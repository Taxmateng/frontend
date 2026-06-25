import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export type FlowStage = "creating" | "awaiting_payment" | "recording" | "confirmed" | "failed" | "expired" | "error";

export const EXPLORER_TX_URL = `${process.env.NEXT_PUBLIC_EXPLORER_URL ?? "https://sepolia.basescan.org"}/tx/`;

export const STAGE_MESSAGE: Record<FlowStage, string> = {
  creating: "Creating your invoice and payment reference…",
  awaiting_payment: "Complete payment in the Monnify window. We're waiting for confirmation…",
  recording: "Payment received. Recording your receipt on the Taxmate contract…",
  confirmed: "All done — your payment is confirmed and recorded on-chain.",
  failed: "The payment failed. You have not been charged for a confirmed receipt.",
  expired: "This invoice expired before payment was completed. Please start again.",
  error: "Something went wrong while setting up your payment."
};

export const STAGE_TITLE: Record<FlowStage, string> = {
  creating: "Setting up your payment",
  awaiting_payment: "Waiting for payment",
  recording: "Recording on-chain",
  confirmed: "Payment recorded",
  failed: "Payment failed",
  expired: "Invoice expired",
  error: "Something went wrong"
};

const FLOW_STEPS = [
  { label: "Invoice created", sub: "Payment reference generated" },
  { label: "Payment confirmed", sub: "Monnify settlement" },
  { label: "Recorded on-chain", sub: "Taxmate contract receipt" }
];

const STAGE_ORDER: Record<string, number> = { creating: 0, awaiting_payment: 1, recording: 2, confirmed: 3 };

export function isTerminal(stage: FlowStage): boolean {
  return stage === "confirmed" || stage === "failed" || stage === "expired" || stage === "error";
}

// Maps a backend invoice status to a live flow stage. Returns null for PENDING,
// which callers render as a "details / pay" view rather than a progress stage.
export function statusToStage(status: string): FlowStage | null {
  if (status === "PAID") return "recording";
  if (status === "CONFIRMED") return "confirmed";
  if (status === "FAILED") return "failed";
  if (status === "EXPIRED") return "expired";
  return null;
}

function stepState(stepIndex: number, stage: FlowStage): "done" | "active" | "idle" | "error" {
  if (stage === "error") {
    return stepIndex === 0 ? "error" : "idle";
  }
  if (stage === "failed" || stage === "expired") {
    if (stepIndex === 0) return "done";
    if (stepIndex === 1) return "error";
    return "idle";
  }
  const current = STAGE_ORDER[stage] ?? 0;
  if (current > stepIndex) return "done";
  if (current === stepIndex) return "active";
  return "idle";
}

export function StageTracker({ stage }: { stage: FlowStage }) {
  return (
    <div className="grid gap-4">
      {FLOW_STEPS.map((step, stepIndex) => {
        const state = stepState(stepIndex, stage);
        return (
          <div key={step.label} className="flex items-center gap-3">
            <span
              className={
                state === "done"
                  ? "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-white"
                  : state === "active"
                    ? "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-primary"
                    : state === "error"
                      ? "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fbe8ed] text-rose-600"
                      : "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f3f5ef] text-muted"
              }
            >
              {state === "done" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : state === "active" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : state === "error" ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <span className="text-sm font-black">{stepIndex + 1}</span>
              )}
            </span>
            <div>
              <p className={state === "idle" ? "text-sm font-black text-muted" : "text-sm font-black text-[#252a24]"}>{step.label}</p>
              <p className="text-xs font-semibold text-muted">{step.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
