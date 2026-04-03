'use client'

import type { Argument } from '@/types/debate'

interface ScoreBarProps {
  arguments: Argument[]
}

function calcTotal(args: Argument[]): number {
  return args.reduce((sum, a) => {
    return sum + (a.logic_score || 0) + (a.evidence_score || 0)
  }, 0)
}

export function ScoreBar({ arguments: args }: ScoreBarProps) {
  const proArgs = args.filter(a => a.side === 'pro')
  const conArgs = args.filter(a => a.side === 'con')
  const proTotal = calcTotal(proArgs)
  const conTotal = calcTotal(conArgs)
  const maxScore = Math.max(proTotal, conTotal, 1)

  return (
    <div className="flex items-center gap-4 w-full">
      <div className="flex items-center gap-2 min-w-[80px]">
        <span className="text-xs font-bold tracking-wider text-pro">PRO</span>
        <span className="text-sm font-mono font-bold text-pro">{proTotal}</span>
      </div>

      <div className="flex-1 flex gap-1 h-2">
        <div className="flex-1 bg-muted rounded-full overflow-hidden flex justify-end">
          <div
            className="h-full bg-pro/60 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(proTotal / maxScore) * 100}%` }}
          />
        </div>
        <div className="flex-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-con/60 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(conTotal / maxScore) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 min-w-[80px] justify-end">
        <span className="text-sm font-mono font-bold text-con">{conTotal}</span>
        <span className="text-xs font-bold tracking-wider text-con">CON</span>
      </div>
    </div>
  )
}
