import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const _mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'FIRE-EYE — Industrial Fire & Thermal Anomaly Monitoring',
  description: 'AI-based detection and classification of industrial fires and persistent thermal sources using NASA FIRMS, OSM & satellite data.',
  generator: 'FIRE-EYE / SIH26162',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#05070a',
}

import EarthBackgroundDynamic from '@/components/earth-background-dynamic'
import StoreProvider from '@/components/store-provider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark bg-transparent ${_inter.variable} ${_mono.variable}`}>
      <body className="antialiased font-sans bg-transparent">
        <div className="fixed inset-0 -z-50 bg-[#02040a]">
          <EarthBackgroundDynamic />
        </div>
        <StoreProvider>
          {children}
        </StoreProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
