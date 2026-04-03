'use client'

interface StrengthsPanelProps {
  proStrengths: string[]
  conStrengths: string[]
}

export function StrengthsPanel({ proStrengths, conStrengths }: StrengthsPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-lg mx-auto animate-fade-in-up">
      <div className="rounded-xl border border-pro/10 gradient-pro p-4">
        <p className="text-xs font-bold tracking-wider text-pro mb-3">PRO STRENGTHS</p>
        <ul className="space-y-2">
          {proStrengths.map((s, i) => (
            <li key={i} className="text-sm text-foreground/70 leading-relaxed">
              {s}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-con/10 gradient-con p-4">
        <p className="text-xs font-bold tracking-wider text-con mb-3">CON STRENGTHS</p>
        <ul className="space-y-2">
          {conStrengths.map((s, i) => (
            <li key={i} className="text-sm text-foreground/70 leading-relaxed">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
