import { Crosshair } from "lucide-react"
import { cn } from "cn"
import type { ThermalEvent } from "@/lib/c2-data"

interface MapCanvasProps {
  detections: ThermalEvent[]
  selectedId: string | null
}

export function MapCanvas({ detections, selectedId }: MapCanvasProps) {
  // Approximate Bounding Box for India to map to SVG viewbox
  const minLng = 68;
  const maxLng = 97;
  const minLat = 6;
  const maxLat = 37;

  return (
    <div className="tactical-grid absolute inset-0 flex items-center justify-center bg-transparent overflow-hidden">
      {/* Faint radial vignette to sell depth under the overlays */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,4,10,0.8)_100%)]" />

      {detections.length === 0 ? (
        <div className="relative flex flex-col items-center gap-3 text-muted-foreground">
          <Crosshair className="size-8 text-primary/60" strokeWidth={1.25} />
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground/50">
            AWAITING SATELLITE UPLINK
          </p>
        </div>
      ) : (
        <svg 
          className="absolute inset-0 w-full h-full opacity-80"
          viewBox={`${minLng} ${minLat} ${maxLng - minLng} ${maxLat - minLat}`}
          preserveAspectRatio="xMidYMid slice"
          style={{ transform: 'scaleY(-1)' }} // Invert Y axis for Latitudes (SVG coordinate system)
        >
          {detections.map(d => {
            const isFire = d.classification === "Industrial Fire";
            const isSelected = d.id === selectedId;
            return (
              <circle
                key={d.id}
                cx={d.lng}
                cy={d.lat}
                r={isSelected ? 0.3 : (isFire ? 0.15 : 0.08)}
                className={cn(
                  "transition-all duration-300 origin-center",
                  isFire ? "fill-red-500" : "fill-cyan-500",
                  isSelected ? "stroke-white stroke-[0.05px]" : "stroke-transparent"
                )}
                style={isFire ? { filter: 'drop-shadow(0 0 0.5px rgba(239, 68, 68, 0.8))' } : {}}
              />
            )
          })}
        </svg>
      )}

      {/* Corner reticle marks for HUD feel */}
      <div className="pointer-events-none absolute inset-6 border border-primary/10" />
    </div>
  )
}
