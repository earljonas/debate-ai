'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AgentColumn } from '../../../components/ui/AgentColumn'
import { Button } from '@/components/ui/button'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { Argument, Debate } from '@/types/debate'

export default function DebatePage() {
  const { id } = useParams()
  const router = useRouter()
  const [debate, setDebate] = useState<Debate | null>(null)
  const [args, setArgs] = useState<Argument[]>([])
  const [activeSide, setActiveSide] = useState<'pro' | 'con' | null>(null)
  const [streamText, setStreamText] = useState('')
  const [round, setRound] = useState(1)
  const [done, setDone] = useState(false)
  const runningRef = useRef(false)

  async function runRound(
    debate: Debate,
    history: Argument[],
    round: number,
    side: 'pro' | 'con'
  ) {
    if (runningRef.current) return
    runningRef.current = true
    setActiveSide(side)
    setStreamText('')

    const res = await fetch('/api/debate/turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ debateId: debate.id, side, round }),
    })

    // Read the stream
    const reader = res.body?.getReader()
    const decoder = new TextDecoder()
    let full = ''

    while (reader) {
      const { done: streamDone, value } = await reader.read()
      if (streamDone) break
      const chunk = decoder.decode(value)
      // Vercel AI SDK sends data: prefix — extract text
      full += chunk
      setStreamText(full)
    }

    // Refetch args from DB (includes scores after fallacy call)
    const { data: newArgs } = await supabaseBrowser
      .from('arguments')
      .select('*')
      .eq('debate_id', debate.id)
      .order('created_at', { ascending: true })

    const latestArg = newArgs?.find(
      a => a.side === side && a.round === round
    )

    // Trigger fallacy + scoring
    if (latestArg) {
      await fetch('/api/debate/fallacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          argumentId: latestArg.id,
          content: latestArg.content
        }),
      })
    }

    // Refetch with scores
    const { data: scoredArgs } = await supabaseBrowser
      .from('arguments')
      .select('*')
      .eq('debate_id', debate.id)
      .order('created_at', { ascending: true })

    setArgs(scoredArgs || [])
    setStreamText('')
    setActiveSide(null)
    runningRef.current = false

    // Decide what's next
    if (side === 'pro') {
      setTimeout(() => runRound(debate, scoredArgs || [], round, 'con'), 800)
    } else if (round < debate.rounds) {
      setTimeout(() => runRound(debate, scoredArgs || [], round + 1, 'pro'), 800)
      setRound(r => r + 1)
    } else {
      setDone(true)
    }
  }

  useEffect(() => {
    supabaseBrowser
      .from('debates')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setDebate(data)
        if (data) runRound(data, [], 1, 'pro')
      })
  }, [])

  const proArgs = args.filter(a => a.side === 'pro')
  const conArgs = args.filter(a => a.side === 'con')

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-medium text-sm text-muted-foreground">
          {debate?.topic}
        </h2>
        <span className="text-sm text-muted-foreground">
          Round {round} of {debate?.rounds}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <AgentColumn
          side="pro"
          arguments={proArgs}
          isThinking={activeSide === 'pro'}
          streamingText={activeSide === 'pro' ? streamText : ''}
        />
        <AgentColumn
          side="con"
          arguments={conArgs}
          isThinking={activeSide === 'con'}
          streamingText={activeSide === 'con' ? streamText : ''}
        />
      </div>

      {done && (
        <div className="mt-8 text-center">
          <Button
            size="lg"
            onClick={() => router.push(`/results/${id}`)}
          >
            See verdict
          </Button>
        </div>
      )}
    </div>
  )
}
