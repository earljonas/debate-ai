'use client'

import { useEffect, useState } from 'react'

interface RoundTransitionProps {
  round: number
  visible: boolean
  onComplete: () => void
}

export function RoundTransition({ round, visible, onComplete }: RoundTransitionProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        onComplete()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [visible, onComplete])

  if (!show) return null

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
