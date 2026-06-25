"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export type RegPhase = "idle" | "running" | "success" | "error";

const STAGES = [
  { label: "Verifying your identity", sub: "VerifyMe KYC check" },
  { label: "Creating your secure wallet", sub: "Managed Circle wallet" },
  { label: "Registering you on-chain", sub: "Taxmate smart contract" },
  { label: "Finalizing your account", sub: "Setting up your profile" }
];

export function RegistrationProgress({
  phase,
  errorMessage,
  onClose
}: {
  phase: RegPhase;
  errorMessage?: string;
  onClose?: () => void;
}) {
  const [active, setActive] = useState(0);

  // While running, advance through the stages on an estimated cadence. The last
  // stage stays "in progress" until the request resolves (success/error).
  useEffect(() => {
    if (phase !== "running") {
      return;
    }
    // Reset to the first stage whenever a new run begins.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(0);
    const timer = setInterval(() => {
      setActive((index) => Math.min(index + 1, STAGES.length - 1));
    }, 2200);
    return () => clearInterval(timer);
  }, [phase]);

  if (phase === "idle") {
    return null;
  }

  function stepState(index: number): "done" | "active" | "idle" | "error" {
    if (phase === "success") return "done";
    if (phase === "error") {
      if (index < active) return "done";
      if (index === active) return "error";
      return "idle";
    }
    if (index < active) return "done";
    if (index === active) return "active";
    return "idle";
  }

  const title = phase === "success" ? "Registration complete" : phase === "error" ? "Registration failed" : "Setting up your account";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[1.75rem] bg-white p-7 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
        <h2 className="text-xl font-black text-[#1b1f1a]">{title}</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {phase === "running" ? "This can take up to a minute — please keep this open." : phase === "success" ? "Welcome to Taxmate! Redirecting to your dashboard…" : "We couldn't finish setting up your account."}
        </p>

        <div className="mt-7 grid gap-4">
          {STAGES.map((stage, index) => {
            const state = stepState(index);
            return (
              <div key={stage.label} className="flex items-center gap-3">
                <span
                  className={
                    state === "done"
                      ? "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-white"
                      : state === "active"
                        ? "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-primary"
                        : state === "error"
                          ? "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fbe8ed] text-rose-600"
                          : "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f3f5ef] text-slate-400"
                  }
                >
                  {state === "done" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : state === "active" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : state === "error" ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-black">{index + 1}</span>
                  )}
                </span>
                <div>
                  <p className={state === "idle" ? "text-sm font-black text-slate-400" : "text-sm font-black text-[#1b1f1a]"}>{stage.label}</p>
                  <p className="text-xs font-semibold text-slate-400">{stage.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {phase === "error" ? (
          <>
            <p className="mt-6 rounded-[1rem] bg-[#fbe8ed] px-4 py-3 text-sm font-semibold text-rose-700">{errorMessage ?? "Something went wrong. Please try again."}</p>
            <button onClick={onClose} className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-[1rem] bg-primary text-sm font-black text-white">
              Try again
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
