'use client'

import { useEffect } from 'react'

interface RoundTransitionProps {
  round: number
  visible: boolean
  onComplete: () => void
}

export function RoundTransition({ round, visible, onComplete }: RoundTransitionProps) {
  useEffect(() => {
    if (!visible) return

    const timer = setTimeout(() => {
      onComplete()
    }, 1500)

    return () => clearTimeout(timer)
  }, [visible, onComplete])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm animate-fade-in">
      <div className="text-center animate-scale-in">
        <p className="text-xs font-bold tracking-[0.25em] text-muted-foreground uppercase mb-2">
          Round
        </p>
        <p className="text-6xl font-mono font-black text-foreground">
          {round}
        </p>
      </div>
    </div>
  )
}
