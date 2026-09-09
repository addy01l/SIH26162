export type EventClassification = "Routine Flare" | "Fire" | "Shutdown"

export interface ThermalEvent {
  id: string
  timestamp: string
  lat: number
  lng: number
  classification: EventClassification
  source: string
  severity: "High" | "Medium" | "Low"
  confidence: number
  industrialSite: string
  brightness: number
  frp: number
}

export const thermalEvents: ThermalEvent[] = [
  {
    id: "FRM-88231",
    timestamp: "06:42:11Z",
    lat: 34.0522,
    lng: -118.2437,
    classification: "Fire",
    source: "VIIRS / NPP",
    severity: "High",
    confidence: 94,
    industrialSite: "Angeles Refinery Complex",
    brightness: 412.6,
    frp: 88.2,
  },
  {
    id: "FRM-88230",
    timestamp: "06:41:52Z",
    lat: 37.7749,
    lng: -122.4194,
    classification: "Routine Flare",
    source: "MODIS / Terra",
    severity: "Low",
    confidence: 88,
    industrialSite: "San Bruno Gas Plant",
    brightness: 318.4,
    frp: 12.1,
  },
  {
    id: "FRM-88229",
    timestamp: "06:41:09Z",
    lat: 36.7783,
    lng: -119.4179,
    classification: "Shutdown",
    source: "VIIRS / NOAA-21",
    severity: "Medium",
    confidence: 76,
    industrialSite: "Sierra Foothills Power Station",
    brightness: 398.1,
    frp: 71.5,
  },
  {
    id: "FRM-88228",
    timestamp: "06:39:47Z",
    lat: 40.7608,
    lng: -111.891,
    classification: "Routine Flare",
    source: "MODIS / Aqua",
    severity: "Low",
    confidence: 92,
    industrialSite: "Wasatch Industrial Park",
    brightness: 302.9,
    frp: 6.8,
  },
  {
    id: "FRM-88227",
    timestamp: "06:38:22Z",
    lat: 33.4484,
    lng: -112.074,
    classification: "Fire",
    source: "VIIRS / NPP",
    severity: "High",
    confidence: 97,
    industrialSite: "Sonoran Chemical Plant",
    brightness: 431.8,
    frp: 104.3,
  },
  {
    id: "FRM-88226",
    timestamp: "06:37:05Z",
    lat: 45.5051,
    lng: -122.675,
    classification: "Routine Flare",
    source: "MODIS / Terra",
    severity: "Low",
    confidence: 81,
    industrialSite: "Columbia Corridor Processing",
    brightness: 296.2,
    frp: 4.2,
  },
  {
    id: "FRM-88225",
    timestamp: "06:35:41Z",
    lat: 39.7392,
    lng: -104.9903,
    classification: "Fire",
    source: "VIIRS / NOAA-20",
    severity: "Medium",
    confidence: 85,
    industrialSite: "Front Range Storage Facility",
    brightness: 405.5,
    frp: 79.6,
  },
  {
    id: "FRM-88224",
    timestamp: "06:34:18Z",
    lat: 47.6062,
    lng: -122.3321,
    classification: "Routine Flare",
    source: "MODIS / Aqua",
    severity: "Low",
    confidence: 94,
    industrialSite: "Cascade Manufacturing Sector",
    brightness: 309.7,
    frp: 9.4,
  },
]
