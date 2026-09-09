import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

interface KpiCardProps {
  icon: LucideIcon
  label: string
  value: string
  unit?: string
  tone?: "primary" | "destructive" | "neutral"
  active?: boolean
}

const toneStyles: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  primary: "text-primary glow-primary",
  destructive: "text-destructive glow-destructive",
  neutral: "text-foreground",
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  unit,
  tone = "neutral",
  active = false,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-sm border border-border/60 bg-card/50 px-4 py-2 backdrop-blur-md",
        active && "border-primary/40 glow-ring-primary"
      )}
    >
      <Icon
        className={cn("size-4", tone === "neutral" ? "text-muted-foreground" : toneStyles[tone])}
        strokeWidth={1.75}
      />
      <div className="flex flex-col leading-none">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className={cn("font-mono text-base font-semibold tabular-nums", toneStyles[tone])}>
          {value}
          {unit && <span className="ml-1 text-xs text-muted-foreground">{unit}</span>}
        </span>
      </div>
    </div>
  )
}
