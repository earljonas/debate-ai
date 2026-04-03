import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { topic, rounds } = await req.json()

  if (!topic || typeof topic !== 'string') {
    return NextResponse.json(
      { error: 'Topic is required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('debates')
    .insert({
      topic: topic.trim(),
      rounds: rounds || 3,
      current_round: 1,
      status: 'active',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ debate: data })
}