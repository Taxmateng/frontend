"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "@/lib/toast";
import { ArrowLeft, CheckCircle2, Loader2, Building2 } from "lucide-react";
import Link from "next/link";
import { RegistrationProgress, type RegPhase } from "@/components/RegistrationProgress";
import { PasswordInput } from "@/components/PasswordInput";

type VerifyOtpResponse = {
  registrationSessionToken: string;
};

type BusinessSubmitResponse = {
  jobId: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
};

type VerifiedBusiness = {
  companyName?: string;
  rcNumber?: string;
  companyType?: string;
  street?: string;
  city?: string;
  lga?: string;
  state?: string;
  country?: string;
  applicantFirstname?: string;
  applicantLastname?: string;
  applicantPhone?: string;
};

type BusinessStatusResponse = {
  jobId: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  verifiedPreview?: VerifiedBusiness;
};

type CompleteResponse = {
  success: boolean;
  redirectTo: string;
  accessToken: string;
};

type AvailableTin = {
  tin: string;
  label: string;
  linkedIdentifier?: string;
};

const STEPS = ["Email & OTP", "Verify OTP", "Business Check", "Complete Profile"];

export default function BusinessRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [registrationSessionToken, setRegistrationSessionToken] = useState("");

  const [rcNumber, setRcNumber] = useState("");
  const [applicantIdNumber, setApplicantIdNumber] = useState("");
  const [applicantFirstname, setApplicantFirstname] = useState("");
  const [applicantLastname, setApplicantLastname] = useState("");

  const [jobId, setJobId] = useState("");
  const [businessStatus, setBusinessStatus] = useState<"PENDING" | "COMPLETED" | "FAILED">("PENDING");
  const [preview, setPreview] = useState<VerifiedBusiness | undefined>();
  const [regPhase, setRegPhase] = useState<RegPhase>("idle");
  const [regError, setRegError] = useState<string | undefined>();

  const [tin, setTin] = useState("");
  const [password, setPassword] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [headOfficeAddress, setHeadOfficeAddress] = useState("");
  const [city, setCity] = useState("");
  const [lga, setLga] = useState("");
  const [stateName, setStateName] = useState("");
  const [classification, setClassification] = useState("");
  const [shareCapital, setShareCapital] = useState("");

  useEffect(() => {
    if (step !== 3 || !jobId || businessStatus !== "PENDING") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await apiGet<BusinessStatusResponse>(`/auth/register/business/status/${jobId}`);

        setBusinessStatus(response.status);
        setPreview(response.verifiedPreview);

        if (response.status === "COMPLETED") {
          // Pre-populate the fields VerifyMe returned; leave the rest for the user.
          const v = response.verifiedPreview;
          if (v) {
            setCompanyEmail((current) => current || email);
            if (v.street) {
              setHeadOfficeAddress((current) => current || v.street!);
              setBranchAddress((current) => current || v.street!);
            }
            if (v.city) setCity((current) => current || v.city!);
            if (v.lga) setLga((current) => current || v.lga!);
            if (v.state) setStateName((current) => current || v.state!);
          }
          toast.success("Business verification successful!");
          setStep(4);
        }

        if (response.status === "FAILED") {
          toast.error("Business verification failed. Check your details and try again.");
        }
      } catch {
        toast.error("Unable to fetch business verification status");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [step, jobId, businessStatus, email]);

  useEffect(() => {
    if (step !== 4 || tin) {
      return;
    }

    async function assignTin() {
      try {
        const response = await apiGet<{ items: AvailableTin[] }>("/identity/available-tins?type=BUSINESS");
        const next = response.items[0];
        if (!next) {
          toast.error("No TIN is currently available. Please try again shortly.");
          return;
        }
        setTin(next.tin);
        await apiPost("/identity/reserve-tin", {
          type: "BUSINESS",
          tin: next.tin,
          email,
          registrationSessionToken
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to assign a TIN");
      }
    }

    assignTin();
  }, [step, tin, email, registrationSessionToken]);

  async function onSendOtp(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      await apiPost<{ message: string }>("/auth/send-otp", { email });
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

  async function onSubmitBusinessVerification(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await apiPost<BusinessSubmitResponse>("/auth/register/business/submit", {
        registrationSessionToken,
        email,
        rcNumber,
        applicant: {
          idType: "bvn",
          idNumber: applicantIdNumber,
          firstname: applicantFirstname,
          lastname: applicantLastname
        }
      });

      setJobId(response.jobId);
      setBusinessStatus(response.status);
      toast.info("Business verification started. Please wait...");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit business verification");
    } finally {
      setLoading(false);
    }
  }

  async function onComplete(event: FormEvent) {
    event.preventDefault();
    setRegError(undefined);
    setRegPhase("running");

    try {
      const response = await apiPost<CompleteResponse>("/auth/register/business/complete", {
        registrationSessionToken,
        email,
        jobId,
        password,
        tin,
        companyEmail,
        branchAddress,
        headOfficeAddress,
        city,
        lga,
        state: stateName,
        classification,
        shareCapital
      });

      if (response.success) {
        localStorage.setItem("token", response.accessToken);
        setRegPhase("success");
        setTimeout(() => router.push(response.redirectTo || "/dashboard"), 1200);
      } else {
        setRegPhase("error");
        setRegError("Registration did not complete. Please try again.");
      }
    } catch (err) {
      setRegPhase("error");
      setRegError(err instanceof Error ? err.message : "Business registration failed");
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
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Business Registration</h1>
            <p className="mt-3 text-slate-500 font-medium">Verify your CAC details and set up your corporate profile.</p>
          </div>

          {/* Progress Stepper */}
          <div className="flex items-center justify-between mb-12 relative px-2 text-sm font-medium">
            <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full" />
            <div 
              className="absolute top-1/2 left-4 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `calc(${((step - 1) / 3) * 100}% - 2rem)` }} 
            />
            
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex flex-col items-center gap-3 relative">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 font-bold shadow-sm ${
                  step > s ? "bg-primary text-white" : 
                  step === s ? "bg-primary text-white ring-4 ring-primary/20 scale-110" : 
                  "bg-white text-slate-400 border-2 border-slate-100"
                }`}>
                  {step > s ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : s}
                </div>
                <span className={`absolute -bottom-7 whitespace-nowrap text-[10px] sm:text-xs font-bold transition-colors ${
                  step >= s ? "text-slate-800" : "text-slate-400"
                }`}>
                  {STEPS[s-1]}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10">
            {step === 1 && (
              <form className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={onSendOtp}>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Corporate Email Address</label>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    placeholder="contact@company.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                    required
                  />
                </div>
                <button
                  disabled={loading || !email}
                  className="w-full rounded-2xl bg-primary px-5 py-4 font-bold text-white hover:bg-secondary focus:ring-4 focus:ring-primary/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-[0_10px_30px_-10px_rgba(4,118,59,0.45)] flex items-center justify-center gap-2"
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
                  className="w-full rounded-2xl bg-primary px-5 py-4 font-bold text-white hover:bg-secondary focus:ring-4 focus:ring-primary/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-[0_10px_30px_-10px_rgba(4,118,59,0.45)] flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify OTP"}
                </button>
              </form>
            )}

            {step === 3 && (
              <form className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={onSubmitBusinessVerification}>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">RC Number</label>
                  <input
                    value={rcNumber}
                    onChange={(event) => setRcNumber(event.target.value)}
                    placeholder="E.g. 123453"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Applicant BVN</label>
                  <input
                    value={applicantIdNumber}
                    onChange={(event) => setApplicantIdNumber(event.target.value)}
                    placeholder="11-digit BVN"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                    <input
                      value={applicantFirstname}
                      onChange={(event) => setApplicantFirstname(event.target.value)}
                      placeholder="Applicant First Name"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                    <input
                      value={applicantLastname}
                      onChange={(event) => setApplicantLastname(event.target.value)}
                      placeholder="Applicant Last Name"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>

                {!jobId ? (
                  <button
                    disabled={loading || !rcNumber || !applicantIdNumber}
                    className="w-full mt-4 rounded-2xl bg-primary px-5 py-4 font-bold text-white hover:bg-secondary focus:ring-4 focus:ring-primary/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-[0_10px_30px_-10px_rgba(4,118,59,0.45)] flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Business Details"}
                  </button>
                ) : (
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 mt-4 flex items-center gap-3 shadow-sm">
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                    <div>
                      <p className="text-sm font-bold text-amber-900">Verifying business details...</p>
                      <p className="text-xs text-amber-700 mt-1">Status: <strong>{businessStatus}</strong></p>
                    </div>
                  </div>
                )}
              </form>
            )}

            {step === 4 && (
              <form className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={onComplete}>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 mb-6 shadow-sm flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">Verified Business Info</p>
                    <p className="text-sm text-slate-600 mt-0.5">{preview?.companyName ?? "Company"} (RC: {preview?.rcNumber ?? rcNumber})</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <input value={companyEmail} onChange={(event) => setCompanyEmail(event.target.value)} placeholder="Company Public Email" type="email" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                
                <input value={headOfficeAddress} onChange={(event) => setHeadOfficeAddress(event.target.value)} placeholder="Head Office Address" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                <input value={branchAddress} onChange={(event) => setBranchAddress(event.target.value)} placeholder="Branch Address (if any)" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                
                <div className="grid gap-4 sm:grid-cols-3">
                  <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                  <input value={lga} onChange={(event) => setLga(event.target.value)} placeholder="LGA" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                  <input value={stateName} onChange={(event) => setStateName(event.target.value)} placeholder="State" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <input value={classification} onChange={(event) => setClassification(event.target.value)} placeholder="Business Category" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                  <input value={shareCapital} onChange={(event) => setShareCapital(event.target.value)} placeholder="Share Capital (₦)" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                
                <PasswordInput value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Account Password" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50" minLength={8} required autoComplete="new-password" />
                
                <button
                  disabled={regPhase === "running"}
                  className="w-full mt-4 rounded-2xl bg-slate-800 px-5 py-4 font-bold text-white hover:bg-slate-900 focus:ring-4 focus:ring-slate-300 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  Complete Registration
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <RegistrationProgress phase={regPhase} errorMessage={regError} onClose={() => setRegPhase("idle")} />
    </div>
  );
}
