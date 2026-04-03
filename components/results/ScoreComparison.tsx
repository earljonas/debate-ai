'use client'

import type { Argument } from '@/types/debate'

interface ScoreComparisonProps {
  arguments: Argument[]
}

function calcTotal(args: Argument[]): { logic: number; evidence: number; total: number } {
  const logic = args.reduce((s, a) => s + (a.logic_score || 0), 0)
  const evidence = args.reduce((s, a) => s + (a.evidence_score || 0), 0)
  return { logic, evidence, total: logic + evidence }
}

export function ScoreComparison({ arguments: args }: ScoreComparisonProps) {
  const proArgs = args.filter(a => a.side === 'pro')
  const conArgs = args.filter(a => a.side === 'con')
  const pro = calcTotal(proArgs)
  const con = calcTotal(conArgs)
  const maxTotal = Math.max(pro.total, con.total, 1)

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 animate-fade-in-up">
      <div className="flex items-end justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold tracking-wider text-pro">PRO</span>
            <span className="text-lg font-mono font-black text-pro">{pro.total}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-pro/70 rounded-full animate-score-bar"
              style={{ width: `${(pro.total / maxTotal) * 100}%` }}
            />
          </div>
          <div className="flex gap-4 mt-1.5">
            <span className="text-xs text-muted-foreground font-mono">
              Logic {pro.logic}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Evidence {pro.evidence}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold tracking-wider text-con">CON</span>
            <span className="text-lg font-mono font-black text-con">{con.total}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-con/70 rounded-full animate-score-bar"
              style={{ width: `${(con.total / maxTotal) * 100}%` }}
            />
          </div>
          <div className="flex gap-4 mt-1.5">
            <span className="text-xs text-muted-foreground font-mono">
              Logic {con.logic}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Evidence {con.evidence}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
