import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeParseJSON<T>(text: string): T | null {
  try {
    // Strip markdown code fences if AI adds them
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean) as T
  } catch {
    return null
  }
}

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))