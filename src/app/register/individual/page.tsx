"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "@/lib/toast";
import { ArrowLeft, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

type VerifyOtpResponse = {
  registrationSessionToken: string;
  expiresAt: string;
};

type RegisterResponse = {
  success: boolean;
  redirectTo: string;
  accessToken: string;
};

type AvailableTin = {
  tin: string;
  label: string;
  linkedIdentifier?: string;
};

const STEPS = ["Email & OTP", "Verify OTP", "Profile Setup"];

export default function IndividualRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [registrationSessionToken, setRegistrationSessionToken] = useState("");
  const [nin, setNin] = useState("");
  const [tin, setTin] = useState("");
  const [password, setPassword] = useState("");
  const [availableTins, setAvailableTins] = useState<AvailableTin[]>([]);

  useEffect(() => {
    if (step !== 3) {
      return;
    }

    async function fetchAvailableTins() {
      try {
        const response = await apiGet<{ items: AvailableTin[] }>("/identity/available-tins?type=INDIVIDUAL");
        setAvailableTins(response.items);
        if (!tin && response.items[0]) {
          setTin(response.items[0].tin);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load mocked TINs");
      }
    }

    fetchAvailableTins();
  }, [step, tin]);

  async function reserveTin(nextTin: string) {
    setTin(nextTin);
    try {
      await apiPost("/identity/reserve-tin", {
        type: "INDIVIDUAL",
        tin: nextTin,
        email,
        registrationSessionToken
      });
      toast.success("TIN reserved for this registration");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reserve TIN");
    }
  }

  async function onSendOtp(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      await apiPost<{ message: string; debugOtp?: string }>("/auth/send-otp", { email });
      setStep(2);
      toast.success("OTP sent to your email!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await apiPost<VerifyOtpResponse>("/auth/verify-otp", { email, otp });
      setRegistrationSessionToken(response.registrationSessionToken);
      setStep(3);
      toast.success("Email verified successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function onRegister(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await apiPost<RegisterResponse>("/auth/register/individual", {
        registrationSessionToken,
        email,
        nin,
        tin,
        password
      });

      if (response.success) {
        localStorage.setItem("token", response.accessToken);
        toast.success("Registration complete! Welcome to Taxmate.");
        router.push(response.redirectTo || "/dashboard");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      <header className="p-6 flex justify-between items-center">
        <Link href="/register" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <Link href="/login" className="text-sm font-bold text-primary hover:text-secondary transition-colors">
          Log in instead
        </Link>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20 pt-10">
        <div className="w-full max-w-xl bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-full text-primary mb-6 shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Individual Registration</h1>
            <p className="mt-3 text-slate-500 font-medium">Verify your identity and set up your web3 tax profile.</p>
          </div>

          {/* Progress Stepper */}
          <div className="flex items-center justify-between mb-12 relative px-2 text-sm font-medium">
            <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full" />
            <div 
              className="absolute top-1/2 left-4 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `calc(${((step - 1) / 2) * 100}% - 2rem)` }} 
            />
            
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-col items-center gap-3 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 font-bold shadow-sm ${
                  step > s ? "bg-primary text-white" : 
                  step === s ? "bg-primary text-white ring-4 ring-primary/20 scale-110" : 
                  "bg-white text-slate-400 border-2 border-slate-100"
                }`}>
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                <span className={`absolute -bottom-7 whitespace-nowrap text-xs font-bold transition-colors ${
                  step >= s ? "text-slate-800" : "text-slate-400"
                }`}>
                  {STEPS[s-1]}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            {step === 1 && (
              <form className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={onSendOtp}>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                    required
                  />
                </div>
                <button
                  disabled={loading || !email}
                  className="w-full rounded-2xl bg-primary px-5 py-4 font-bold text-white hover:bg-secondary focus:ring-4 focus:ring-primary/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-[0_10px_30px_-10px_rgba(4,170,109,0.4)] flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={onVerifyOtp}>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input 
                    value={email} 
                    disabled 
                    className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4 text-slate-500 cursor-not-allowed" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Enter 6-Digit OTP</label>
                  <input
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.5em] font-mono text-xl rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                  />
                </div>
                <button
                  disabled={loading || otp.length !== 6}
                  className="w-full rounded-2xl bg-primary px-5 py-4 font-bold text-white hover:bg-secondary focus:ring-4 focus:ring-primary/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-[0_10px_30px_-10px_rgba(4,170,109,0.4)] flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify OTP"}
                </button>
              </form>
            )}

            {step === 3 && (
              <form className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={onRegister}>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">National Identity Number (NIN)</label>
                  <input
                    value={nin}
                    onChange={(event) => setNin(event.target.value)}
                    placeholder="E.g. 22515263226"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                    required
                  />
                  <p className="mt-2 text-xs text-slate-500 font-medium">Required for VerifyMe identity checks.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Available Mock TIN</label>
                  <div className="grid gap-3">
                    {availableTins.map((item) => (
                      <button
                        key={item.tin}
                        type="button"
                        onClick={() => reserveTin(item.tin)}
                        className={`rounded-2xl border px-5 py-4 text-left transition-all ${
                          tin === item.tin
                            ? "border-primary bg-accent text-primary ring-2 ring-primary/15"
                            : "border-slate-200 bg-slate-50/50 text-slate-800 hover:border-primary/40"
                        }`}
                      >
                        <span className="block font-mono text-sm font-black">{item.tin}</span>
                        <span className="mt-1 block text-xs font-bold text-slate-500">{item.label}{item.linkedIdentifier ? ` • NIN ${item.linkedIdentifier}` : ""}</span>
                      </button>
                    ))}
                  </div>
                  {!availableTins.length ? <p className="mt-2 text-xs font-medium text-slate-500">No mocked TINs are currently available.</p> : null}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                    required
                    minLength={8}
                  />
                </div>

                <button
                  disabled={loading || !nin || !tin || !password}
                  className="w-full mt-4 rounded-2xl bg-slate-800 px-5 py-4 font-bold text-white hover:bg-slate-900 focus:ring-4 focus:ring-slate-300 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
