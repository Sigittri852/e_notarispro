import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'e-NotarisKu Pro — Notaris & PPAT Digital',
  description:
    'Sistem manajemen akta digital terpadu untuk Notaris dan PPAT. Kelola buku daftar akta, alur kerja PPAT, integrasi BPN, dan pajak dalam satu platform.',
  keywords: ['notaris', 'PPAT', 'akta tanah', 'BPN', 'BPHTB', 'PPh', 'buku daftar akta'],
}

export const viewport: Viewport = {
  themeColor: '#1e40af',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="bg-[#f0f4f8]">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
