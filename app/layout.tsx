import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'AI Debate Arena',
  description: 'Watch AI agents clash in structured debates. Pick a topic, watch the arguments unfold in real-time, and see the verdict.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans`}>
        <main className="min-h-screen bg-background text-foreground">
          {children}
        </main>
      </body>
    </html>
  )
}