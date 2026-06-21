import { SlideStructure } from './types'

export function generateDefaultStructure(slideCount: number): SlideStructure[] {
  const slides: SlideStructure[] = []

  if (slideCount === 1) {
    slides.push({
      id: 'slide-1',
      type: 'content',
      label: 'Slide único',
      instruction: 'Desarrolla el tema completo en un solo slide con los puntos más importantes.',
      locked: false,
    })
    return slides
  }

  if (slideCount === 2) {
    slides.push({
      id: 'slide-1',
      type: 'cover',
      label: 'Portada',
      instruction: 'Título impactante que genere curiosidad sobre el tema. Debe enganchar al lector.',
      locked: true,
    })
    slides.push({
      id: 'slide-2',
      type: 'cta',
      label: 'CTA',
      instruction: 'Llamada a la acción para que el lector interactúe: envíe un DM, guarde el post o siga la cuenta.',
      locked: true,
    })
    return slides
  }

  // 3+ slides: cover + content + CTA
  slides.push({
    id: 'slide-1',
    type: 'cover',
    label: 'Portada',
    instruction: 'Título impactante que genere curiosidad sobre el tema. Debe enganchar al lector.',
    locked: true,
  })

  const contentCount = slideCount - 2
  for (let i = 0; i < contentCount; i++) {
    const slideNum = i + 2
    slides.push({
      id: `slide-${slideNum}`,
      type: 'content',
      label: `Slide ${slideNum}`,
      instruction: getDefaultInstruction(i, contentCount),
      locked: false,
    })
  }

  slides.push({
    id: `slide-${slideCount}`,
    type: 'cta',
    label: 'CTA',
    instruction: 'Llamada a la acción para que el lector interactúe: envíe un DM, guarde el post o siga la cuenta.',
    locked: true,
  })

  return slides
}

function getDefaultInstruction(index: number, total: number): string {
  if (total <= 1) return 'Desarrolla el tema con tips prácticos y accionables.'

  if (index === 0) return 'Presenta el problema o contexto del tema. ¿Por qué importa esto?'
  if (index === total - 1) return 'Tip final o conclusión más importante. El remate del carrusel.'

  const mid = Math.floor(total / 2)
  if (index < mid) return 'Tip o solución concreta con bullets accionables.'
  return 'Herramienta, ejemplo o caso práctico relacionado con el tema.'
}
