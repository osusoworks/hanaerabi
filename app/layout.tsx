import type { Metadata } from 'next'
import { Kiwi_Maru } from 'next/font/google' // Import Kiwi Maru
import './globals.css'

// Initialize Kiwi Maru
const kiwiMaru = Kiwi_Maru({
  variable: '--font-kiwi-maru',
  weight: ['300', '400', '500'], // Specify needed weights
  subsets: ['latin', 'cyrillic'] // Specify needed subsets
})

export const metadata: Metadata = {
  title: '花えらびサポートアプリ',
  description: 'ATELIER FLANNEL SHIRAOKA様向け 花えらびサポート'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className="">
      {/* Apply Kiwi Maru font variable to body */}
      <body className={`${kiwiMaru.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
