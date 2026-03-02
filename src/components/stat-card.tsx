import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  trend?: "positive" | "negative" | "neutral";
  className?: string;
}

export function StatCard({ label, value, description, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md",
        className
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums tracking-tight",
          trend === "positive" && "text-[var(--color-positive)]",
          trend === "negative" && "text-[var(--color-negative)]"
        )}
      >
        {value}
      </p>
      {description && (
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
