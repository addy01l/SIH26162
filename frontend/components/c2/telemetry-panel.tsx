"use client"

import { Flame, ListTree, Factory } from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { ThermalEvent } from "@/lib/c2-data"

interface TelemetryPanelProps {
  detections: ThermalEvent[]
  selectedId: string | null
  onSelect: (event: ThermalEvent) => void
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ${mins % 60}m ago`
}

export function TelemetryPanel({ detections, selectedId, onSelect }: TelemetryPanelProps) {
  return (
    <aside className="pointer-events-auto absolute left-4 top-20 bottom-4 z-10 flex w-[350px] flex-col overflow-hidden rounded-sm glass-panel">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <ListTree className="size-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
            Active Thermal Events
          </h2>
        </div>
        <Badge variant="destructive" className="font-mono fire-pulse">
          <Flame data-icon="inline-start" />
          {detections.length} active (12h)
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <ul className="flex flex-col">
          {detections.map((d, idx) => {
            const isSelected = d.id === selectedId
            const isFire = d.classification === "Industrial Fire"
            const isNewest = idx === 0

            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => onSelect(d)}
                  className={cn(
                    "w-full px-4 py-3 text-left transition-colors hover:bg-accent/40 relative",
                    isSelected && "bg-accent/60 border-l-2 border-l-primary",
                    isNewest && "bg-primary/5 shadow-[inset_0_0_15px_rgba(0,255,255,0.1)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary before:animate-pulse"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("font-mono text-[11px]", isNewest ? "text-primary glow-primary font-bold" : "text-muted-foreground")}>
                      {timeAgo(d.timestamp)}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-mono uppercase text-[10px]",
                        isFire 
                          ? "border-red-500/50 bg-red-950/40 text-red-400 glow-destructive" 
                          : "border-cyan-500/50 bg-cyan-950/40 text-cyan-400 glow-primary"
                      )}
                    >
                      {d.classification}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="font-mono text-sm text-foreground">
                      LAT: {d.lat.toFixed(4)} | LNG: {d.lng.toFixed(4)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Factory className="size-3 text-muted-foreground/60" strokeWidth={1.5} />
                    <span className="font-mono text-[10px] text-muted-foreground/80 truncate">
                      {d.brightness.toFixed(1)} K
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground/60">
                      {d.source}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/50">
                      FRP {d.frp.toFixed(1)} MW
                    </span>
                  </div>
                </button>
                {idx < detections.length - 1 && <Separator className="opacity-40" />}
              </li>
            )
          })}
        </ul>
      </ScrollArea>

      <div className="border-t border-border/60 px-4 py-2">
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground/60">
          FEED SYNC: 30s POLLING — NRT SENSOR: VIIRS 375m
        </p>
      </div>
    </aside>
  )
}
