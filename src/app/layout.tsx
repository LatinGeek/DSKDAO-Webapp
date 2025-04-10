import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import RootProvider from '@/components/providers/RootProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'DSKDAO Item Shop',
  description: 'Web3-oriented item shop with Discord integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
} 