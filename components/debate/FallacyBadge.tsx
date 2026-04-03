'use client'

interface FallacyBadgeProps {
  fallacy: string
  severity: 'minor' | 'major' | null
}

export function FallacyBadge({ fallacy, severity }: FallacyBadgeProps) {
  const isMajor = severity === 'major'

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md animate-slide-in-right ${
        isMajor
          ? 'bg-destructive/15 text-destructive'
          : 'bg-judge/10 text-judge'
      }`}
    >
      {isMajor && (
        <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
      )}
      {fallacy}
    </span>
  )
}
