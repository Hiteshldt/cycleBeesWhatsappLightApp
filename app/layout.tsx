import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CycleBees - Bike Service Management',
  description: 'Professional bike service estimate management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}