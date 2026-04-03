'use client'

interface TopicSuggestionProps {
  topic: string
  selected: boolean
  onClick: () => void
}

export function TopicSuggestion({ topic, selected, onClick }: TopicSuggestionProps) {
  return (
    <button
      onClick={onClick}
      className={`text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 border ${
        selected
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-border bg-card hover:border-primary/20 hover:bg-card/80 text-foreground/70'
      }`}
    >
      {topic}
    </button>
  )
}
