export type Side = 'pro' | 'con'
export type DebateStatus = 'active' | 'complete'

export interface Debate {
  id: string
  topic: string
  rounds: number
  current_round: number
  status: DebateStatus
  created_at: string
}

export interface Argument {
  id: string
  debate_id: string
  side: Side
  content: string
  round: number
  logic_score: number | null
  evidence_score: number | null
  fallacy: string | null
  fallacy_severity: 'minor' | 'major' | null
  created_at: string
}

export interface FallacyResult {
  hasFallacy: boolean
  fallacyName: string | null
  explanation: string | null
  severity: 'minor' | 'major' | null
}

export interface ScoreResult {
  logic_score: number
  evidence_score: number
  key_claim: string
}

export interface JudgeVerdict {
  winner: Side | 'draw'
  winMargin: 'narrow' | 'moderate' | 'decisive'
  proStrengths: string[]
  conStrengths: string[]
  bestArgument: {
    side: Side
    summary: string
  }
  keyTurningPoint: string
  overallReasoning: string
}