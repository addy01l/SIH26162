import Link from "next/link"
import { ArrowDown, Database, Eye, Flame, MapPinned, RadioTower } from "lucide-react"

export default function WorkflowPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 text-foreground font-mono selection:bg-primary/30">
      <div className="mx-auto max-w-4xl pt-12">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">FIRE-EYE Workflow</h1>
            <p className="mt-2 text-sm text-muted-foreground uppercase tracking-widest">
              Industrial Fire & Thermal Anomaly Monitoring Pipeline
            </p>
          </div>
          <Link
            href="/"
            className="rounded-sm border border-border/60 bg-card/50 px-4 py-2 text-xs uppercase tracking-widest hover:bg-accent/40 transition-colors"
          >
            ← Back to Tactical Map
          </Link>
        </div>

        <div className="relative flex flex-col gap-6">
          {/* Step 1 */}
          <div className="relative flex gap-6 rounded-md border border-border/60 bg-card/30 p-6 backdrop-blur-md">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-primary/20 text-primary border border-primary/40">
              <RadioTower className="size-6" />
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-1">
                Step 1: Ingestion
              </h2>
              <h3 className="text-xl font-medium text-white mb-3">NASA FIRMS / Satellite Telemetry</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Fetch near-real-time thermal data through NASA FIRMS using MODIS and VIIRS satellite instruments. Detections form the raw input for anomaly analysis.
              </p>
            </div>
          </div>

          <div className="flex justify-center text-border">
            <ArrowDown className="size-6" />
          </div>

          {/* Step 2 */}
          <div className="relative flex gap-6 rounded-md border border-border/60 bg-card/30 p-6 backdrop-blur-md">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-blue-500/20 text-blue-500 border border-blue-500/40">
              <MapPinned className="size-6" />
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-blue-500 mb-1">
                Step 2: Context
              </h2>
              <h3 className="text-xl font-medium text-white mb-3">OpenStreetMap / PostGIS Matching</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Match raw thermal coordinates against industrial infrastructure polygons sourced from OpenStreetMap using PostGIS spatial queries.
              </p>
            </div>
          </div>

          <div className="flex justify-center text-border">
            <ArrowDown className="size-6" />
          </div>

          {/* Step 3 */}
          <div className="relative flex gap-6 rounded-md border border-border/60 bg-card/30 p-6 backdrop-blur-md">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-purple-500/20 text-purple-500 border border-purple-500/40">
              <Database className="size-6" />
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-purple-500 mb-1">
                Step 3: AI Classification
              </h2>
              <h3 className="text-xl font-medium text-white mb-3">Anomaly Classification Engine</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-4">
                Evaluate event characteristics against historical baselines using XGBoost and Isolation Forest to classify the thermal event.
              </p>
              <div className="flex gap-3">
                <span className="rounded bg-background/50 border border-border/60 px-3 py-1 text-[11px] uppercase tracking-widest">
                  Routine Flare
                </span>
                <span className="rounded bg-destructive/20 text-destructive border border-destructive/40 px-3 py-1 text-[11px] uppercase tracking-widest">
                  Fire
                </span>
                <span className="rounded bg-amber-500/20 text-amber-500 border border-amber-500/40 px-3 py-1 text-[11px] uppercase tracking-widest">
                  Shutdown
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center text-border">
            <ArrowDown className="size-6" />
          </div>

          {/* Step 4 */}
          <div className="relative flex gap-6 rounded-md border border-border/60 bg-card/30 p-6 backdrop-blur-md">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-emerald-500/20 text-emerald-500 border border-emerald-500/40">
              <Eye className="size-6" />
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-500 mb-1">
                Step 4: Validation
              </h2>
              <h3 className="text-xl font-medium text-white mb-3">Sentinel-2 Optical & SWIR</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Cross-reference flagged anomalies using high-resolution Sentinel-2 optical imagery and Short-Wave Infrared (SWIR) bands to validate the detected fire core.
              </p>
            </div>
          </div>

          <div className="flex justify-center text-border">
            <ArrowDown className="size-6" />
          </div>

          {/* Step 5 */}
          <div className="relative flex gap-6 rounded-md border border-border/60 bg-card/30 p-6 backdrop-blur-md">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-orange-500/20 text-orange-500 border border-orange-500/40">
              <Flame className="size-6" />
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-orange-500 mb-1">
                Step 5: Alerting
              </h2>
              <h3 className="text-xl font-medium text-white mb-3">Tactical GIS Dashboard</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Broadcast event coordinates, severity information, and industrial context to the FIRE-EYE dashboard for operator review and ground verification dispatch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
