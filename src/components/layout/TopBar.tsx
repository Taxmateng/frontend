import { Search, Bell, User } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      {/* Search Bar */}
      <div className="relative w-full max-w-md hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search taxes, payments, or documents..."
          className="w-full h-10 pl-10 pr-12 rounded-full bg-card border border-border text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted/30 px-1.5 font-mono text-[10px] font-medium text-muted">
            <span className="text-xs">⌘</span>F
          </kbd>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-auto">
        <button className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-foreground">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
        </button>
        
        <div className="h-8 w-px bg-border mx-2"></div>
        
        <button className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-semibold text-foreground leading-tight">Tax Payer</span>
            <span className="text-xs text-muted">ID: 10293847</span>
          </div>
        </button>
      </div>
    </header>
  );
}
