import { NextRequest, NextResponse } from 'next/server'
import { ai, MODEL } from '@/lib/gemini'
import { supabase } from '@/lib/supabase'
import { getFallacyPrompt, getScoringPrompt } from '@/lib/agents'
import { safeParseJSON } from '@/lib/utils'
import type { FallacyResult, ScoreResult } from '@/types/debate'

export async function POST(req: NextRequest) {
  try {
    const { argumentId, content } = await req.json()

    if (!argumentId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: argumentId, content' },
        { status: 400 }
      )
    }

    // Run fallacy detection and scoring in parallel
    const [fallacyRes, scoreRes] = await Promise.all([
      ai.models.generateContent({
        model: MODEL,
        contents: getFallacyPrompt(content),
        config: {
          responseMimeType: 'application/json',
        },
      }),
      ai.models.generateContent({
        model: MODEL,
        contents: getScoringPrompt(content),
        config: {
          responseMimeType: 'application/json',
        },
      }),
    ])

    const fallacy = safeParseJSON<FallacyResult>(
      fallacyRes.text || '{}'
    )
    const score = safeParseJSON<ScoreResult>(
      scoreRes.text || '{}'
    )

    // Update the argument row with scores + fallacy
    await supabase
      .from('arguments')
      .update({
        logic_score: score?.logic_score ?? null,
        evidence_score: score?.evidence_score ?? null,
        fallacy: fallacy?.hasFallacy ? fallacy.fallacyName : null,
        fallacy_severity: fallacy?.severity ?? null,
      })
      .eq('id', argumentId)

    return NextResponse.json({ fallacy, score })
  } catch (error: any) {
    console.error('Error in /api/debate/fallacy:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}