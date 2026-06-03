import Link from "next/link";
import { ArrowLeft, User, Building2 } from "lucide-react";

export default function RegisterTypePage() {
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
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">How would you like to register?</h1>
            <p className="mt-3 text-lg text-slate-500 font-medium">Select your account type to begin onboarding into Taxmate.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Link 
              href="/register/individual" 
              className="group relative flex flex-col items-center text-center bg-white rounded-4xl p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(4,170,109,0.15)] border border-slate-100/80 shadow-sm"
            >
              <div className="w-20 h-20 bg-accent/50 rounded-full flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-inner">
                <User className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Individual</h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                For Nigerian citizens. Requires a valid National Identity Number (NIN).
              </p>
            </Link>

            <Link 
              href="/register/business" 
              className="group relative flex flex-col items-center text-center bg-white rounded-4xl p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(4,170,109,0.15)] border border-slate-100/80 shadow-sm"
            >
              <div className="w-20 h-20 bg-accent/50 rounded-full flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-inner">
                <Building2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Business</h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                For corporate entities. Requires a valid CAC Registration Number (RC).
              </p>
            </Link>
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-500 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-secondary font-bold transition-colors">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
