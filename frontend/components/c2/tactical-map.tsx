'use client'

import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import KeplerGl from '@kepler.gl/components'
import { addDataToMap } from '@kepler.gl/actions'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const sampleData = {
  fields: [
    { name: 'id', format: '', type: 'string' },
    { name: 'latitude', format: '', type: 'real' },
    { name: 'longitude', format: '', type: 'real' },
    { name: 'brightness', format: '', type: 'real' }
  ],
  rows: [
    ['FRM-88231', 34.0522, -118.2437, 412.6],
    ['FRM-88230', 37.7749, -122.4194, 380.0],
    ['FRM-88229', 36.7783, -119.4179, 450.2]
  ]
}

const mapConfig = {
  version: 'v1' as const,
  config: {
    mapStyle: {
      styleType: 'darkMatter'
    },
    mapState: {
      bearing: 0,
      dragRotate: true,
      latitude: 37.0,
      longitude: -120.0,
      pitch: 45,
      zoom: 5,
      isSplit: false
    }
  }
}

export default function TacticalMap() {
  const dispatch = useDispatch()
  const [dimensions, setDimensions] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 800, 
    height: typeof window !== 'undefined' ? window.innerHeight : 600 
  })

  useEffect(() => {
    // Handle resize
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    window.addEventListener('resize', handleResize)
    
    // Load initial data
    dispatch(
      addDataToMap({
        datasets: {
          info: {
            label: 'Thermal Anomalies',
            id: 'thermal_anomalies'
          },
          data: sampleData
        },
        options: {
          centerMap: true,
          readOnly: false
        },
        config: mapConfig
      })
    )

    return () => window.removeEventListener('resize', handleResize)
  }, [dispatch])

  return (
    <div className="absolute inset-0 z-0 [&_.maplibregl-map]:bg-transparent [&_.maplibregl-canvas]:bg-transparent [&_.kepler-gl]:bg-transparent">
      <KeplerGl
        id="tactical"
        mapboxApiAccessToken=""
        maplibregl={maplibregl}
        mapStyles={[{
          id: 'darkMatter',
          label: 'Dark Matter',
          url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
          icon: ''
        }]}
        width={dimensions.width}
        height={dimensions.height}
      />
    </div>
  )
}
