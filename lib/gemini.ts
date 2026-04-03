import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export { ai }
export const MODEL = 'gemini-2.0-flash'
