'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { AgentColumn } from '@/components/debate/AgentColumn'
import { ArenaLayout } from '@/components/debate/ArenaLayout'
import { RoundProgress } from '@/components/debate/RoundProgress'
import { ScoreBar } from '@/components/debate/ScoreBar'
import { RoundTransition } from '@/components/debate/RoundTransition'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { Argument, Debate } from '@/types/debate'

type Phase = 'loading' | 'preparing' | 'debating' | 'review' | 'judging' | 'error'

const PRE_TURN_DELAY_MS = 900
const BETWEEN_SIDES_DELAY_MS = 1400
const POST_TURN_READING_DELAY_MS = 1000
const ROUTE_TO_RESULTS_DELAY_MS = 2200
const STREAM_CHARACTER_DELAY_MS = 14

export default function DebatePage() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [debate, setDebate] = useState<Debate | null>(null)
  const [args, setArgs] = useState<Argument[]>([])
  const [activeSide, setActiveSide] = useState<'pro' | 'con' | null>(null)
  const [streamText, setStreamText] = useState('')
  const [currentRound, setCurrentRound] = useState(1)
  const [phase, setPhase] = useState<Phase>('loading')
  const [showRoundTransition, setShowRoundTransition] = useState(false)
  const [transitionRound, setTransitionRound] = useState(1)
  const [turnStatus, setTurnStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const runningRef = useRef(false)
  const failedTurnRef = useRef<{ round: number; side: 'pro' | 'con' } | null>(null)
  const isReviewRequest = searchParams.get('view') === 'review'

  const refetchArgs = useCallback(async () => {
    const { data } = await supabaseBrowser
      .from('arguments')
      .select('*')
      .eq('debate_id', id)
      .order('round', { ascending: true })
      .order('created_at', { ascending: true })

    if (data) {
      setArgs(data)
    }

    return data || []
  }, [id])

  const runTurn = useCallback(async (
    debateData: Debate,
    round: number,
    side: 'pro' | 'con'
  ) => {
    if (runningRef.current) return

    runningRef.current = true
    setActiveSide(side)
    setStreamText('')
    setPhase('preparing')
    setTurnStatus(`${side === 'pro' ? 'Pro' : 'Con'} is preparing a round ${round} response`)
    setError(null)

    try {
      const res = await fetch('/api/debate/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debateId: debateData.id, side, round }),
      })

      if (!res.ok) {
        let errorMsg = 'Failed to get response'
        try {
          const errData = await res.json()
          errorMsg = errData.error || errorMsg
        } catch {}
        throw new Error(errorMsg)
      }

      await wait(PRE_TURN_DELAY_MS)
      setPhase('debating')
      setTurnStatus(`${side === 'pro' ? 'Pro' : 'Con'} is making the case`)

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        for (const char of chunk) {
          full += char
          setStreamText(full)
          await wait(STREAM_CHARACTER_DELAY_MS)
        }
      }

      if (!full || full.trim().length < 10) {
        failedTurnRef.current = { round, side }
        throw new Error(
          'AI failed to generate a response. This is usually caused by API rate limits. Wait a moment and retry.'
        )
      }

      const latestArgs = await refetchArgs()

      const latestArg = latestArgs.find(
        (argument) => argument.side === side && argument.round === round
      )

      if (!latestArg) {
        await wait(2000)
        const retryArgs = await refetchArgs()
        const retryArg = retryArgs.find(
          (argument) => argument.side === side && argument.round === round
        )

        if (!retryArg) {
          failedTurnRef.current = { round, side }
          throw new Error(
            'Response was generated but not saved. This may be a temporary issue. Try again.'
          )
        }
      }

      const savedArg = latestArg || (await refetchArgs()).find(
        (argument) => argument.side === side && argument.round === round
      )

      if (savedArg) {
        fetch('/api/debate/fallacy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            argumentId: savedArg.id,
            content: savedArg.content,
          }),
        }).then(() => refetchArgs())
      }

      setTurnStatus('Letting the argument land before the next response')
      await wait(POST_TURN_READING_DELAY_MS)

      setStreamText('')
      setActiveSide(null)
      runningRef.current = false
      failedTurnRef.current = null

      if (side === 'pro') {
        setTurnStatus('Con is preparing a rebuttal')
        setTimeout(() => runTurn(debateData, round, 'con'), BETWEEN_SIDES_DELAY_MS)
      } else if (round < debateData.rounds) {
        const nextRound = round + 1
        setTransitionRound(nextRound)
        setCurrentRound(nextRound)
        setTurnStatus(`Round ${nextRound} is about to begin`)
        setShowRoundTransition(true)
      } else {
        setPhase('judging')
        setTurnStatus('Judge is weighing both sides')
        setTimeout(() => {
          router.push(`/results/${id}`)
        }, ROUTE_TO_RESULTS_DELAY_MS)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setStreamText('')
      setActiveSide(null)
      setTurnStatus('')
      setError(message)
      setPhase('error')
      runningRef.current = false
    }
  }, [id, refetchArgs, router])

  const retryFailedTurn = useCallback(() => {
    if (!debate || !failedTurnRef.current) return
    const { round, side } = failedTurnRef.current
    runTurn(debate, round, side)
  }, [debate, runTurn])

  const handleRoundTransitionComplete = useCallback(() => {
    setShowRoundTransition(false)
    if (debate) {
      runTurn(debate, transitionRound, 'pro')
    }
  }, [debate, runTurn, transitionRound])

  useEffect(() => {
    let cancelled = false

    async function loadDebate() {
      const { data } = await supabaseBrowser
        .from('debates')
        .select('*')
        .eq('id', id)
        .single()

      if (cancelled) return

      if (!data) {
        setPhase('error')
        setError('Debate not found')
        return
      }

      setDebate(data)

      const shouldReview = data.status === 'complete' || isReviewRequest
      if (shouldReview) {
        setCurrentRound(data.rounds)
        setPhase('review')
        setTurnStatus('Reviewing the completed debate transcript')
        await refetchArgs()
        return
      }

      setPhase('preparing')
      setTurnStatus('Opening statements are about to begin')
      runTurn(data, 1, 'pro')
    }

    loadDebate()

    return () => {
      cancelled = true
    }
  }, [id, isReviewRequest, refetchArgs, runTurn])

  const proArgs = args.filter((argument) => argument.side === 'pro')
  const conArgs = args.filter((argument) => argument.side === 'con')

  if (phase === 'loading') {
    return (
      <>
        <Header showNewDebate />
        <div className="min-h-screen flex items-center justify-center pt-14">
          <div className="text-center animate-fade-in">
            <p className="text-sm text-muted-foreground">Loading debate...</p>
          </div>
        </div>
      </>
    )
  }

  if (phase === 'error') {
    return (
      <>
        <Header showNewDebate />
        <div className="min-h-screen flex items-center justify-center pt-14">
          <div className="text-center animate-fade-in space-y-4 max-w-md px-6">
            <p className="text-sm text-destructive">{error}</p>
            <div className="flex items-center justify-center gap-3">
              {failedTurnRef.current && (
                <button
                  onClick={retryFailedTurn}
                  className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-all"
                >
                  Retry
                </button>
              )}
              <button
                onClick={() => router.push('/setup')}
                className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-card transition-colors"
              >
                New Debate
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header showNewDebate />
      <div className="h-screen flex flex-col pt-14">
        <div className="px-6 py-4 flex items-center justify-between border-b border-border">
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-medium text-foreground truncate">
              {debate?.topic}
            </h1>
            {turnStatus && (
              <p className="mt-1 text-xs text-muted-foreground">
                {turnStatus}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 ml-4">
            {phase === 'review' && (
              <button
                onClick={() => router.push(`/results/${id}`)}
                className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-card transition-colors"
              >
                Back to Verdict
              </button>
            )}
            <RoundProgress
              currentRound={currentRound}
              totalRounds={debate?.rounds || 3}
              activeSide={activeSide}
            />
          </div>
        </div>

        <ArenaLayout
          activeSide={activeSide}
          proColumn={
            <AgentColumn
              side="pro"
              arguments={proArgs}
              isActive={activeSide === 'pro'}
              isThinking={activeSide === 'pro' || phase === 'preparing'}
              streamingText={activeSide === 'pro' ? streamText : ''}
            />
          }
          conColumn={
            <AgentColumn
              side="con"
              arguments={conArgs}
              isActive={activeSide === 'con'}
              isThinking={activeSide === 'con' || phase === 'preparing'}
              streamingText={activeSide === 'con' ? streamText : ''}
            />
          }
        />

        <div className="px-6 py-3 border-t border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <ScoreBar arguments={args} />
            {phase === 'review' && (
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                Read-only transcript mode
              </p>
            )}
          </div>
        </div>

        {phase === 'judging' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm animate-fade-in">
            <div className="text-center animate-scale-in">
              <div className="w-16 h-16 rounded-2xl bg-judge/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-judge animate-pulse-judge">J</span>
              </div>
              <p className="text-sm font-semibold text-foreground mb-2">
                The judge is deliberating
              </p>
              <p className="text-xs text-muted-foreground">
                Analyzing argument quality and evidence...
              </p>
            </div>
          </div>
        )}

        <RoundTransition
          round={transitionRound}
          visible={showRoundTransition}
          onComplete={handleRoundTransitionComplete}
        />
      </div>
    </>
  )
}

function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration))
}
