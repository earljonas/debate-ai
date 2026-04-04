import { NextRequest, NextResponse } from 'next/server'
import { ai, MODEL } from '@/lib/gemini'
import { supabase } from '@/lib/supabase'
import { getJudgePrompt } from '@/lib/agents'
import { generateMockVerdict, isMockDebateEnabled } from '@/lib/mock-debate'
import { safeParseJSON } from '@/lib/utils'
import type { JudgeVerdict } from '@/types/debate'

export async function POST(req: NextRequest) {
  try {
    const { debateId } = await req.json()

    if (!debateId) {
      return NextResponse.json(
        { error: 'Missing debateId' },
        { status: 400 }
      )
    }

    // Fetch debate + all arguments
    const { data: debate } = await supabase
      .from('debates')
      .select('*')
      .eq('id', debateId)
      .single()

    if (!debate) {
      return NextResponse.json(
        { error: 'Debate not found' },
        { status: 404 }
      )
    }

    const { data: args } = await supabase
      .from('arguments')
      .select('*')
      .eq('debate_id', debateId)
      .order('created_at', { ascending: true })

    if (!args || args.length === 0) {
      return NextResponse.json(
        { error: 'No arguments found for this debate' },
        { status: 400 }
      )
    }

    if (isMockDebateEnabled(req)) {
      const verdict = generateMockVerdict(debate.topic, args)

      await supabase
        .from('debates')
        .update({ status: 'complete' })
        .eq('id', debateId)

      return NextResponse.json({ verdict })
    }

    const prompt = getJudgePrompt(debate.topic, args)

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    })

    const verdict = safeParseJSON<JudgeVerdict>(
      response.text || '{}'
    )

    if (!verdict) {
      return NextResponse.json(
        { error: 'Failed to parse judge verdict' },
        { status: 500 }
      )
    }

    // Mark debate as complete
    await supabase
      .from('debates')
      .update({ status: 'complete' })
      .eq('id', debateId)

    return NextResponse.json({ verdict })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    console.error('Error in /api/debate/judge:', error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
