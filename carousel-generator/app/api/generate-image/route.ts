import { NextRequest, NextResponse } from 'next/server'

// Gemini Flash image generation — works with Google AI Studio API keys
// (Imagen 3 "predict" endpoint is Vertex AI only and requires OAuth, not API key)
const IMAGE_MODEL = 'gemini-3.1-flash-image-preview'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Falta el prompt para la imagen' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Falta GEMINI_API_KEY en .env.local' }, { status: 500 })
    }

    const imagePrompt = `Professional Instagram carousel slide image. Dark background, modern minimal design, bold typography. ${prompt}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: imagePrompt }] }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error(`[GeminiImage] error:`, data?.error?.message)
      return NextResponse.json(
        { error: data?.error?.message || `Error ${response.status}` },
        { status: 500 }
      )
    }

    const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> =
      data?.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((p) => p.inlineData)

    if (!imagePart?.inlineData) {
      console.error('[GeminiImage] no image in response:', JSON.stringify(data).slice(0, 300))
      return NextResponse.json({ error: 'No se recibió imagen en la respuesta' }, { status: 500 })
    }

    const b64 = imagePart.inlineData.data
    const mime = imagePart.inlineData.mimeType || 'image/png'

    return NextResponse.json({ imageUrl: `data:${mime};base64,${b64}`, model: IMAGE_MODEL })
  } catch (error) {
    console.error('[GeminiImage] exception:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
