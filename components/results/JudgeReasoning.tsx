'use client'

import { useState } from 'react'

interface JudgeReasoningProps {
  keyTurningPoint: string
  overallReasoning: string
}

export function JudgeReasoning({ keyTurningPoint, overallReasoning }: JudgeReasoningProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 animate-fade-in-up">
      <div className="rounded-xl border border-judge/10 bg-judge/5 p-4">
        <p className="text-xs font-bold tracking-wider text-judge mb-2">
          KEY TURNING POINT
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {keyTurningPoint}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <p className="text-xs font-bold tracking-wider text-muted-foreground">
            JUDGE REASONING
          </p>
          <span className="text-xs text-muted-foreground">
            {expanded ? 'Collapse' : 'Expand'}
          </span>
        </button>
        {expanded && (
          <p className="text-sm text-foreground/70 leading-relaxed mt-3 animate-fade-in">
            {overallReasoning}
          </p>
        )}
      </div>
    </div>
  )
}
