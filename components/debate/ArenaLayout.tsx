'use client'

import type { ReactNode } from 'react'

interface ArenaLayoutProps {
  proColumn: ReactNode
  conColumn: ReactNode
  activeSide: 'pro' | 'con' | null
}

export function ArenaLayout({ proColumn, conColumn, activeSide }: ArenaLayoutProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-0 flex-1 min-h-0">
      <div
        className={`p-5 rounded-xl transition-all duration-500 ${
          activeSide === 'pro' ? 'glow-pro' : ''
        } ${activeSide === 'con' ? 'opacity-60' : ''}`}
      >
        {proColumn}
      </div>

      <div className="flex flex-col items-center justify-center px-4">
        <div className="w-px h-full bg-linear-to-b from-transparent via-muted-foreground/20 to-transparent relative">
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 text-xs font-bold tracking-widest text-muted-foreground/40 rotate-0 ${
              activeSide ? 'animate-vs-pulse' : ''
            }`}
            style={{ writingMode: 'vertical-lr' }}
          >
            VS
          </div>
        </div>
      </div>

      <div
        className={`p-5 rounded-xl transition-all duration-500 ${
          activeSide === 'con' ? 'glow-con' : ''
        } ${activeSide === 'pro' ? 'opacity-60' : ''}`}
      >
        {conColumn}
      </div>
    </div>
  )
}
