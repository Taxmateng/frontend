import { Navbar } from "@/components/layout/Navbar";
import { ShieldCheck, Zap, Coins, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center text-center px-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--primary)_0%,transparent_70%)] opacity-10 pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            Tax Compliance on Base
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-foreground max-w-4xl">
            Modern Tax Compliance for <span className="text-primary">Nigerians</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted max-w-2xl mb-10 leading-relaxed">
            A secure, Web3-powered platform designed to make fulfilling your tax obligations seamless, transparent, and instantly verifiable on-chain.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/dashboard" 
              className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg flex items-center gap-2 hover:bg-secondary transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-card border-t border-border">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why use Taxmate?</h2>
              <p className="text-muted text-lg max-w-2xl mx-auto">
                Built on blockchain technology to offer superior transparency and immutable records.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card p-8 rounded-3xl flex flex-col items-start gap-4 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Verifiable Receipts</h3>
                <p className="text-muted">
                  Every tax payment is recorded on the blockchain yielding an immutable digital receipt backed by IPFS.
                </p>
              </div>

              <div className="glass-card p-8 rounded-3xl flex flex-col items-start gap-4 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Instant Processing</h3>
                <p className="text-muted">
                  Pay your TIN, VAT, or PAYE obligations cleanly in Nairas (₦) via Monnify with immediate on-chain settlement.
                </p>
              </div>

              <div className="glass-card p-8 rounded-3xl flex flex-col items-start gap-4 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                  <Coins className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">SCA Wallets</h3>
                <p className="text-muted">
                  Gasless transactions powered by Circle. No seed phrases needed—just your email to establish an uncompromisable identity.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border bg-background text-center text-muted">
        <p>© {new Date().getFullYear()} Taxmate Protocol. All rights reserved.</p>
      </footer>
    </div>
  );
}
