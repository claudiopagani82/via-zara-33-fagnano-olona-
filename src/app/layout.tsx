import type { Metadata } from 'next'
import { Open_Sans, Dancing_Script } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import property from '@/config/property.json'

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
})

const dancingScript = Dancing_Script({
  variable: '--font-dancing-script',
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'Domus Tua Immobiliare – Via Cavour 37, Centro Tradate',
  description:
    'Brochure digitale del trilocale ristrutturato in pieno centro a Tradate. Scopri tutte le caratteristiche, planimetrie, documenti e molto altro.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (property.disabled) {
    return (
      <html lang="it">
        <body style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f4f4f5', fontFamily: 'sans-serif' }}>
          <p style={{ color: '#71717a', fontSize: '1rem' }}>Questo sito non è al momento disponibile.</p>
        </body>
      </html>
    )
  }

  return (
    <html
      lang="it"
      className={`${openSans.variable} ${dancingScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navigation />
        <main className="flex-1 pt-12">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
