'use client'

import type { Argument } from '@/types/debate'
import { FallacyBadge } from './FallacyBadge'

interface ArgumentCardProps {
  argument: Argument
  animationDelay?: number
}

export function ArgumentCard({ argument, animationDelay = 0 }: ArgumentCardProps) {
  const isPro = argument.side === 'pro'

  return (
    <div
      className={`rounded-xl p-4 text-sm leading-relaxed border animate-fade-in-up ${
        isPro
          ? 'border-pro/10 gradient-pro'
          : 'border-con/10 gradient-con'
      }`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <p className="text-foreground/90">{argument.content}</p>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {argument.logic_score !== null && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-md animate-pop-in ${
              isPro ? 'bg-pro/10 text-pro' : 'bg-con/10 text-con'
            }`}
          >
            Logic {argument.logic_score}/10
          </span>
        )}
        {argument.evidence_score !== null && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-md animate-pop-in ${
              isPro ? 'bg-pro/10 text-pro' : 'bg-con/10 text-con'
            }`}
          >
            Evidence {argument.evidence_score}/10
          </span>
        )}
        {argument.fallacy && (
          <FallacyBadge
            fallacy={argument.fallacy}
            severity={argument.fallacy_severity}
          />
        )}
      </div>
    </div>
  )
}
