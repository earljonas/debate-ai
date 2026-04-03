'use client'
import { Badge } from '@/components/ui/badge'
import type { Argument } from '@/types/debate'

interface Props {
  argument: Argument
}

export function ArgumentBubble({ argument }: Props) {
  const isPro = argument.side === 'pro'

  return (
    <div className={`rounded-xl p-3 text-sm leading-relaxed ${
      isPro
        ? 'bg-emerald-50 text-emerald-900'
        : 'bg-rose-50 text-rose-900'
    }`}>
      <p>{argument.content}</p>

      <div className="flex flex-wrap gap-1 mt-2">
        {argument.logic_score !== null && (
          <Badge variant="outline" className="text-xs">
            Logic {argument.logic_score}/10
          </Badge>
        )}
        {argument.evidence_score !== null && (
          <Badge variant="outline" className="text-xs">
            Evidence {argument.evidence_score}/10
          </Badge>
        )}
        {argument.fallacy && (
          <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200">
            {argument.fallacy_severity === 'major' ? '⚠ ' : ''}
            {argument.fallacy}
          </Badge>
        )}
      </div>
    </div>
  )
}