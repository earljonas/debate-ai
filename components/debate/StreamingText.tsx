'use client'

interface StreamingTextProps {
  text: string
  isStreaming: boolean
  side: 'pro' | 'con'
}

export function StreamingText({ text, isStreaming, side }: StreamingTextProps) {
  if (!text && !isStreaming) return null

  return (
    <div className="relative">
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {text}
        {isStreaming && (
          <span
            className={`inline-block w-[2px] h-[1em] ml-0.5 align-middle animate-blink ${
              side === 'pro' ? 'bg-pro' : 'bg-con'
            }`}
          />
        )}
      </p>
    </div>
  )
}
