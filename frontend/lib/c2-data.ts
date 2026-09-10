export type EventClassification = "Industrial Fire" | "Routine Flare"

export interface ThermalEvent {
  id: string
  lat: number
  lng: number
  brightness: number
  frp: number
  confidence: number // Normalized to 0-100 percentage
  timestamp: string
  satellite: string
  source: string // Used in UI, mapped from satellite
  classification: EventClassification
  severity: "High" | "Medium" | "Low" // Mapped based on confidence/frp
  industrialSite: string // Extrapolated/mocked for now as per previous UI
}

export interface SummaryMetrics {
  totalDetections: number
  severeAnomalies: number // Industrial Fire count
  routineFlares: number
  avgConfidence: number
  lastUpdated: string
}
