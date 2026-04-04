import { NextRequest, NextResponse } from 'next/server'
import { ai, MODEL } from '@/lib/gemini'
import { supabase } from '@/lib/supabase'
import { getFallacyPrompt, getScoringPrompt } from '@/lib/agents'
import {
  generateMockFallacy,
  generateMockScore,
  isMockDebateEnabled,
} from '@/lib/mock-debate'
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

    if (isMockDebateEnabled(req)) {
      const fallacy = generateMockFallacy(content)
      const score = generateMockScore(content)

      await supabase
        .from('arguments')
        .update({
          logic_score: score.logic_score,
          evidence_score: score.evidence_score,
          fallacy: fallacy.hasFallacy ? fallacy.fallacyName : null,
          fallacy_severity: fallacy.severity,
        })
        .eq('id', argumentId)

      return NextResponse.json({ fallacy, score })
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
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    console.error('Error in /api/debate/fallacy:', error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
