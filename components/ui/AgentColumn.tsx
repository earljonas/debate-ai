'use client'
import { ArgumentBubble } from './ArgumentBubble'
import type { Argument, Side } from '@/types/debate'

interface Props {
  side: Side
  arguments: Argument[]
  isThinking: boolean
  streamingText: string
}

export function AgentColumn({
  side, arguments: args, isThinking, streamingText
}: Props) {
  const isPro = side === 'pro'

  return (
    <div className="flex flex-col gap-3">
      <div className={`flex items-center gap-2 pb-2 border-b ${
        isPro ? 'border-emerald-200' : 'border-rose-200'
      }`}>
        <span className={`font-semibold text-sm ${
          isPro ? 'text-emerald-700' : 'text-rose-700'
        }`}>
          {isPro ? 'PRO' : 'CON'}
        </span>
      </div>

      {args.map(arg => (
        <ArgumentBubble key={arg.id} argument={arg} />
      ))}

      {isThinking && (
        <div className={`rounded-xl p-3 text-sm border-2 border-dashed ${
          isPro ? 'border-emerald-200' : 'border-rose-200'
        }`}>
          {streamingText || (
            <span className="text-muted-foreground italic">
              Thinking...
            </span>
          )}
          {streamingText && (
            <span className="animate-pulse">|</span>
          )}
        </div>
      )}
    </div>
  )
}