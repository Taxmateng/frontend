import { cn } from "@/lib/utils";

type Variant = "success" | "warning" | "danger" | "neutral";

const classes: Record<Variant, string> = {
  success: "bg-accent/10 text-accent border-accent/20",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  danger: "bg-red-500/10 text-red-500 border-red-500/20",
  neutral: "bg-primary/10 text-primary border-primary/20"
};

export function StatusBadge({
  label,
  variant = "neutral"
}: {
  label: string;
  variant?: Variant;
}) {
  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", classes[variant])}>{label}</span>;
}
