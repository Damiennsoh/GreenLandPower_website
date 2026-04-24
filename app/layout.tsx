import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { PWARegister } from '@/components/pwa-register'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: 'Green Land Power Inc. - Professional Electrical Solutions',
  description: 'Leading electrical services and sustainable power solutions for residential and commercial projects in Liberia.',
  keywords: 'electrical services, power solutions, renewable energy, commercial electrical, residential electrical, Liberia',
  authors: [{ name: 'Green Land Power Inc.' }],
  metadataBase: new URL('https://greenlandpower.com'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Green Land Power',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Green Land Power Inc. - Professional Electrical Solutions',
    description: 'Leading electrical services and sustainable power solutions for residential and commercial projects in Liberia.',
    url: 'https://greenlandpower.com',
    siteName: 'Green Land Power Inc.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <PWARegister />
        {children}
        <Toaster position="bottom-right" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
