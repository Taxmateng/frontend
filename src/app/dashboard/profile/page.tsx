"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Building2, Copy, Hash, MapPin, UserCircle, WalletCards } from "lucide-react";
import { apiGet, isUnauthorizedError, redirectToLogin } from "@/lib/api";
import { toast } from "@/lib/toast";

type UserProfile = {
  id: string;
  email: string;
  role: string;
  profileType: "INDIVIDUAL" | "BUSINESS";
  companyName?: string;
  companyType?: string;
  firstname?: string;
  lastname?: string;
  middlename?: string;
  tin?: string;
  rcNumber?: string;
  status: string;
  onChainRegistered?: boolean;
  onChainTxHash?: string | null;
  walletAddress?: string | null;
  branchAddress?: string | null;
  headOfficeAddress?: string | null;
  city?: string | null;
  lga?: string | null;
  state?: string | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await apiGet<UserProfile>("/user/profile");
        setUser(data);
      } catch (fetchError) {
        if (isUnauthorizedError(fetchError)) {
          redirectToLogin();
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : "Unable to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  async function copyValue(value?: string | null) {
    if (!value || typeof navigator === "undefined") {
      return;
    }
    await navigator.clipboard.writeText(value);
    toast.success("Copied");
  }

  if (loading) {
    return <div className="grid min-h-80 place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>;
  }

  if (error || !user) {
    return (
      <div className="rounded-[1.5rem] border border-[#e2e5dc] bg-white p-8 text-center shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
        <h1 className="text-2xl font-black">Profile unavailable</h1>
        <p className="mt-2 font-medium text-muted">{error ?? "Complete registration to view your profile."}</p>
      </div>
    );
  }

  const isBusiness = user.profileType === "BUSINESS";
  const displayName = isBusiness ? user.companyName : [user.firstname, user.lastname].filter(Boolean).join(" ");

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-4xl font-black tracking-normal text-[#252a24]">Profile</h1>
        <p className="mt-2 text-lg font-medium text-muted">Verified taxpayer identity and on-chain registration details.</p>
      </div>

      <section className="rounded-[1.5rem] bg-primary p-7 text-white shadow-[0_16px_32px_rgba(4,118,59,0.22)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-white/16 ring-4 ring-white/10">
            {isBusiness ? <Building2 className="h-11 w-11" /> : <UserCircle className="h-12 w-12" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-black">{displayName || "Taxmate User"}</h2>
              <span className="rounded-full bg-white/16 px-3 py-1 text-xs font-black">{user.profileType}</span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-primary">{user.status}</span>
            </div>
            <p className="mt-3 font-medium text-white/75">{user.email}</p>
          </div>
          <div className="rounded-[1.1rem] bg-white/12 p-5">
            <p className="text-xs font-black uppercase text-white/60">TIN</p>
            <p className="mt-2 font-mono text-2xl font-black">{user.tin ?? "Pending"}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[1.5rem] border border-[#e2e5dc] bg-white p-7 shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
          <h2 className="flex items-center gap-3 text-2xl font-black"><Hash className="h-6 w-6 text-primary" /> Identification</h2>
          <div className="mt-7 grid gap-4">
            {[
              ["TIN", user.tin],
              [isBusiness ? "RC Number" : "Account ID", isBusiness ? user.rcNumber : user.id],
              ["Role", user.role],
              ["Profile Type", user.profileType]
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.1rem] bg-[#f7f8f4] p-4">
                <p className="text-xs font-black uppercase text-muted">{label}</p>
                <p className="mt-2 break-all font-mono font-black">{value ?? "Not available"}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-[#e2e5dc] bg-white p-7 shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
          <h2 className="flex items-center gap-3 text-2xl font-black"><WalletCards className="h-6 w-6 text-primary" /> Wallet & Chain</h2>
          <div className="mt-7 grid gap-4">
            <div className="rounded-[1.1rem] bg-[#f7f8f4] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase text-muted">SCA Wallet</p>
                <button onClick={() => copyValue(user.walletAddress)} className="grid h-8 w-8 place-items-center rounded-full bg-white text-muted"><Copy className="h-4 w-4" /></button>
              </div>
              <p className="mt-2 break-all font-mono text-sm font-black">{user.walletAddress ?? "Wallet unavailable"}</p>
            </div>
            <div className="rounded-[1.1rem] bg-[#f7f8f4] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase text-muted">Registration TxHash</p>
                <button onClick={() => copyValue(user.onChainTxHash)} className="grid h-8 w-8 place-items-center rounded-full bg-white text-muted"><Copy className="h-4 w-4" /></button>
              </div>
              <p className="mt-2 break-all font-mono text-sm font-black">{user.onChainTxHash ?? "Pending confirmation"}</p>
            </div>
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-black text-primary">
              <BadgeCheck className="h-4 w-4" />
              {user.onChainRegistered ? "Registered on-chain" : "On-chain registration pending"}
            </p>
          </div>
        </section>
      </div>

      {isBusiness ? (
        <section className="rounded-[1.5rem] border border-[#e2e5dc] bg-white p-7 shadow-[0_10px_24px_rgba(31,36,30,0.06)]">
          <h2 className="flex items-center gap-3 text-2xl font-black"><MapPin className="h-6 w-6 text-primary" /> Business Address</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {[
              ["Head Office", user.headOfficeAddress],
              ["Branch", user.branchAddress],
              ["City", user.city],
              ["LGA / State", [user.lga, user.state].filter(Boolean).join(", ")]
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.1rem] bg-[#f7f8f4] p-4">
                <p className="text-xs font-black uppercase text-muted">{label}</p>
                <p className="mt-2 font-bold">{value || "Not provided"}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
