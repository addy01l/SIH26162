"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Activity, Satellite, ShieldAlert, Radio, GitMerge } from "lucide-react"
import { KpiCard } from "./kpi-card"

const OVERPASS_INTERVAL_SECONDS = 96 * 60 // ~1h36m orbital revisit window

function formatCountdown(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function TopNav() {
  const [secondsLeft, setSecondsLeft] = useState(OVERPASS_INTERVAL_SECONDS - 1847)
  const [activeEvents, setActiveEvents] = useState(8)
  const [sitesMonitored, setSitesMonitored] = useState(12450)

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 0 ? OVERPASS_INTERVAL_SECONDS : prev - 1))
      if (Math.random() > 0.95) {
        setSitesMonitored((prev) => prev + 1)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const imminent = secondsLeft < 120

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-sm border border-border/60 bg-slate-950/60 px-4 py-2 backdrop-blur-md">
        <ShieldAlert className="size-5 text-primary" strokeWidth={1.75} />
        <div className="flex flex-col leading-none">
          <span className="font-mono text-sm font-semibold tracking-wide text-foreground">
            FIRE-EYE
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Industrial Fire & Thermal Anomaly Monitoring
          </span>
        </div>
        <div className="ml-2 flex items-center gap-1.5 border-l border-border/60 pl-3">
          <Radio className="size-3 text-primary" strokeWidth={2} />
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary glow-primary">
            Live
          </span>
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
          label="Active Thermal Events"
          value={activeEvents.toLocaleString()}
          tone="primary"
          active
        />
        <KpiCard
          icon={ShieldAlert}
          label="Industrial Sites Monitored"
          value={sitesMonitored.toLocaleString()}
          tone="neutral"
        />
        <KpiCard
          icon={Satellite}
          label="Recent Satellite Pass"
          value={formatCountdown(secondsLeft)}
          tone={imminent ? "destructive" : "primary"}
          active={imminent}
        />
      </div>
    </header>
  )
}
