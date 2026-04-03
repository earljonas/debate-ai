'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { TopicSuggestion } from '@/components/setup/TopicSuggestion'
import { RoundSelector } from '@/components/setup/RoundSelector'

const EXAMPLE_TOPICS = [
  'AI will replace all software engineers',
  'Social media does more harm than good',
  'Remote work is better than office work',
  'Nuclear energy is the future of power',
  'Cryptocurrency will replace traditional currency',
  'Space exploration is a waste of resources',
]

export default function SetupPage() {
  const [topic, setTopic] = useState('')
  const [rounds, setRounds] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function startDebate() {
    if (!topic.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/debate/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, rounds }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to start debate')
      }

      const { debate } = await res.json()
      router.push(`/debate/${debate.id}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center px-6 pt-14">
        <div className="w-full max-w-xl animate-fade-in-up">
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Configure Debate
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Pick a topic and set the number of rounds.
          </p>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-2 block">
                Topic
              </label>
              <textarea
                placeholder="Enter a debate topic..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-3 block">
                Or pick one
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EXAMPLE_TOPICS.map((t) => (
                  <TopicSuggestion
                    key={t}
                    topic={t}
                    selected={topic === t}
                    onClick={() => setTopic(t)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-3 block">
                Rounds
              </label>
              <RoundSelector value={rounds} onChange={setRounds} />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <button
              onClick={startDebate}
              disabled={!topic.trim() || loading}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? 'Starting...' : 'Begin Debate'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
