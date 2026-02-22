import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  FileWarning, 
  Clock, 
  CheckCircle2,
  Receipt
} from "lucide-react";

export default function DashboardIndex() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
        <p className="text-muted mt-1">Here is the overview of your tax compliance status.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Wallet className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="text-muted font-medium">Total Paid (YTD)</h2>
          </div>
          <div>
            <span className="text-3xl font-bold text-foreground">₦1,245,000.00</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-accent flex items-center bg-accent/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              12%
            </span>
            <span className="text-muted">vs last year</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-5 text-amber-500">
            <FileWarning className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <FileWarning className="w-5 h-5" />
            </div>
            <h2 className="text-muted font-medium">Pending Tax Items</h2>
          </div>
          <div>
            <span className="text-3xl font-bold text-foreground">2</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
            <span>Due in 14 days</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Clock className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-muted font-medium">Next Assessment</h2>
          </div>
          <div>
            <span className="text-3xl font-bold text-foreground">Oct 31, 2026</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary flex items-center bg-primary/10 px-2 py-0.5 rounded-full">
              Q4 Returns
            </span>
          </div>
        </div>
      </div>

      {/* Analytics / Recent Activity Section */}
      <div className="glass-card rounded-2xl border border-border mt-4 w-full overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex justify-between items-center bg-zinc-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-lg font-bold text-foreground">Recent Payments</h3>
            <p className="text-sm text-muted">Immutable receipts recorded on Base Mainnet.</p>
          </div>
          <button className="text-sm font-medium text-primary hover:text-secondary transition-colors">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-slate-900/50 border-b border-border text-sm text-muted">
                <th className="font-medium p-4 pl-6">Tax Category</th>
                <th className="font-medium p-4">Amount</th>
                <th className="font-medium p-4">Date</th>
                <th className="font-medium p-4">Status</th>
                <th className="font-medium p-4 pr-6 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border">
              {/* Payment 1 */}
              <tr className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                <td className="p-4 pl-6 font-medium text-foreground">VAT - Q3 2026</td>
                <td className="p-4 font-mono text-foreground font-medium">₦450,000</td>
                <td className="p-4 text-muted">Oct 15, 2026</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  <a href="#" className="inline-flex items-center justify-center p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors" title="View IPFS Receipt">
                    <Receipt className="w-4 h-4" />
                  </a>
                </td>
              </tr>
              {/* Payment 2 */}
              <tr className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                <td className="p-4 pl-6 font-medium text-foreground">PAYE - Sept 2026</td>
                <td className="p-4 font-mono text-foreground font-medium">₦125,000</td>
                <td className="p-4 text-muted">Oct 02, 2026</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                    <a href="#" className="inline-flex items-center justify-center p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors" title="View IPFS Receipt">
                    <Receipt className="w-4 h-4" />
                  </a>
                </td>
              </tr>
              {/* Payment 3 */}
              <tr className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                <td className="p-4 pl-6 font-medium text-foreground">Withholding Tax</td>
                <td className="p-4 font-mono text-foreground font-medium">₦54,000</td>
                <td className="p-4 text-muted">Sept 28, 2026</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                    <a href="#" className="inline-flex items-center justify-center p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors" title="View IPFS Receipt">
                    <Receipt className="w-4 h-4" />
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
