"use client"

import { useState } from "react"
import { TacticalMapDynamic } from "./tactical-map-dynamic"
import { TopNav } from "./top-nav"
import { TelemetryPanel } from "./telemetry-panel"
import { IntelDrawer } from "./intel-drawer"
import type { ThermalEvent } from "@/lib/c2-data"
import { thermalEvents } from "@/lib/c2-data"

export function Dashboard() {
  const [selected, setSelected] = useState<ThermalEvent | null>(thermalEvents[0])
  const [drawerOpen, setDrawerOpen] = useState(true)

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-transparent vignette">
      {/* <TacticalMapDynamic /> */}
      <TopNav />
      <TelemetryPanel selectedId={selected?.id ?? null} onSelect={setSelected} />
      <IntelDrawer event={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
