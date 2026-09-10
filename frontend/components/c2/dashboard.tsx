"use client"

import { useState, useEffect } from "react"
import { TopNav } from "./top-nav"
import { TelemetryPanel } from "./telemetry-panel"
import { IntelDrawer } from "./intel-drawer"
import { MapCanvas } from "./map-canvas"
import type { ThermalEvent, SummaryMetrics } from "@/lib/c2-data"

export function Dashboard() {
  const [telemetryData, setTelemetryData] = useState<ThermalEvent[]>([])
  const [summaryMetrics, setSummaryMetrics] = useState<SummaryMetrics | null>(null)
  const [selectedDetection, setSelectedDetection] = useState<ThermalEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(true)

  const fetchData = async () => {
    try {
      const res = await fetch("/api/firms")
      if (!res.ok) throw new Error("Failed to fetch telemetry")
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setTelemetryData(data.detections || [])
      setSummaryMetrics(data.summary || null)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let isMounted = true

    const pollData = async () => {
      await fetchData()
      if (isMounted) {
        timeoutId = setTimeout(pollData, 300)
      }
    }

    pollData()

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-transparent vignette">
      <MapCanvas detections={telemetryData} selectedId={selectedDetection?.id ?? null} />
      <TopNav summary={summaryMetrics} />
      {isLoading && telemetryData.length === 0 ? (
        <div className="absolute left-4 top-20 z-10 p-4 font-mono text-sm text-primary animate-pulse border border-primary/50 bg-background/50 backdrop-blur-md rounded-sm">
          INITIATING SATELLITE UPLINK...
        </div>
      ) : error ? (
        <div className="absolute left-4 top-20 z-10 p-4 font-mono text-sm text-destructive glow-destructive border border-destructive/50 bg-background/50 backdrop-blur-md rounded-sm">
          UPLINK FAILURE: {error}
        </div>
      ) : (
        <TelemetryPanel 
          detections={telemetryData}
          selectedId={selectedDetection?.id ?? null} 
          onSelect={setSelectedDetection} 
        />
      )}
      <IntelDrawer event={selectedDetection} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
