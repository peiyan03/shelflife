import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import { Nav } from '@/app/nav'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shelf Life',
  description: 'Photograph a receipt, confirm the items, see what to use soon and what to cook.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="site-brand">
            Shelf Life
          </Link>
          <Nav />
        </header>
        {children}
      </body>
    </html>
  )
}
