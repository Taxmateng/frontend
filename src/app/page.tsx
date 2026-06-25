import { Navbar } from "@/components/layout/Navbar";
import { Logo } from "@/components/Logo";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  FileCheck2,
  ReceiptText,
  ShieldCheck,
  WalletCards
} from "lucide-react";
import Link from "next/link";

const partners = ["JTB", "VerifyMe", "Monnify", "Circle", "Pinata", "Base"];
const features = [
  {
    icon: ShieldCheck,
    title: "Verified taxpayer identity",
    text: "Onboard individuals with NIN checks and companies with CAC verification before assigning a Taxmate profile."
  },
  {
    icon: WalletCards,
    title: "SCA wallet records",
    text: "Create a managed wallet for every taxpayer so registration and payment evidence can be anchored on-chain."
  },
  {
    icon: ReceiptText,
    title: "Receipts that survive audits",
    text: "Pair Monnify payment references with IPFS receipt hashes, transaction hashes, and tax item metadata."
  },
  {
    icon: Building2,
    title: "Business-ready controls",
    text: "Give admins clean views for taxpayer status, payment confirmations, audit logs, and tax item operations."
  }
];

const steps = [
  ["01", "Verify", "Confirm email, identity, and mocked available TIN."],
  ["02", "Pay", "Create an invoice against VAT, PAYE, WHT, or income tax."],
  ["03", "Record", "Confirm payment and attach receipt, IPFS, and chain references."]
];

const CARD = "rounded-[1.5rem] border border-[#e2e5dc] bg-white shadow-[0_10px_24px_rgba(31,36,30,0.06)]";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-[#20241f]">
      <Navbar />

      <main>
        <section className="relative overflow-hidden border-b border-[#e2e5dc] px-4 pb-24 pt-32 md:pt-40">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(31,36,30,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(31,36,30,0.035)_1px,transparent_1px)] bg-[size:80px_80px]" />
          <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div className="text-center lg:text-left">
              <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-[#e2e5dc] bg-white px-4 py-2 text-sm font-medium text-muted shadow-sm lg:mx-0">
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_18px_rgba(4,118,59,0.55)]" />
                Built for Nigerian tax compliance
              </div>

              <h1 className="text-5xl font-black leading-[0.98] tracking-normal text-[#1b1f1a] md:text-7xl">
                Tax records that stay audit-ready.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted lg:mx-0">
                Taxmate helps individuals and companies verify TIN ownership, pay obligations, and keep receipts tied to immutable on-chain evidence.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <Link href="/register" className="inline-flex h-14 items-center gap-3 rounded-full bg-primary px-7 text-base font-bold text-white shadow-[0_18px_40px_-12px_rgba(4,118,59,0.45)] transition hover:bg-secondary">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/login" className="inline-flex h-14 items-center rounded-full border border-[#e2e5dc] bg-white px-7 text-base font-semibold text-[#20241f] transition hover:border-primary/40">
                  Launch Dashboard
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-2 text-sm text-muted lg:justify-start">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Secure, verifiable tax records for every Nigerian taxpayer.
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-[#e2e5dc] bg-white p-4 shadow-[0_24px_60px_-20px_rgba(31,36,30,0.18)]">
              <div className="rounded-[1.5rem] border border-[#e2e5dc] bg-[#f7f8f4] p-4 text-[#20241f]">
                <div className="flex items-center justify-between border-b border-[#e2e5dc] pb-4">
                  <div className="flex items-center gap-3">
                    <Logo size={44} />
                    <div>
                      <p className="text-sm font-black">Taxmate Dashboard</p>
                      <p className="text-xs font-medium text-muted">TIN: NG-BIZ-200001</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">Active</span>
                </div>

                <div className="grid gap-3 py-4 sm:grid-cols-3">
                  {[
                    ["Total Paid", "₦1.24m"],
                    ["Receipts", "18"],
                    ["Pending", "2"]
                  ].map(([label, value], index) => (
                    <div key={label} className={index === 0 ? "rounded-2xl bg-primary p-4 text-white" : "rounded-2xl border border-[#e2e5dc] bg-white p-4"}>
                      <p className={index === 0 ? "text-xs font-bold text-white/75" : "text-xs font-bold text-muted"}>{label}</p>
                      <p className="mt-3 text-2xl font-black">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
                  <div className="rounded-2xl border border-[#e2e5dc] bg-white p-4">
                    <div className="mb-6 flex items-center justify-between">
                      <p className="font-black">Compliance Activity</p>
                      <span className="text-xs font-bold text-primary">Weekly</span>
                    </div>
                    <div className="flex h-44 items-end justify-between gap-3">
                      {[42, 74, 68, 91, 35, 59, 48].map((height, index) => (
                        <div key={index} className="flex flex-1 flex-col items-center gap-2">
                          <span className="w-full rounded-t-xl bg-primary/75" style={{ height: `${height}%` }} />
                          <span className="text-xs font-bold text-muted">{["S", "M", "T", "W", "T", "F", "S"][index]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#e2e5dc] bg-white p-4">
                    <p className="font-black">Receipt Status</p>
                    <div className="mt-8 grid place-items-center">
                      <div className="grid h-32 w-32 place-items-center rounded-full" style={{ background: "conic-gradient(#04763b 0 72%, #dbe9df 72% 100%)" }}>
                        <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center">
                          <span className="text-3xl font-black">72%</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-center text-xs font-bold text-muted">Confirmed on-chain</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#e2e5dc] px-4 py-12">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 text-muted">
            {partners.map((partner) => (
              <div key={partner} className="flex items-center gap-3 text-lg font-bold">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm text-primary">{partner[0]}</span>
                {partner}
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-black text-[#1b1f1a] md:text-5xl">Everything needed for clean tax operations</h2>
              <p className="mt-4 text-lg leading-8 text-muted">From onboarding to receipts, every surface is designed for repeated compliance work.</p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {features.map((feature) => (
                <article key={feature.title} className={`${CARD} p-8`}>
                  <div className="mb-8 grid h-12 w-12 place-items-center rounded-2xl bg-accent text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-black text-[#1b1f1a]">{feature.title}</h3>
                  <p className="mt-4 leading-7 text-muted">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-[#e2e5dc] px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-4xl font-black text-[#1b1f1a] md:text-5xl">A simple compliance flow</h2>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {steps.map(([number, title, text]) => (
                <article key={number} className={`${CARD} p-7`}>
                  <p className="text-sm font-black text-primary">{number}</p>
                  <h3 className="mt-8 text-2xl font-black text-[#1b1f1a]">{title}</h3>
                  <p className="mt-3 leading-7 text-muted">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-black text-[#1b1f1a] md:text-5xl">Plans for every taxpayer type</h2>
              <p className="mt-4 text-lg text-muted">Free to use while integrations are configured for live rollout.</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                ["Individual", "₦0", ["Mock TIN selection", "NIN verification", "Payment history"]],
                ["Business", "₦0", ["CAC verification", "Corporate profile", "Receipt dashboard"]],
                ["Admin", "Custom", ["User operations", "Payment analytics", "Audit log previews"]]
              ].map(([name, price, items], index) => (
                <article
                  key={name as string}
                  className={`rounded-[1.5rem] border p-8 shadow-[0_10px_24px_rgba(31,36,30,0.06)] ${index === 1 ? "border-primary/30 bg-accent" : "border-[#e2e5dc] bg-white"}`}
                >
                  <h3 className="text-2xl font-black text-[#1b1f1a]">{name}</h3>
                  <p className="mt-8 text-5xl font-black text-[#1b1f1a]">{price}</p>
                  <div className="mt-8 grid gap-4">
                    {(items as string[]).map((item) => (
                      <p key={item} className="flex items-center gap-3 font-medium text-[#3f463a]">
                        <Check className="h-4 w-4 text-primary" />
                        {item}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[#e2e5dc] px-4 py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-8 grid h-16 w-16 place-items-center rounded-full bg-primary text-white">
              <FileCheck2 className="h-8 w-8" />
            </div>
            <h2 className="text-4xl font-black text-[#1b1f1a] md:text-6xl">Ready to make tax records easier to trust?</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted">Run the complete registration flow, then connect production credentials when your operations are ready.</p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/register" className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-primary px-7 font-bold text-white shadow-[0_18px_40px_-12px_rgba(4,118,59,0.45)] transition hover:bg-secondary">
                Register for Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/dashboard" className="inline-flex h-14 items-center justify-center gap-3 rounded-full border border-[#e2e5dc] bg-white px-7 font-bold text-[#20241f] transition hover:border-primary/40">
                View Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer id="faq" className="border-t border-[#e2e5dc] px-4 py-14">
        <div className="mx-auto grid max-w-6xl gap-8 text-muted md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <div className="mb-5 flex items-center gap-3 text-[#1b1f1a]">
              <Logo size={40} />
              <span className="text-xl font-black">Taxmate</span>
            </div>
            <p className="max-w-xs leading-7">Modern tax compliance for Nigerian individuals, businesses, and administrators.</p>
          </div>
          {[
            ["Product", "Dashboard", "Payments", "Receipts"],
            ["Resources", "Docs", "Guides", "Security"],
            ["Company", "About", "Support", "Contact"]
          ].map(([heading, ...links]) => (
            <div key={heading}>
              <h3 className="mb-5 font-bold text-[#1b1f1a]">{heading}</h3>
              <div className="grid gap-4">
                {links.map((link) => (
                  <span key={link} className="transition hover:text-primary">{link}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
