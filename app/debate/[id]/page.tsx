'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { AgentColumn } from '@/components/debate/AgentColumn'
import { ArenaLayout } from '@/components/debate/ArenaLayout'
import { RoundProgress } from '@/components/debate/RoundProgress'
import { ScoreBar } from '@/components/debate/ScoreBar'
import { RoundTransition } from '@/components/debate/RoundTransition'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { Argument, Debate } from '@/types/debate'

type Phase = 'loading' | 'debating' | 'judging' | 'error'

export default function DebatePage() {
  const { id } = useParams()
  const router = useRouter()
  const [debate, setDebate] = useState<Debate | null>(null)
  const [args, setArgs] = useState<Argument[]>([])
  const [activeSide, setActiveSide] = useState<'pro' | 'con' | null>(null)
  const [streamText, setStreamText] = useState('')
  const [currentRound, setCurrentRound] = useState(1)
  const [phase, setPhase] = useState<Phase>('loading')
  const [showRoundTransition, setShowRoundTransition] = useState(false)
  const [transitionRound, setTransitionRound] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const runningRef = useRef(false)
  const failedTurnRef = useRef<{ round: number; side: 'pro' | 'con' } | null>(null)

  const refetchArgs = useCallback(async () => {
    const { data } = await supabaseBrowser
      .from('arguments')
      .select('*')
      .eq('debate_id', id)
      .order('created_at', { ascending: true })
    if (data) setArgs(data)
    return data || []
  }, [id])

  async function runTurn(
    debateData: Debate,
    round: number,
    side: 'pro' | 'con'
  ) {
    if (runningRef.current) return
    runningRef.current = true
    setActiveSide(side)
    setStreamText('')
    setPhase('debating')
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

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value)
        setStreamText(full)
      }

      if (!full || full.trim().length < 10) {
        failedTurnRef.current = { round, side }
        throw new Error(
          'AI failed to generate a response. This is usually caused by API rate limits. Wait a moment and retry.'
        )
      }

      const latestArgs = await refetchArgs()

      const latestArg = latestArgs.find(
        (a: Argument) => a.side === side && a.round === round
      )

      if (!latestArg) {
        await new Promise(r => setTimeout(r, 2000))
        const retryArgs = await refetchArgs()
        const retryArg = retryArgs.find(
          (a: Argument) => a.side === side && a.round === round
        )
        if (!retryArg) {
          failedTurnRef.current = { round, side }
          throw new Error(
            'Response was generated but not saved. This may be a temporary issue. Try again.'
          )
        }
      }

      const savedArg = latestArg || (await refetchArgs()).find(
        (a: Argument) => a.side === side && a.round === round
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

      setStreamText('')
      setActiveSide(null)
      runningRef.current = false
      failedTurnRef.current = null

      if (side === 'pro') {
        setTimeout(() => runTurn(debateData, round, 'con'), 800)
      } else if (round < debateData.rounds) {
        const nextRound = round + 1
        setTransitionRound(nextRound)
        setShowRoundTransition(true)
        setCurrentRound(nextRound)
      } else {
        setPhase('judging')
        setTimeout(() => {
          router.push(`/results/${id}`)
        }, 2000)
      }
    } catch (err: any) {
      setStreamText('')
      setActiveSide(null)
      setError(err.message || 'Something went wrong')
      setPhase('error')
      runningRef.current = false
    }
  }

  function retryFailedTurn() {
    if (!debate || !failedTurnRef.current) return
    const { round, side } = failedTurnRef.current
    runTurn(debate, round, side)
  }

  const handleRoundTransitionComplete = useCallback(() => {
    setShowRoundTransition(false)
    if (debate) {
      runTurn(debate, transitionRound, 'pro')
    }
  }, [debate, transitionRound])

  useEffect(() => {
    supabaseBrowser
      .from('debates')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDebate(data)
          setPhase('debating')
          runTurn(data, 1, 'pro')
        } else {
          setPhase('error')
          setError('Debate not found')
        }
      })
  }, [])

  const proArgs = args.filter((a) => a.side === 'pro')
  const conArgs = args.filter((a) => a.side === 'con')

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
          </div>
          <div className="flex items-center gap-6 ml-4">
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
              isThinking={activeSide === 'pro'}
              streamingText={activeSide === 'pro' ? streamText : ''}
            />
          }
          conColumn={
            <AgentColumn
              side="con"
              arguments={conArgs}
              isActive={activeSide === 'con'}
              isThinking={activeSide === 'con'}
              streamingText={activeSide === 'con' ? streamText : ''}
            />
          }
        />

        <div className="px-6 py-3 border-t border-border">
          <ScoreBar arguments={args} />
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
