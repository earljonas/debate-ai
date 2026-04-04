import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
})
import { supabase } from '@/lib/supabase'
import { getDebaterPrompt, buildMessages } from '@/lib/agents'
import {
  generateMockArgument,
  isMockDebateEnabled,
} from '@/lib/mock-debate'
import type { Side } from '@/types/debate'
import type { ModelMessage } from 'ai'

export async function POST(req: NextRequest) {
  try {
    const { debateId, side, round } = await req.json()

    if (!debateId || !side || !round) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: debateId, side, round' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fetch debate + full argument history
    const { data: debate } = await supabase
      .from('debates')
      .select('*')
      .eq('id', debateId)
      .single()

    if (!debate) {
      return new Response(
        JSON.stringify({ error: 'Debate not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { data: history } = await supabase
      .from('arguments')
      .select('*')
      .eq('debate_id', debateId)
      .order('created_at', { ascending: true })

    const systemPrompt = getDebaterPrompt(debate.topic, side as Side)
    const messages = buildMessages(systemPrompt, history || []) as ModelMessage[]

    if (isMockDebateEnabled(req)) {
      const text = generateMockArgument({
        topic: debate.topic,
        side: side as Side,
        round,
        history: history || [],
      })

      return createMockStreamResponse(text, async () => {
        await supabase.from('arguments').insert({
          debate_id: debateId,
          side,
          content: text,
          round,
          logic_score: null,
          evidence_score: null,
          fallacy: null,
        })
      })
    }

    // Stream the response
    const result = streamText({
      model: google('gemini-2.0-flash'),
      messages,
      onFinish: async ({ text }) => {
        // Save completed argument to DB when streaming finishes
        await supabase.from('arguments').insert({
          debate_id: debateId,
          side,
          content: text,
          round,
          logic_score: null,
          evidence_score: null,
          fallacy: null,
        })
      },
    })

    return result.toTextStreamResponse()
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    console.error('Error in /api/debate/turn:', error)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

function createMockStreamResponse(text: string, onFinish: () => Promise<void>) {
  const encoder = new TextEncoder()
  const chunks = text.match(/.{1,24}(\s|$)|\S+/g) || [text]

  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
        await new Promise((resolve) => setTimeout(resolve, 35))
      }

      await onFinish()
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
