"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { apiPost } from "@/lib/api";
import { toast } from "@/lib/toast";
import { ArrowLeft, Loader2, UserCircle } from "lucide-react";
import Link from "next/link";
import { PasswordInput } from "@/components/PasswordInput";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const data = await apiPost<{ accessToken: string; user?: { role?: string } }>("/auth/login", { email, password });
      localStorage.setItem("token", data.accessToken);
      toast.success("Login successful!");
      const isAdmin = data.user?.role === "ADMIN" || data.user?.role === "SUPER_ADMIN";
      router.push(isAdmin ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/50 rounded-full text-primary mb-6 shadow-sm">
              <UserCircle className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h1>
            <p className="mt-3 text-slate-500 font-medium">Access your Taxmate dashboard.</p>
          </div>

          <form className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={onLogin}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="Ex. contact@company.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <PasswordInput
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                required
                autoComplete="current-password"
              />
            </div>
            
            <button
              disabled={loading || !email || !password}
              className="w-full rounded-2xl bg-primary px-5 py-4 font-bold text-white hover:bg-secondary focus:ring-4 focus:ring-primary/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-[0_10px_30px_-10px_rgba(4,170,109,0.5)] flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="mt-12 text-center border-t border-slate-100 pt-8">
            <p className="text-slate-500 font-medium text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:text-secondary font-bold transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
