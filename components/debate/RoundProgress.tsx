'use client'

interface RoundProgressProps {
  currentRound: number
  totalRounds: number
  activeSide: 'pro' | 'con' | null
}

export function RoundProgress({ currentRound, totalRounds, activeSide }: RoundProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalRounds }, (_, i) => {
        const round = i + 1
        const isComplete = round < currentRound
        const isCurrent = round === currentRound

        return (
          <div key={round} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 ${
                isComplete
                  ? 'bg-primary/20 text-primary'
                  : isCurrent
                  ? activeSide === 'pro'
                    ? 'bg-pro/20 text-pro ring-2 ring-pro/30'
                    : activeSide === 'con'
                    ? 'bg-con/20 text-con ring-2 ring-con/30'
                    : 'bg-primary/20 text-primary ring-2 ring-primary/30'
                  : 'bg-muted text-muted-foreground/40'
              }`}
            >
              {round}
            </div>
            {round < totalRounds && (
              <div
                className={`w-6 h-px transition-colors duration-300 ${
                  isComplete ? 'bg-primary/30' : 'bg-muted-foreground/10'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
