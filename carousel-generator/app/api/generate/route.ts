import { NextRequest, NextResponse } from 'next/server'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompts'
import { GenerateRequest, GenerateResponse } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json()
    const { topic, tone, structure } = body

    if (!topic || !structure || structure.length === 0) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: topic y structure' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Falta la API key de Anthropic. Agrega ANTHROPIC_API_KEY en .env.local' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: buildSystemPrompt(tone),
        messages: [
          {
            role: 'user',
            content: buildUserPrompt(topic, structure),
          },
        ],
      }),
    })

    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData?.error?.message || `Error de Anthropic: ${response.status}`)
    }

    const data = await response.json()
    const text: string = data.content?.[0]?.text ?? ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No se encontró JSON válido en la respuesta')
    }

    const parsed = JSON.parse(jsonMatch[0]) as GenerateResponse
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Error generando carrusel:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error desconocido al generar el carrusel',
      },
      { status: 500 }
    )
  }
}
