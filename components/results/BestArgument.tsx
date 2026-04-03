'use client'

import type { JudgeVerdict } from '@/types/debate'

interface BestArgumentProps {
  bestArgument: JudgeVerdict['bestArgument']
}

export function BestArgument({ bestArgument }: BestArgumentProps) {
  const isPro = bestArgument.side === 'pro'

  return (
    <div
      className={`w-full max-w-lg mx-auto rounded-xl border p-4 animate-fade-in-up ${
        isPro ? 'border-pro/10 gradient-pro' : 'border-con/10 gradient-con'
      }`}
    >
      <p className="text-xs font-bold tracking-wider text-muted-foreground mb-2">
        BEST ARGUMENT
      </p>
      <p className={`text-xs font-bold tracking-wider mb-2 ${isPro ? 'text-pro' : 'text-con'}`}>
        {isPro ? 'PRO' : 'CON'}
      </p>
      <p className="text-sm text-foreground/80 leading-relaxed">
        {bestArgument.summary}
      </p>
    </div>
  )
}
