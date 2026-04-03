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

    try {
      const res = await fetch('/api/debate/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debateId: debateData.id, side, round }),
      })

      if (!res.ok) {
        throw new Error('Failed to get response')
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

      const latestArgs = await refetchArgs()

      const latestArg = latestArgs.find(
        (a: Argument) => a.side === side && a.round === round
      )

      if (latestArg) {
        fetch('/api/debate/fallacy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            argumentId: latestArg.id,
            content: latestArg.content,
          }),
        }).then(() => refetchArgs())
      }

      setStreamText('')
      setActiveSide(null)
      runningRef.current = false

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
      setError(err.message || 'Something went wrong')
      setPhase('error')
      runningRef.current = false
    }
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
          <div className="text-center animate-fade-in space-y-4">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={() => router.push('/setup')}
              className="text-sm text-primary hover:underline"
            >
              Start a new debate
            </button>
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
