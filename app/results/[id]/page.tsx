'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { JudgeVerdictCard } from '../../../components/ui/JudgeVerdict'
import { Button } from '@/components/ui/button'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { JudgeVerdict, Debate } from '@/types/debate'

export default function ResultsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [verdict, setVerdict] = useState<JudgeVerdict | null>(null)
  const [debate, setDebate] = useState<Debate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getVerdict() {
      try {
        const { data: debateData } = await supabaseBrowser
          .from('debates')
          .select('*')
          .eq('id', id)
          .single()

        setDebate(debateData)

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
          throw new Error('No verdict received from the judge')
        }
        setVerdict(data.verdict)
      } catch (err: any) {
        console.error('Error fetching verdict:', err)
        setError(err.message || 'Failed to get verdict')
      } finally {
        setLoading(false)
      }
    }

    getVerdict()
  }, [])

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Judge is deliberating...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => { setError(null); setLoading(true); window.location.reload() }}>
            Retry
          </Button>
          <Button variant="outline" onClick={() => router.push('/')}>
            New debate
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      {verdict && debate && (
        <JudgeVerdictCard verdict={verdict} topic={debate.topic} />
      )}
      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={() => router.push('/')}>
          New debate
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/debate/${id}`)}
        >
          View full debate
        </Button>
      </div>
    </div>
  )
}