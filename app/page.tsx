'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const EXAMPLE_TOPICS = [
  'AI will replace all software engineers',
  'Social media does more harm than good',
  'Remote work is better than office work',
  'Nuclear energy is the future of power',
]

export default function Home() {
  const [topic, setTopic] = useState('')
  const [rounds, setRounds] = useState(3)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function startDebate() {
    if (!topic.trim()) return
    setLoading(true)

    const res = await fetch('/api/debate/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, rounds }),
    })

    const { debate } = await res.json()
    router.push(`/debate/${debate.id}`)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold mb-2">AI Debate Arena</h1>
      <p className="text-muted-foreground mb-8">
        Two AI agents argue any topic. Watch, judge, or join.
      </p>

      <Textarea
        placeholder="Type a debate topic..."
        value={topic}
        onChange={e => setTopic(e.target.value)}
        className="mb-4 resize-none"
        rows={3}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {EXAMPLE_TOPICS.map(t => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              topic === t
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:bg-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-muted-foreground">Rounds:</span>
        {[2, 3, 4].map(n => (
          <button
            key={n}
            onClick={() => setRounds(n)}
            className={`w-8 h-8 rounded-full text-sm border transition-colors ${
              rounds === n
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:bg-muted'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <Button
        onClick={startDebate}
        disabled={!topic.trim() || loading}
        className="w-full"
        size="lg"
      >
        {loading ? 'Starting...' : 'Start debate'}
      </Button>
    </div>
  )
}