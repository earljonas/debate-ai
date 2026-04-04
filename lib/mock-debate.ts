import type {
  Argument,
  FallacyResult,
  JudgeVerdict,
  ScoreResult,
  Side,
} from '@/types/debate'
import type { NextRequest } from 'next/server'

interface MockArgumentInput {
  topic: string
  side: Side
  round: number
  history: Argument[]
}

const OPENING_STYLES: Record<Side, string[]> = {
  pro: [
    'This policy creates practical benefits that outweigh the risks.',
    'The strongest case starts with measurable upside for ordinary people.',
    'A sensible debate begins by looking at the real gains this choice can unlock.',
  ],
  con: [
    'The hidden costs make this position much weaker than it first appears.',
    'A closer look shows the harms are more immediate than the promised benefits.',
    'The central problem is that this approach sounds appealing but breaks down in practice.',
  ],
}

const REBUTTAL_STYLES: Record<Side, string[]> = {
  pro: [
    'That objection overstates the downside and ignores workable safeguards.',
    'The previous point sounds forceful, but it skips over the evidence that implementation can be managed.',
    'The criticism misses how the same concern can be reduced without abandoning the idea entirely.',
  ],
  con: [
    'That defense leans on optimism more than proof.',
    'The previous point assumes best-case execution and glosses over predictable failure points.',
    'That argument treats exceptions as the rule and leaves the main risk unanswered.',
  ],
}

function pickVariant<T>(items: T[], seed: number): T {
  return items[seed % items.length]
}

export function isMockDebateEnabled(req?: NextRequest) {
  const cookieEnabled = req?.cookies.get('mock_debate')?.value === 'true'
  return process.env.MOCK_DEBATE === 'true' || cookieEnabled
}

export function generateMockArgument({
  topic,
  side,
  round,
  history,
}: MockArgumentInput) {
  const previousOpponentArgument = [...history]
    .reverse()
    .find((entry) => entry.side !== side)

  const opening = pickVariant(OPENING_STYLES[side], round)
  const rebuttal = pickVariant(REBUTTAL_STYLES[side], round + history.length)
  const stance =
    side === 'pro'
      ? `On "${topic}," supporting the motion is reasonable because it can improve outcomes at scale`
      : `On "${topic}," opposing the motion is justified because the tradeoffs are larger than supporters admit`

  const rebuttalSentence = previousOpponentArgument
    ? `${rebuttal} In particular, the claim that "${trimSentence(previousOpponentArgument.content)}" is not enough to settle the issue.`
    : opening

  const closer =
    side === 'pro'
      ? 'A strong policy should be judged by whether it produces net public value, and this one can.'
      : 'A responsible policy should survive scrutiny under real-world conditions, and this one does not.'

  return `${rebuttalSentence} ${stance}. Round ${round} is where the ${side === 'pro' ? 'affirmative' : 'negative'} side should emphasize realistic consequences, incentives, and lived impact rather than slogans. ${closer}`
}

function trimSentence(text: string) {
  return text.replace(/\s+/g, ' ').trim().slice(0, 90)
}

export function generateMockScore(content: string): ScoreResult {
  const normalized = content.toLowerCase()
  const logicBase = normalized.includes('because') ? 8 : 7
  const evidenceBase =
    normalized.includes('evidence') || normalized.includes('example') ? 8 : 6

  return {
    logic_score: logicBase,
    evidence_score: evidenceBase,
    key_claim: trimSentence(content),
  }
}

export function generateMockFallacy(content: string): FallacyResult {
  const normalized = content.toLowerCase()
  const hasFallacy =
    normalized.includes('always') || normalized.includes('never')

  return hasFallacy
    ? {
        hasFallacy: true,
        fallacyName: 'hasty generalization',
        explanation:
          'The argument uses an overly absolute claim without showing that it applies in every case.',
        severity: 'minor',
      }
    : {
        hasFallacy: false,
        fallacyName: null,
        explanation: null,
        severity: null,
      }
}

export function generateMockVerdict(
  topic: string,
  argumentsList: Argument[]
): JudgeVerdict {
  const proArguments = argumentsList.filter((entry) => entry.side === 'pro')
  const conArguments = argumentsList.filter((entry) => entry.side === 'con')

  const proTotal = sumScores(proArguments)
  const conTotal = sumScores(conArguments)
  const winner = proTotal === conTotal ? 'draw' : proTotal > conTotal ? 'pro' : 'con'

  return {
    winner,
    winMargin:
      Math.abs(proTotal - conTotal) >= 4
        ? 'decisive'
        : Math.abs(proTotal - conTotal) >= 2
          ? 'moderate'
          : 'narrow',
    proStrengths: [
      `The pro side kept tying "${topic}" back to broader public benefit.`,
      'Its arguments generally stayed structured and easy to follow.',
    ],
    conStrengths: [
      'The con side consistently highlighted implementation risk and unintended consequences.',
      'Its rebuttals applied pressure whenever claims sounded too optimistic.',
    ],
    bestArgument: {
      side: winner === 'draw' ? 'pro' : winner,
      summary:
        winner === 'con'
          ? 'The negative side most clearly argued that attractive promises still fail if incentives and execution are weak.'
          : 'The affirmative side most clearly argued that practical benefits matter more than speculative downsides.',
    },
    keyTurningPoint:
      winner === 'con'
        ? 'The debate shifted when the con side reframed the issue around real-world execution instead of intent.'
        : 'The debate shifted when the pro side translated abstract claims into concrete public outcomes.',
    overallReasoning:
      winner === 'draw'
        ? 'Both sides made workable points, and neither created a large quality gap in reasoning.'
        : `This mock verdict gives the edge to the ${winner} side based on slightly stronger structure and consistency across the debate.`,
  }
}

function sumScores(argumentsList: Argument[]) {
  return argumentsList.reduce((total, argument) => {
    return total + (argument.logic_score ?? 7) + (argument.evidence_score ?? 6)
  }, 0)
}
