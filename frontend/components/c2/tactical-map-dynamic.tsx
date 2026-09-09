'use client'

import dynamic from 'next/dynamic'

export const TacticalMapDynamic = dynamic(
  () => import('./tactical-map'),
  { ssr: false }
)
