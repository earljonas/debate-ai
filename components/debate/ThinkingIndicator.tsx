'use client'

interface ThinkingIndicatorProps {
  side: 'pro' | 'con'
}

export function ThinkingIndicator({ side }: ThinkingIndicatorProps) {
  const dotColor = side === 'pro' ? 'bg-pro' : 'bg-con'

  return (
    <div className="flex items-center gap-1.5 py-2 px-1">
      <span className={`w-2 h-2 rounded-full ${dotColor} animate-thinking-dot-1`} />
      <span className={`w-2 h-2 rounded-full ${dotColor} animate-thinking-dot-2`} />
      <span className={`w-2 h-2 rounded-full ${dotColor} animate-thinking-dot-3`} />
    </div>
  )
}
