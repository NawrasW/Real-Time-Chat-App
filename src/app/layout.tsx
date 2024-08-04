'use client'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProviderWrapper from './SessionProviderWrapper'

const inter = Inter({ subsets: ['latin'] })



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" >
      <body className={inter.className}   style={{
        overflow: 'hidden', // Hide both horizontal and vertical scrollbars
scrollbarWidth: 'none', // Firefox
msOverflowStyle: 'none' // IE and Edge
        }}>
         <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper></body>
    </html>
  )
}
//overflow: 'hidden', // Hide both horizontal and vertical scrollbars
//scrollbarWidth: 'none', // Firefox
//msOverflowStyle: 'none' // IE and Edge