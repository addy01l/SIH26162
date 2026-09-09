import { Crosshair } from "lucide-react"

export function MapCanvas() {
  return (
    <div className="tactical-grid absolute inset-0 flex items-center justify-center bg-transparent">
      {/* Faint radial vignette to sell depth under the overlays, using transparent blacks */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,4,10,0.8)_100%)]" />

      <div className="relative flex flex-col items-center gap-3 text-muted-foreground">
        <Crosshair className="size-8 text-primary/60" strokeWidth={1.25} />
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground/80">
          Kepler.gl WebGL Canvas
        </p>
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground/50">
          RENDER CONTEXT NOT INITIALIZED — AWAITING GEOSPATIAL LAYER
        </p>
      </div>

      {/* Corner reticle marks for HUD feel */}
      <div className="pointer-events-none absolute inset-6 border border-primary/10" />
    </div>
  )
}
