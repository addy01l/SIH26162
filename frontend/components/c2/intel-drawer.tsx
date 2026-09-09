"use client"

import Image from "next/image"
import { ChevronRight, MapPinned, Radar, Thermometer } from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import type { ThermalEvent } from "@/lib/c2-data"

interface IntelDrawerProps {
  event: ThermalEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IntelDrawer({ event, open, onOpenChange }: IntelDrawerProps) {
  return (
    <>
      {/* Collapsed rail toggle */}
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label={open ? "Collapse intelligence drawer" : "Expand intelligence drawer"}
        className={cn(
          "pointer-events-auto absolute right-4 top-20 z-20 flex size-9 items-center justify-center rounded-sm border border-border/60 bg-card/60 backdrop-blur-md transition-[right] duration-300",
          open && "right-[374px]"
        )}
      >
        <ChevronRight
          className={cn("size-4 text-primary transition-transform", open && "rotate-180")}
        />
      </button>

      <aside
        className={cn(
          "pointer-events-auto absolute right-4 top-20 bottom-4 z-10 flex w-[350px] flex-col overflow-hidden rounded-sm border border-border/60 bg-card/40 backdrop-blur-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-[calc(100%+1rem)]"
        )}
      >
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <Radar className="size-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
            Event Analysis
          </h2>
        </div>

        {event ? (
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-lg font-semibold text-foreground">{event.id}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {event.timestamp} · {event.source}
                </p>
              </div>
              <Badge
                variant={event.classification === "Fire" ? "destructive" : "outline"}
                className={cn(
                  "font-mono uppercase",
                  event.classification === "Routine Flare" && "border-primary/40 text-primary",
                  event.classification === "Shutdown" && "border-amber-500/40 text-amber-500"
                )}
              >
                {event.classification}
              </Badge>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Detection Confidence
                </span>
                <span
                  className={cn(
                    "font-mono text-sm font-semibold tabular-nums",
                    event.confidence >= 80 ? "text-destructive glow-destructive" : "text-primary"
                  )}
                >
                  {event.confidence}%
                </span>
              </div>
              <Progress
                value={event.confidence}
                className={cn(
                  "h-1.5",
                  event.confidence >= 80 ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Assessed Severity
                </span>
                <span className="font-mono text-sm font-semibold uppercase text-foreground">
                  {event.severity}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="flex flex-col gap-0.5 rounded-sm border border-border/60 bg-background/40 px-3 py-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Brightness (K)
                </span>
                <span className="text-foreground">{event.brightness.toFixed(1)}</span>
              </div>
              <div className="flex flex-col gap-0.5 rounded-sm border border-border/60 bg-background/40 px-3 py-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  FRP (MW)
                </span>
                <span className="text-foreground">{event.frp.toFixed(1)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <MapPinned className="size-3.5 text-muted-foreground" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Industrial Site Match
                </span>
              </div>
              <p className="rounded-sm border border-border/60 bg-background/40 px-3 py-2 font-mono text-sm text-foreground">
                {event.industrialSite}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground/70">
                {event.lat.toFixed(4)}, {event.lng.toFixed(4)}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <Thermometer className="size-3.5 text-muted-foreground" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Sensor Comparison
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <figure className="flex flex-col gap-1.5">
                  <div className="relative aspect-square overflow-hidden rounded-sm border border-border/60">
                    <Image
                      src="/images/thermal-satellite.png"
                      alt="Thermal infrared satellite capture of the detection site"
                      fill
                      className="object-cover"
                      crossOrigin="anonymous"
                    />
                    <span className="absolute left-1.5 top-1.5 rounded-xs bg-background/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary">
                      Thermal
                    </span>
                  </div>
                </figure>
                <figure className="flex flex-col gap-1.5">
                  <div className="relative aspect-square overflow-hidden rounded-sm border border-border/60">
                    <Image
                      src="/images/swir-satellite.png"
                      alt="SWIR optical satellite capture of the detection site"
                      fill
                      className="object-cover"
                      crossOrigin="anonymous"
                    />
                    <span className="absolute left-1.5 top-1.5 rounded-xs bg-background/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary">
                      SWIR Optical
                    </span>
                  </div>
                </figure>
              </div>
            </div>

            <Button variant="outline" className="mt-auto font-mono text-xs uppercase tracking-widest">
              Dispatch Ground Verification
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <Radar className="size-6 text-muted-foreground/50" strokeWidth={1.25} />
            <p className="font-mono text-xs text-muted-foreground">
              Select a thermal event from the active feed to view event analysis and satellite validation.
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
