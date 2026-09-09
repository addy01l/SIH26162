"use client"

import dynamic from 'next/dynamic'

const EarthBackground = dynamic(() => import('./earth-background'), { 
  ssr: false 
})

export default function EarthBackgroundDynamic() {
  return <EarthBackground />
}
