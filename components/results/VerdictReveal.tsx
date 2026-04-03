'use client'

import { useState, useEffect } from 'react'
import type { JudgeVerdict } from '@/types/debate'

interface VerdictRevealProps {
  verdict: JudgeVerdict
  topic: string
}

export function VerdictReveal({ verdict, topic }: VerdictRevealProps) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => setPhase(4), 2000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const winnerText =
    verdict.winner === 'draw'
      ? 'DRAW'
      : verdict.winner === 'pro'
      ? 'PRO WINS'
      : 'CON WINS'

  const winnerColor =
    verdict.winner === 'draw'
      ? 'text-judge'
      : verdict.winner === 'pro'
      ? 'text-pro'
      : 'text-con'

  const marginLabels: Record<string, string> = {
    narrow: 'Narrow Victory',
    moderate: 'Moderate Victory',
    decisive: 'Decisive Victory',
  }

  return (
    <div className="flex flex-col items-center text-center">
      {phase >= 1 && (
        <div className="animate-trophy mb-6">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold ${
              verdict.winner === 'draw'
                ? 'bg-judge/10 text-judge'
                : verdict.winner === 'pro'
                ? 'bg-pro/10 text-pro'
                : 'bg-con/10 text-con'
            }`}
          >
            {verdict.winner === 'draw' ? '=' : verdict.winner === 'pro' ? 'P' : 'C'}
          </div>
        </div>
      )}

      {phase >= 2 && (
        <div className="animate-fade-in-up">
          <h1 className={`text-4xl font-black tracking-tight ${winnerColor}`}>
            {winnerText}
          </h1>
          {verdict.winner !== 'draw' && (
            <p className="text-sm text-muted-foreground mt-2">
              {marginLabels[verdict.winMargin] || verdict.winMargin}
            </p>
          )}
        </div>
      )}

      {phase >= 3 && (
        <p className="text-sm text-muted-foreground mt-4 max-w-md animate-fade-in">
          {topic}
        </p>
      )}
    </div>
  )
}
