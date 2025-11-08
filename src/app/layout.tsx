import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SidebarLayout from '@/components/layout/sidebar-layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Business Coaching Platform',
  description: 'Transform your business with data-driven coaching',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap all page content with SidebarLayout */}
        <SidebarLayout>
          {children}
        </SidebarLayout>
      </body>
    </html>
  )
}