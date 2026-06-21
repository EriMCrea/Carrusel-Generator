import { SlideStructure, Tone } from './types'

export function buildSystemPrompt(tone: Tone): string {
  const toneDescriptions: Record<string, string> = {
    direct: 'directo, conciso y con impacto. Usa frases cortas y poderosas. Nada de relleno.',
    educational: 'educativo y claro. Explica los conceptos de forma accesible, con ejemplos prácticos y estructura lógica.',
    inspirational: 'inspiracional y motivador. Conecta emocionalmente con el lector. Usa frases que empoderen y generen acción.',
    storytelling: 'narrativo y envolvente. Cuenta una historia con inicio, desarrollo y cierre. Conecta el tema con experiencias reales.',
    controversial: 'polémico y provocador. Desafía creencias comunes con datos o perspectivas inesperadas. Genera debate.',
    humorous: 'humorístico y ligero. Usa analogías graciosas, comparaciones absurdas o situaciones cotidianas para explicar el tema.',
    tutorial: 'paso a paso, tipo tutorial. Estructura cada slide como una instrucción clara y secuencial que el lector pueda seguir.',
  }
  const toneDescription = toneDescriptions[tone] || toneDescriptions.direct

  return `Eres un experto en contenido para Instagram especializado en carruseles virales sobre IA, marketing digital y herramientas digitales para creadores y emprendedores.

Tu estilo de escritura es ${toneDescription}

Reglas que SIEMPRE debes seguir:
- Escribe en español de México (informal, cercano, pero profesional)
- Los títulos deben ser impactantes, directos y generar curiosidad
- Los bullets deben ser accionables y concretos (máximo 8 palabras por bullet)
- La CTA debe ser conversacional y motivar a interactuar
- NO uses emojis en exceso, máximo 1-2 por slide si aplica
- NO uses palabras genéricas como "increíble", "maravilloso", "impresionante"
- Cada slide debe poder leerse en menos de 10 segundos

Responde SIEMPRE en formato JSON válido, exactamente como se te indica.`
}

export function buildUserPrompt(
  topic: string,
  structure: SlideStructure[]
): string {
  const structureDesc = structure
    .map(
      (s, i) =>
        `Slide ${i + 1} (${s.label}): ${s.instruction}`
    )
    .join('\n')

  return `Genera un carrusel de Instagram sobre el siguiente tema:
TEMA: "${topic}"

ESTRUCTURA DEL CARRUSEL:
${structureDesc}

Responde con un JSON con esta estructura exacta:
{
  "slides": [
    {
      "id": "slide-1",
      "type": "cover",
      "title": "Título impactante aquí"
    },
    {
      "id": "slide-2",
      "type": "content",
      "title": "Subtítulo o punto clave",
      "bullets": ["Punto 1", "Punto 2", "Punto 3"]
    },
    {
      "id": "slide-N",
      "type": "cta",
      "title": "¿Quieres saber más?",
      "cta": "Mándame un DM con la palabra GUÍA"
    }
  ]
}

Reglas del JSON:
- Slide tipo "cover": solo "title" (frase impactante, máx 10 palabras)
- Slide tipo "content": "title" + "bullets" (3-5 bullets concretos) + opcionalmente "body" para un párrafo corto
- Slide tipo "cta": "title" + "cta" (la llamada a la acción)
- NO incluyas nada fuera del JSON`
}
