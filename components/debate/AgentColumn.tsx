'use client'

import type { Argument, Side } from '@/types/debate'
import { ArgumentCard } from './ArgumentCard'
import { StreamingText } from './StreamingText'
import { ThinkingIndicator } from './ThinkingIndicator'

interface AgentColumnProps {
  side: Side
  arguments: Argument[]
  isActive: boolean
  isThinking: boolean
  streamingText: string
}

export function AgentColumn({
  side,
  arguments: args,
  isActive,
  isThinking,
  streamingText,
}: AgentColumnProps) {
  const isPro = side === 'pro'

  return (
    <div
      className={`flex flex-col h-full transition-opacity duration-300 ${
        !isActive && isThinking ? 'opacity-100' : ''
      }`}
    >
      <div
        className={`flex items-center gap-3 pb-3 mb-4 border-b ${
          isPro ? 'border-pro/20' : 'border-con/20'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isPro ? 'bg-pro' : 'bg-con'
          } ${isActive ? (isPro ? 'animate-pulse-pro' : 'animate-pulse-con') : ''}`}
        />
        <span
          className={`text-xs font-bold tracking-widest ${
            isPro ? 'text-pro' : 'text-con'
          }`}
        >
          {isPro ? 'PRO' : 'CON'}
        </span>
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
        {args.map((arg, i) => (
          <ArgumentCard key={arg.id} argument={arg} animationDelay={i * 100} />
        ))}

        {isActive && (
          <div
            className={`rounded-xl p-4 border border-dashed ${
              isPro ? 'border-pro/20' : 'border-con/20'
            } ${isPro ? 'gradient-pro' : 'gradient-con'}`}
          >
            {streamingText ? (
              <StreamingText
                text={streamingText}
                isStreaming={true}
                side={side}
              />
            ) : (
              <ThinkingIndicator side={side} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
