import type { Argument, Side } from '../types/debate'

export function getDebaterPrompt(topic: string, side: Side): string {
  const position = side === 'pro'
    ? `passionately FOR: "${topic}"`
    : `sharply AGAINST: "${topic}"`

  return `You are a skilled debater arguing ${position}.

Rules:
- Make ONE clear focused argument per turn (3-5 sentences max)
- Always directly rebut your opponent's last point first
- Use evidence, logic, and real-world examples
- Never concede your position
- Vary your approach: use facts, analogies, historical examples

Respond with only your argument — no labels, no preamble.`
}

export function getFallacyPrompt(argument: string): string {
  return `You are a formal logic expert. Analyze this argument for logical fallacies.

Argument: "${argument}"

Respond ONLY with valid JSON — no markdown, no explanation outside the JSON:
{
  "hasFallacy": boolean,
  "fallacyName": string | null,
  "explanation": string | null,
  "severity": "minor" | "major" | null
}

Common fallacies: ad hominem, straw man, false dichotomy, slippery slope,
appeal to authority, hasty generalization, circular reasoning, red herring.

If no fallacy: return hasFallacy false, all others null.`
}

export function getScoringPrompt(argument: string): string {
  return `You are a debate judge. Score this argument.

Argument: "${argument}"

Respond ONLY with valid JSON — no markdown:
{
  "logic_score": number (1-10),
  "evidence_score": number (1-10),
  "key_claim": string (one sentence summary of the core claim)
}`
}

export function getJudgePrompt(
  topic: string,
  args: Argument[]
): string {
  const transcript = args.map((a, i) =>
    `[Round ${a.round} - ${a.side.toUpperCase()}]: ${a.content}`
  ).join('\n\n')

  return `You are an impartial debate judge. Evaluate this debate.

Topic: "${topic}"

Full transcript:
${transcript}

Respond ONLY with valid JSON — no markdown:
{
  "winner": "pro" | "con" | "draw",
  "winMargin": "narrow" | "moderate" | "decisive",
  "proStrengths": [string, string],
  "conStrengths": [string, string],
  "bestArgument": {
    "side": "pro" | "con",
    "summary": string
  },
  "keyTurningPoint": string,
  "overallReasoning": string
}

Base verdict purely on argument quality and logic — not personal opinion.`
}

export function buildMessages(
  systemPrompt: string,
  history: Argument[]
) {
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system' as const, content: systemPrompt },
  ]

  if (history.length > 0) {
    messages.push(
      ...history.map(a => ({
        role: (a.side === 'pro' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: a.content,
      }))
    )
  }

  // Always ensure there is at least one user message.
  // The Gemini API requires non-empty contents — if history is empty
  // (first turn), we inject a kickoff prompt so the model has valid input.
  const hasUserMessage = messages.some(m => m.role === 'user')
  if (!hasUserMessage) {
    messages.push({
      role: 'user' as const,
      content: 'Begin the debate. Present your opening argument.',
    })
  }

  return messages
}