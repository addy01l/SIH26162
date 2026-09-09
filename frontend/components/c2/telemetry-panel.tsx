"use client"

import { Flame, ListTree } from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { ThermalEvent } from "@/lib/c2-data"
import { thermalEvents } from "@/lib/c2-data"

interface TelemetryPanelProps {
  selectedId: string | null
  onSelect: (event: ThermalEvent) => void
}

function formatCoord(lat: number, lng: number) {
  const latStr = `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? "N" : "S"}`
  const lngStr = `${Math.abs(lng).toFixed(4)}°${lng >= 0 ? "E" : "W"}`
  return `${latStr} / ${lngStr}`
}

export function TelemetryPanel({ selectedId, onSelect }: TelemetryPanelProps) {
  const fireCount = thermalEvents.filter((d) => d.classification === "Fire").length

  return (
    <aside className="pointer-events-auto absolute left-4 top-20 bottom-4 z-10 flex w-[350px] flex-col overflow-hidden rounded-sm border border-border/60 bg-slate-950/60 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <ListTree className="size-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
            Active Thermal Events
          </h2>
        </div>
        <Badge variant="destructive" className="font-mono">
          <Flame data-icon="inline-start" />
          {fireCount} active
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <ul className="flex flex-col">
          {thermalEvents.map((d, idx) => {
            const isSelected = d.id === selectedId
            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => onSelect(d)}
                  className={cn(
                    "w-full px-4 py-3 text-left transition-colors hover:bg-accent/40",
                    isSelected && "bg-accent/60"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {d.timestamp}
                    </span>
                    <Badge
                      variant={d.classification === "Fire" ? "destructive" : "outline"}
                      className={cn(
                        "font-mono uppercase",
                        d.classification === "Routine Flare" && "border-primary/40 text-primary",
                        d.classification === "Shutdown" && "border-amber-500/40 text-amber-500"
                      )}
                    >
                      {d.classification}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="font-mono text-sm text-foreground">
                      {formatCoord(d.lat, d.lng)}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">{d.id}</span>
                  </div>
                  <span className="mt-1 block font-mono text-[10px] text-muted-foreground/70">
                    {d.source}
                  </span>
                </button>
                {idx < thermalEvents.length - 1 && <Separator className="opacity-60" />}
              </li>
            )
          })}
        </ul>
      </ScrollArea>

      <div className="border-t border-border/60 px-4 py-2">
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground/60">
          FEED SYNC 06:42:14Z — NRT LATENCY 3.1s
        </p>
      </div>
    </aside>
  )
}
