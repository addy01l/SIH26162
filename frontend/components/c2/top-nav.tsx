"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Activity, Satellite, ShieldAlert, Radio, GitMerge, Target, Filter } from "lucide-react"
import { KpiCard } from "./kpi-card"
import type { SummaryMetrics } from "@/lib/c2-data"

const NOAA20_ORBIT_SECONDS = 101 * 60

function formatCountdown(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function TopNav({ summary }: { summary: SummaryMetrics | null }) {
  const [secondsLeft, setSecondsLeft] = useState(NOAA20_ORBIT_SECONDS - 2530)

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 0 ? NOAA20_ORBIT_SECONDS : prev - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const imminent = secondsLeft < 120

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-sm glass-panel px-4 py-2">
        <ShieldAlert className="size-5 text-primary" strokeWidth={1.75} />
        <div className="flex flex-col leading-none">
          <span className="font-mono text-sm font-semibold tracking-wide text-foreground">
            FIRE-EYE
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Industrial Fire & Thermal Anomaly Monitoring
          </span>
        </div>
        <div className="ml-2 flex items-center gap-2 border-l border-border/60 pl-3">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary glow-primary">
              Live Feed
            </span>
            <span className="font-mono text-[9px] text-muted-foreground">
              SYNC: {summary?.lastUpdated ? formatTime(summary.lastUpdated) : "WAITING"}
            </span>
          </div>
        </div>
      </div>

      <div className="pointer-events-auto flex flex-wrap items-center gap-2">
        <Link 
          href="/workflow" 
          className="flex h-12 items-center gap-2 rounded-sm border border-border/60 bg-card/50 px-4 py-2 hover:bg-accent/40 transition-colors backdrop-blur-md font-mono text-[10px] uppercase tracking-widest text-foreground"
        >
          <GitMerge className="size-4 text-primary" strokeWidth={1.75} />
          View Pipeline
        </Link>
        <KpiCard
          icon={Activity}
          label="Active (12h)"
          value={summary ? summary.totalDetections.toLocaleString() : "--"}
          tone="primary"
          active
        />
        <KpiCard
          icon={Filter}
          label="Routine Flares"
          value={summary ? summary.routineFlares.toLocaleString() : "--"}
          tone="neutral"
        />
        <KpiCard
          icon={Target}
          label="Avg Confidence"
          value={summary ? `${summary.avgConfidence}%` : "--"}
          tone="neutral"
        />
        <KpiCard
          icon={Satellite}
          label="NOAA-20 Orbit"
          value={formatCountdown(secondsLeft)}
          tone={imminent ? "destructive" : "primary"}
          active={imminent}
        />
      </div>
    </header>
  )
}
