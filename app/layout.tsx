// File: app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ThinkClear - Watch AI Reason Through Any Question',
  description: 'The first AI that shows you exactly how it thinks through problems. See transparent reasoning, question assumptions, and think together with AI.',
  keywords: 'AI reasoning, transparent AI, AI thinking, business strategy, decision making',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
