'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { VerdictReveal } from '@/components/results/VerdictReveal'
import { ScoreComparison } from '@/components/results/ScoreComparison'
import { StrengthsPanel } from '@/components/results/StrengthsPanel'
import { BestArgument } from '@/components/results/BestArgument'
import { JudgeReasoning } from '@/components/results/JudgeReasoning'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { JudgeVerdict, Debate, Argument } from '@/types/debate'

export default function ResultsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [verdict, setVerdict] = useState<JudgeVerdict | null>(null)
  const [debate, setDebate] = useState<Debate | null>(null)
  const [args, setArgs] = useState<Argument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    async function fetchVerdict() {
      try {
        const { data: debateData } = await supabaseBrowser
          .from('debates')
          .select('*')
          .eq('id', id)
          .single()

        setDebate(debateData)

        const { data: argsData } = await supabaseBrowser
          .from('arguments')
          .select('*')
          .eq('debate_id', id)
          .order('created_at', { ascending: true })

        setArgs(argsData || [])

        const res = await fetch('/api/debate/judge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ debateId: id }),
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || `Server error: ${res.status}`)
        }

        const data = await res.json()
        if (!data.verdict) {
          throw new Error('No verdict received')
        }
        setVerdict(data.verdict)

        setTimeout(() => setShowDetails(true), 2500)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to get verdict'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchVerdict()
  }, [id])

  if (loading) {
    return (
      <>
        <Header showNewDebate />
        <div className="min-h-screen flex items-center justify-center pt-14">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-judge/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-judge animate-pulse-judge">J</span>
            </div>
            <p className="text-sm font-semibold text-foreground mb-2">
              The judge is deliberating
            </p>
            <p className="text-xs text-muted-foreground">
              Analyzing arguments and weighing evidence...
            </p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header showNewDebate />
        <div className="min-h-screen flex items-center justify-center pt-14">
          <div className="text-center animate-fade-in space-y-4">
            <p className="text-sm text-destructive">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setError(null)
                  setLoading(true)
                  window.location.reload()
                }}
                className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-card transition-colors"
              >
                Retry
              </button>
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
      <div className="min-h-screen pt-14 px-6 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {verdict && debate && (
            <>
              <VerdictReveal verdict={verdict} topic={debate.topic} />

              {showDetails && (
                <div className="space-y-6">
                  {args.length > 0 && <ScoreComparison arguments={args} />}

                  <StrengthsPanel
                    proStrengths={verdict.proStrengths}
                    conStrengths={verdict.conStrengths}
                  />

                  <BestArgument bestArgument={verdict.bestArgument} />

                  <JudgeReasoning
                    keyTurningPoint={verdict.keyTurningPoint}
                    overallReasoning={verdict.overallReasoning}
                  />

                  <div className="flex gap-3 justify-center pt-4 animate-fade-in-up">
                    <button
                      onClick={() => router.push('/setup')}
                      className="text-sm px-5 py-2.5 rounded-xl border border-border hover:bg-card transition-colors"
                    >
                      New Debate
                    </button>
                    <button
                      onClick={() => router.push(`/debate/${id}?view=review`)}
                      className="text-sm px-5 py-2.5 rounded-xl border border-border hover:bg-card transition-colors"
                    >
                      Review Debate
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
