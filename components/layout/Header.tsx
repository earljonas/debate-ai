'use client'

import Link from 'next/link'

interface HeaderProps {
  showNewDebate?: boolean
}

export function Header({ showNewDebate = false }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-sm font-bold tracking-wider text-foreground group-hover:text-pro transition-colors">
            AI DEBATE ARENA
          </span>
        </Link>
        {showNewDebate && (
          <Link
            href="/setup"
            className="text-xs font-medium px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            New Debate
          </Link>
        )}
      </div>
    </header>
  )
}
