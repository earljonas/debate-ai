'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { JudgeVerdict } from '@/types/debate'

interface Props {
  verdict: JudgeVerdict
  topic: string
}

export function JudgeVerdictCard({ verdict, topic }: Props) {
  const winnerLabel = verdict.winner === 'draw'
    ? 'Draw'
    : verdict.winner === 'pro'
    ? 'Pro wins'
    : 'Con wins'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span>{winnerLabel}</span>
          <Badge variant="outline">{verdict.winMargin}</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{topic}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
            Best argument
          </p>
          <p className="text-sm">
            <span className="font-medium capitalize">{verdict.bestArgument.side}: </span>
            {verdict.bestArgument.summary}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
            Key turning point
          </p>
          <p className="text-sm">{verdict.keyTurningPoint}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-emerald-600 uppercase mb-1">Pro strengths</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {verdict.proStrengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-rose-600 uppercase mb-1">Con strengths</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {verdict.conStrengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>
        <div>
           <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
            Judge&apos;s reasoning
          </p>
          <p className="text-sm text-muted-foreground">{verdict.overallReasoning}</p>
        </div>
      </CardContent>
    </Card>
  )
}
