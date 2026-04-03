'use client'

interface RoundSelectorProps {
  value: number
  onChange: (n: number) => void
}

const ROUND_OPTIONS = [
  { value: 2, label: 'Quick' },
  { value: 3, label: 'Standard' },
  { value: 4, label: 'Deep' },
]

export function RoundSelector({ value, onChange }: RoundSelectorProps) {
  return (
    <div className="flex gap-3">
      {ROUND_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex flex-col items-center gap-1 px-5 py-3 rounded-xl border text-sm transition-all duration-200 ${
            value === opt.value
              ? 'border-primary/40 bg-primary/10'
              : 'border-border bg-card hover:border-primary/20'
          }`}
        >
          <span
            className={`text-lg font-mono font-bold ${
              value === opt.value ? 'text-primary' : 'text-foreground'
            }`}
          >
            {opt.value}
          </span>
          <span
            className={`text-xs ${
              value === opt.value ? 'text-primary/70' : 'text-muted-foreground'
            }`}
          >
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  )
}
