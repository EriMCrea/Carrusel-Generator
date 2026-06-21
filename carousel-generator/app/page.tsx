'use client'

import { useState, useCallback, useEffect } from 'react'
import { GeneratedSlide, Tone } from '@/lib/types'
import { generateDefaultStructure } from '@/lib/defaultStructure'
import StructureEditor from '@/components/StructureEditor'
import SlideCard from '@/components/SlideCard'
import ExportPanel from '@/components/ExportPanel'
import DraggableWindow from '@/components/DraggableWindow'

const MIN_SLIDES = 1
const DEFAULT_MAX = 20
const ABSOLUTE_MAX = 100
const RECENT_KEY = 'carousel-recent-topics'
const MAX_RECENT = 5

const TONES: { value: Tone; label: string; emoji: string }[] = [
  { value: 'direct', label: 'Directo', emoji: '⚡' },
  { value: 'educational', label: 'Educativo', emoji: '📚' },
  { value: 'inspirational', label: 'Inspiracional', emoji: '🔥' },
  { value: 'storytelling', label: 'Storytelling', emoji: '📖' },
  { value: 'controversial', label: 'Polémico', emoji: '💥' },
  { value: 'humorous', label: 'Humorístico', emoji: '😂' },
  { value: 'tutorial', label: 'Tutorial', emoji: '🛠️' },
]

const ASPECT_RATIOS: { value: string; label: string; ratio: number; desc: string }[] = [
  { value: '1:1', label: '1:1', ratio: 1, desc: 'Feed' },
  { value: '4:5', label: '4:5', ratio: 4 / 5, desc: 'Retrato' },
  { value: '9:16', label: '9:16', ratio: 9 / 16, desc: 'Stories / Reels' },
  { value: '16:9', label: '16:9', ratio: 16 / 9, desc: 'Horizontal' },
]

const AI_SUGGESTIONS = [
  {
    title: 'Cambiar el modelo de IA',
    desc: 'Reemplazar Claude por otro proveedor (OpenAI, Gemini, etc.)',
    instruction: 'Abre app/api/generate/route.ts. Cambia el endpoint de Anthropic por el de tu proveedor. Ajusta los headers de autenticación y el formato del body/response según la documentación de la API que uses. La variable de entorno se configura en el archivo de entorno local del proyecto.',
  },
  {
    title: 'Cambiar el generador de imágenes',
    desc: 'Usar DALL-E, Flux, Stable Diffusion u otro',
    instruction: 'Abre app/api/generate-image/route.ts. Reemplaza la llamada a Gemini por la API de tu generador preferido. Asegúrate de devolver { imageUrl: "data:image/png;base64,..." } en la respuesta para que el frontend siga funcionando.',
  },
  {
    title: 'Añadir un nuevo tono',
    desc: 'Crear un estilo de escritura personalizado',
    instruction: 'Tres archivos: 1) lib/types.ts — añade el valor al tipo Tone. 2) lib/prompts.ts — añade la descripción del tono en toneDescriptions. 3) app/page.tsx — añade el tono al array TONES con su emoji y label.',
  },
  {
    title: 'Modificar el diseño de los slides',
    desc: 'Cambiar layout, tipografía o estructura visual',
    instruction: 'Abre components/SlideCard.tsx. Todo el diseño visual está en estilos inline (para compatibilidad con html2canvas en la exportación). Puedes modificar colores, tamaños de fuente, padding y estructura. Importante: no uses clases de Tailwind dentro del slide porque html2canvas no las renderiza.',
  },
  {
    title: 'Cambiar la marca/branding',
    desc: 'Reemplazar "ErickCrea" por tu propia marca',
    instruction: 'Busca "ErickCrea" en todo el proyecto. Aparece en: components/SlideCard.tsx (etiqueta del slide), app/page.tsx (header), app/layout.tsx (título de la página). Reemplaza con tu marca. También puedes cambiar "@erickcrea" en el slide CTA.',
  },
  {
    title: 'Añadir nuevos presets de color',
    desc: 'Crear combinaciones de colores personalizadas',
    instruction: 'En app/page.tsx busca el array de presets de color (objetos con accent, bg y label). Añade un nuevo objeto con tu combinación. El color accent se usa para bullets, títulos y botones. El bg se usa como fondo de los slides.',
  },
]

type ImageModel = 'imagen-3-fast' | 'imagen-3'

interface RecentTopic {
  topic: string
  tone: Tone
  slides: number
  date: string
}

interface CarouselWindow {
  id: string
  type: 'carousel' | 'info'
  title: string
  topic?: string
  tone?: Tone
  slides?: GeneratedSlide[]
  slideCount?: number
  accentColor?: string
  bgColor?: string
  aspectRatio?: string
  imageModel?: ImageModel
  x: number
  y: number
}

let windowCounter = 0

export default function Home() {
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState<Tone>('direct')
  const [imageModel, setImageModel] = useState<ImageModel>('imagen-3-fast')
  const [slideCount, setSlideCount] = useState(6)
  const [structure, setStructure] = useState(() => generateDefaultStructure(6))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showStructure, setShowStructure] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [recentTopics, setRecentTopics] = useState<RecentTopic[]>([])
  const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null)
  const [aspectRatio, setAspectRatio] = useState('1:1')

  const [accentColor, setAccentColor] = useState('#a855f7')
  const [bgColor, setBgColor] = useState('#09090b')

  const [windows, setWindows] = useState<CarouselWindow[]>([
    { id: 'info-0', type: 'info', title: 'Inicio', x: 20, y: 20 },
  ])
  const [focusOrder, setFocusOrder] = useState<string[]>(['info-0'])

  const currentMax = unlocked ? ABSOLUTE_MAX : DEFAULT_MAX

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY)
      if (stored) setRecentTopics(JSON.parse(stored))
    } catch {}
  }, [])

  const saveRecentTopic = (t: string, tn: Tone, sc: number) => {
    const entry: RecentTopic = {
      topic: t,
      tone: tn,
      slides: sc,
      date: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
    }
    setRecentTopics(prev => {
      const updated = [entry, ...prev.filter(r => r.topic !== t)].slice(0, MAX_RECENT)
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(updated)) } catch {}
      return updated
    })
  }

  const handleSlideCountChange = useCallback((count: number) => {
    const max = unlocked ? ABSOLUTE_MAX : DEFAULT_MAX
    const clamped = Math.min(max, Math.max(MIN_SLIDES, count))
    setSlideCount(clamped)
    setStructure(generateDefaultStructure(clamped))
  }, [unlocked])

  const handleToggleLock = () => {
    if (unlocked) {
      if (slideCount > DEFAULT_MAX) {
        setSlideCount(DEFAULT_MAX)
        setStructure(generateDefaultStructure(DEFAULT_MAX))
      }
      setUnlocked(false)
    } else {
      setUnlocked(true)
    }
  }

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Por favor escribe el tema del carrusel.')
      return
    }
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone, structure }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al generar el carrusel')
      }

      windowCounter++
      const newId = `carousel-${windowCounter}`
      const offset = (windowCounter % 5) * 30
      const newWindow: CarouselWindow = {
        id: newId,
        type: 'carousel',
        title: topic.trim().slice(0, 40),
        topic: topic.trim(),
        tone,
        slides: data.slides,
        slideCount: data.slides.length,
        accentColor,
        bgColor,
        aspectRatio,
        imageModel,
        x: 20 + offset,
        y: 20 + offset,
      }

      setWindows(prev => [...prev, newWindow])
      setFocusOrder(prev => [...prev.filter(id => id !== newId), newId])
      saveRecentTopic(topic.trim(), tone, slideCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id))
    setFocusOrder(prev => prev.filter(wid => wid !== id))
  }

  const handleFocusWindow = (id: string) => {
    setFocusOrder(prev => [...prev.filter(wid => wid !== id), id])
  }

  const handleNewInfoWindow = () => {
    windowCounter++
    const newId = `info-${windowCounter}`
    const offset = (windowCounter % 5) * 30
    setWindows(prev => [...prev, { id: newId, type: 'info', title: 'Inicio', x: 40 + offset, y: 40 + offset }])
    setFocusOrder(prev => [...prev, newId])
  }

  const handleLoadRecent = (recent: RecentTopic) => {
    setTopic(recent.topic)
    setTone(recent.tone)
    handleSlideCountChange(recent.slides)
  }

  const handleClearRecent = () => {
    setRecentTopics([])
    try { localStorage.removeItem(RECENT_KEY) } catch {}
  }

  const quickButtons = unlocked
    ? [5, 10, 20, 50, 75, 100]
    : [3, 5, 7, 10, 15, 20]

  const currentRatio = ASPECT_RATIOS.find(r => r.value === aspectRatio)?.ratio || 1

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">
            Generador de Carruseles
          </h1>
          <p className="text-xs text-zinc-500">
            by <span className="text-violet-400 font-semibold">ErickCrea</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleNewInfoWindow}
            className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
          >
            + Nueva ventana
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-zinc-400">Conectado</span>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Left Panel: Controls */}
        <aside className="w-96 border-r border-zinc-800 flex flex-col overflow-y-auto shrink-0">
          <div className="p-5 space-y-5 flex-1">
            {/* Topic */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300">
                Tema del carrusel
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej: Cómo usar Claude para crear contenido en 10 minutos..."
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 resize-none transition-colors"
              />
            </div>

            {/* Tone */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300">Tono</label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                      tone === t.value
                        ? 'bg-violet-600 border-violet-500 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300">Formato</label>
              <div className="grid grid-cols-4 gap-2">
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-all border flex flex-col items-center gap-0.5 ${
                      aspectRatio === r.value
                        ? 'bg-violet-600 border-violet-500 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    <span className="font-bold">{r.label}</span>
                    <span className={`text-[10px] ${aspectRatio === r.value ? 'text-violet-200' : 'text-zinc-600'}`}>{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Model Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300">Modelo de imagen</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'imagen-3-fast', label: '⚡ Imagen 3 Fast', desc: '~$0.003/img' },
                  { value: 'imagen-3', label: '✨ Imagen 3', desc: '~$0.03/img' },
                ] as { value: ImageModel; label: string; desc: string }[]).map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setImageModel(m.value)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border flex flex-col items-center gap-0.5 ${
                      imageModel === m.value
                        ? 'bg-violet-600 border-violet-500 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    <span>{m.label}</span>
                    <span className={`text-xs ${imageModel === m.value ? 'text-violet-200' : 'text-zinc-600'}`}>{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slide Count */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-zinc-300">
                  Número de slides
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-violet-400 font-bold text-lg">{slideCount}</span>
                  <button
                    onClick={handleToggleLock}
                    className={`text-xs px-2 py-1 rounded-md border transition-all flex items-center gap-1 ${
                      unlocked
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:border-amber-500 hover:bg-amber-500/20'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-amber-500 hover:text-amber-400'
                    }`}
                    title={unlocked ? 'Bloquear a 20 slides' : 'Desbloquear hasta 100 slides'}
                  >
                    {unlocked ? `🔓 Máx ${ABSOLUTE_MAX}` : `🔒 Máx ${DEFAULT_MAX}`}
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={MIN_SLIDES}
                max={currentMax}
                value={slideCount}
                onChange={(e) => handleSlideCountChange(parseInt(e.target.value))}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-xs text-zinc-600">
                <span>{MIN_SLIDES}</span>
                <span>{currentMax}</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {quickButtons.map((n) => (
                  <button
                    key={n}
                    onClick={() => handleSlideCountChange(n)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                      slideCount === n
                        ? 'bg-violet-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Customization */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300">Personalización</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <span className="text-xs text-zinc-400">Color acento</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-md border border-zinc-700 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs text-zinc-500 font-mono">{accentColor}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs text-zinc-400">Fondo de slides</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-md border border-zinc-700 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs text-zinc-500 font-mono">{bgColor}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap pt-1">
                {[
                  { accent: '#a855f7', bg: '#09090b', label: 'Violeta' },
                  { accent: '#00ADB5', bg: '#222831', label: 'Teal' },
                  { accent: '#f59e0b', bg: '#1c1917', label: 'Ámbar' },
                  { accent: '#ef4444', bg: '#0c0a09', label: 'Rojo' },
                  { accent: '#22c55e', bg: '#0a0a0a', label: 'Verde' },
                  { accent: '#3b82f6', bg: '#0f172a', label: 'Azul' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => { setAccentColor(preset.accent); setBgColor(preset.bg) }}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors border ${
                      accentColor === preset.accent && bgColor === preset.bg
                        ? 'border-violet-500 bg-zinc-700 text-white'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    <span style={{ color: preset.accent }}>●</span> {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Structure Editor Toggle */}
            <div className="space-y-2">
              <button
                onClick={() => setShowStructure(!showStructure)}
                className="w-full flex items-center justify-between text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
              >
                <span>Estructura del carrusel</span>
                <span className="text-zinc-500 text-xs">
                  {showStructure ? '▲ ocultar' : '▼ editar'}
                </span>
              </button>
              {showStructure && (
                <StructureEditor structure={structure} onChange={setStructure} />
              )}
            </div>
          </div>

          {/* Generate Button */}
          <div className="p-5 border-t border-zinc-800">
            {error && (
              <p className="text-red-400 text-xs mb-3 bg-red-900/20 border border-red-800/50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generando con Claude...
                </>
              ) : (
                <>✨ Generar carrusel</>
              )}
            </button>
          </div>
        </aside>

        {/* Right Panel: Window Manager */}
        <main className="flex-1 relative overflow-hidden bg-zinc-950">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
              <div className="w-12 h-12 border-4 border-zinc-700 border-t-violet-500 rounded-full animate-spin" />
              <p className="text-zinc-400 text-sm mt-4">Claude está escribiendo tu carrusel...</p>
            </div>
          )}

          {/* Windows */}
          {windows.map((win) => {
            const zIndex = focusOrder.indexOf(win.id) + 10

            if (win.type === 'info') {
              return (
                <DraggableWindow
                  key={win.id}
                  id={win.id}
                  title="Inicio"
                  subtitle="Guía y sugerencias"
                  initialX={win.x}
                  initialY={win.y}
                  initialWidth={580}
                  initialHeight={500}
                  onClose={handleCloseWindow}
                  onFocus={handleFocusWindow}
                  zIndex={zIndex}
                >
                  <div className="p-6 space-y-6">
                    {/* Onboarding */}
                    <div className="space-y-3">
                      <h2 className="text-base font-bold text-zinc-200">Cómo funciona</h2>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { icon: '✏️', title: 'Escribe el tema', desc: 'Define de qué trata tu carrusel' },
                          { icon: '🎨', title: 'Personaliza', desc: 'Tono, colores, formato y slides' },
                          { icon: '✨', title: 'Genera', desc: 'Claude escribe cada slide' },
                        ].map((s) => (
                          <div key={s.title} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 text-center space-y-1.5">
                            <div className="text-xl">{s.icon}</div>
                            <div className="text-xs font-semibold text-zinc-200">{s.title}</div>
                            <div className="text-[10px] text-zinc-500">{s.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent */}
                    {recentTopics.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h2 className="text-sm font-bold text-zinc-300">Recientes</h2>
                          <button onClick={handleClearRecent} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Limpiar</button>
                        </div>
                        <div className="space-y-1.5">
                          {recentTopics.map((recent, i) => (
                            <button
                              key={i}
                              onClick={() => handleLoadRecent(recent)}
                              className="w-full text-left bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 rounded-lg px-3 py-2 transition-all group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-zinc-300 group-hover:text-white truncate pr-3">{recent.topic}</span>
                                <span className="text-[10px] text-zinc-600 whitespace-nowrap">{recent.date}</span>
                              </div>
                              <div className="flex gap-2 mt-0.5">
                                <span className="text-[10px] text-zinc-600">{TONES.find(t => t.value === recent.tone)?.emoji} {TONES.find(t => t.value === recent.tone)?.label}</span>
                                <span className="text-[10px] text-zinc-600">{recent.slides} slides</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Suggestions */}
                    <div className="space-y-2">
                      <div className="space-y-0.5">
                        <h2 className="text-sm font-bold text-zinc-300">Sugerencias para personalizar con IA</h2>
                        <p className="text-[10px] text-zinc-600">Instrucciones para tu IA (Claude, ChatGPT, etc.) para modificar el proyecto.</p>
                      </div>
                      <div className="space-y-1.5">
                        {AI_SUGGESTIONS.map((suggestion, i) => (
                          <div key={i} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg overflow-hidden">
                            <button
                              onClick={() => setExpandedSuggestion(expandedSuggestion === i ? null : i)}
                              className="w-full text-left px-3 py-2 flex items-start justify-between gap-2 hover:bg-zinc-800 transition-colors"
                            >
                              <div>
                                <div className="text-xs font-medium text-zinc-300">{suggestion.title}</div>
                                <div className="text-[10px] text-zinc-600 mt-0.5">{suggestion.desc}</div>
                              </div>
                              <span className="text-zinc-600 text-[10px] mt-0.5 shrink-0">{expandedSuggestion === i ? '▲' : '▼'}</span>
                            </button>
                            {expandedSuggestion === i && (
                              <div className="px-3 pb-3 border-t border-zinc-700/50">
                                <div className="mt-2 bg-zinc-950 rounded-lg px-3 py-2 text-[11px] text-zinc-400 leading-relaxed font-mono">
                                  {suggestion.instruction}
                                </div>
                                <button
                                  onClick={() => navigator.clipboard.writeText(suggestion.instruction)}
                                  className="mt-1.5 text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
                                >
                                  📋 Copiar instrucción
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </DraggableWindow>
              )
            }

            // Carousel window
            return (
              <DraggableWindow
                key={win.id}
                id={win.id}
                title={win.title || 'Carrusel'}
                subtitle={`${win.slideCount} slides · ${TONES.find(t => t.value === win.tone)?.label || ''}`}
                initialX={win.x}
                initialY={win.y}
                initialWidth={700}
                initialHeight={550}
                onClose={handleCloseWindow}
                onFocus={handleFocusWindow}
                zIndex={zIndex}
              >
                <div className="p-4 space-y-4">
                  {/* Export bar */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500 truncate max-w-xs">{win.topic}</p>
                    </div>
                    {win.slides && (
                      <ExportPanel slides={win.slides} topic={win.topic || ''} />
                    )}
                  </div>

                  {/* Slides grid */}
                  {win.slides && (
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                      {win.slides.map((slide, i) => (
                        <SlideCard
                          key={slide.id}
                          slide={slide}
                          index={i}
                          total={win.slides!.length}
                          topic={win.topic || ''}
                          imageModel={win.imageModel}
                          accentColor={win.accentColor}
                          bgColor={win.bgColor}
                          aspectRatio={win.aspectRatio}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </DraggableWindow>
            )
          })}

          {/* Empty state — no windows at all */}
          {windows.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="text-4xl mb-3">📱</div>
              <p className="text-zinc-500 text-sm">No hay ventanas abiertas</p>
              <button
                onClick={handleNewInfoWindow}
                className="mt-3 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                + Abrir ventana de inicio
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
