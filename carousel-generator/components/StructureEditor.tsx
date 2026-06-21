'use client'

import { SlideStructure, SlideType } from '@/lib/types'

interface Props {
  structure: SlideStructure[]
  onChange: (structure: SlideStructure[]) => void
}

const typeColors: Record<SlideType, string> = {
  cover: 'bg-violet-600 text-white',
  content: 'bg-zinc-700 text-zinc-200',
  cta: 'bg-amber-500 text-zinc-900',
}

const typeLabels: Record<SlideType, string> = {
  cover: 'Portada',
  content: 'Contenido',
  cta: 'CTA',
}

export default function StructureEditor({ structure, onChange }: Props) {
  const updateSlide = (id: string, field: keyof SlideStructure, value: string) => {
    onChange(
      structure.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-400 mb-3">
        Edita la etiqueta e instrucción de cada slide. Los slides de Portada y CTA están fijos.
      </p>
      {structure.map((slide, index) => (
        <div
          key={slide.id}
          className={`rounded-lg border ${
            slide.locked
              ? 'border-zinc-600 bg-zinc-800/50'
              : 'border-zinc-600 bg-zinc-800'
          } p-3 space-y-2`}
        >
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs font-mono w-5">{index + 1}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[slide.type]}`}
            >
              {typeLabels[slide.type]}
            </span>
            {slide.locked ? (
              <span className="text-zinc-500 text-xs ml-auto">🔒 fijo</span>
            ) : (
              <input
                type="text"
                value={slide.label}
                onChange={(e) => updateSlide(slide.id, 'label', e.target.value)}
                placeholder="Etiqueta del slide"
                className="ml-auto text-xs bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-zinc-200 focus:outline-none focus:border-violet-500 w-32"
              />
            )}
          </div>
          <textarea
            value={slide.instruction}
            onChange={(e) => updateSlide(slide.id, 'instruction', e.target.value)}
            disabled={slide.locked}
            rows={2}
            placeholder="Instrucción para la IA sobre este slide..."
            className={`w-full text-xs rounded px-2 py-1.5 resize-none focus:outline-none focus:border-violet-500 border ${
              slide.locked
                ? 'bg-zinc-900/50 border-zinc-700 text-zinc-500 cursor-not-allowed'
                : 'bg-zinc-700 border-zinc-600 text-zinc-300'
            }`}
          />
        </div>
      ))}
    </div>
  )
}
