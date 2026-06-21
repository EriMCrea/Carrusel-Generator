'use client'

import { useState } from 'react'
import { GeneratedSlide } from '@/lib/types'

interface Props {
  slide: GeneratedSlide
  index: number
  total: number
  topic: string
  imageModel?: 'imagen-3-fast' | 'imagen-3'
  accentColor?: string
  bgColor?: string
  aspectRatio?: string
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function darken(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount)
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount)
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function lighten(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount)
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount)
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export default function SlideCard({ slide, index, total, topic, imageModel = 'imagen-3-fast', accentColor = '#a855f7', bgColor = '#09090b', aspectRatio = '1:1' }: Props) {
  const isCover = slide.type === 'cover'
  const isCTA = slide.type === 'cta'
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  const accentDark = darken(accentColor, 40)
  const bgLight = lighten(bgColor, 15)
  const amber = '#fbbf24'

  const buildImagePrompt = () => {
    if (isCover) return `Cover slide for Instagram carousel about: "${slide.title}". Topic: ${topic}`
    if (isCTA) return `Call to action slide: "${slide.title}". CTA: ${slide.cta}`
    const bullets = slide.bullets?.join(', ') || ''
    return `Content slide titled "${slide.title}". Key points: ${bullets}`
  }

  const handleGenerateImage = async () => {
    setGeneratingImage(true)
    setImageError(null)
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: buildImagePrompt(), model: imageModel }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error)
      setImageUrl(data.imageUrl)
    } catch (e) {
      setImageError(e instanceof Error ? e.message : 'Error al generar imagen')
    } finally {
      setGeneratingImage(false)
    }
  }

  const bgStyle = isCover
    ? `linear-gradient(135deg, ${bgColor} 0%, ${accentDark} 50%, ${bgColor} 100%)`
    : isCTA
    ? `linear-gradient(135deg, ${bgColor} 0%, ${bgLight} 100%)`
    : `linear-gradient(135deg, ${bgColor} 0%, ${bgLight} 100%)`

  return (
    <div
      id={`slide-export-${slide.id}`}
      style={{
        position: 'relative',
        aspectRatio: aspectRatio === '4:5' ? '4 / 5' : aspectRatio === '9:16' ? '9 / 16' : aspectRatio === '16:9' ? '16 / 9' : '1 / 1',
        width: '100%',
        maxWidth: '384px',
        margin: '0 auto',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        background: bgStyle,
      }}
    >
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '160px', height: '160px', borderRadius: '50%', opacity: 0.12,
        background: `radial-gradient(circle, ${accentColor}, transparent)`,
        transform: 'translate(30%, -30%)',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        width: '128px', height: '128px', borderRadius: '50%', opacity: 0.12,
        background: `radial-gradient(circle, ${accentDark}, transparent)`,
        transform: 'translate(-30%, 30%)',
      }} />

      {/* Slide number */}
      <div style={{
        position: 'absolute', top: '16px', right: '16px',
        color: hexToRgba('#ffffff', 0.3), fontSize: '11px', fontFamily: 'monospace',
      }}>
        {index + 1}/{total}
      </div>

      {/* Brand tag */}
      <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
        <span style={{
          fontSize: '11px', fontWeight: 700,
          color: accentColor, letterSpacing: '0.15em', textTransform: 'uppercase',
        }}>
          ErickCrea
        </span>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '56px 32px 32px',
      }}>
        {isCover && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '32px', height: '4px', background: accentDark, borderRadius: '4px' }} />
            <h2 style={{
              color: '#ffffff', fontWeight: 900, fontSize: '24px',
              lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0,
            }}>
              {slide.title}
            </h2>
            <p style={{
              color: hexToRgba('#ffffff', 0.5), fontSize: '11px',
              textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0,
            }}>
              {topic}
            </p>
          </div>
        )}

        {slide.type === 'content' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {slide.title && (
              <h3 style={{
                color: '#ffffff', fontWeight: 700, fontSize: '18px',
                lineHeight: 1.3, margin: 0,
              }}>
                {slide.title}
              </h3>
            )}
            {slide.body && (
              <p style={{ color: hexToRgba('#ffffff', 0.8), fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                {slide.body}
              </p>
            )}
            {slide.bullets && slide.bullets.length > 0 && (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {slide.bullets.map((bullet, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: hexToRgba('#ffffff', 0.9), fontSize: '13px' }}>
                    <span style={{ color: accentColor, marginTop: '2px', flexShrink: 0 }}>→</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {isCTA && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '4px', background: amber, borderRadius: '4px' }} />
            <h3 style={{
              color: '#ffffff', fontWeight: 900, fontSize: '20px',
              lineHeight: 1.2, margin: 0,
            }}>
              {slide.title}
            </h3>
            {slide.cta && (
              <div style={{
                background: accentColor, color: '#ffffff',
                fontSize: '13px', fontWeight: 700,
                padding: '10px 20px', borderRadius: '999px',
              }}>
                {slide.cta}
              </div>
            )}
            <p style={{ color: hexToRgba('#ffffff', 0.4), fontSize: '11px', margin: 0 }}>@erickcrea</p>
          </div>
        )}
      </div>

      {/* Generated image overlay */}
      {imageUrl && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`Imagen slide ${index + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
          />
          <button
            onClick={() => setImageUrl(null)}
            style={{
              position: 'absolute', top: '10px', right: '10px', zIndex: 20,
              background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none',
              borderRadius: '50%', width: '28px', height: '28px',
              cursor: 'pointer', fontSize: '14px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
            title="Quitar imagen"
          >✕</button>
        </div>
      )}

      {/* Generate image button */}
      {!imageUrl && (
        <div style={{ padding: '0 16px 16px', position: 'relative', zIndex: 5 }}>
          {imageError && (
            <p style={{ color: '#f87171', fontSize: '11px', marginBottom: '6px', textAlign: 'center' }}>
              {imageError}
            </p>
          )}
          <button
            onClick={handleGenerateImage}
            disabled={generatingImage}
            style={{
              width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #3f3f46',
              background: generatingImage ? '#27272a' : '#18181b',
              color: generatingImage ? '#71717a' : accentColor,
              fontSize: '12px', fontWeight: 600, cursor: generatingImage ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            {generatingImage ? (
              <>
                <span style={{
                  width: '12px', height: '12px', border: '2px solid #52525b',
                  borderTopColor: accentColor, borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite', display: 'inline-block',
                }} />
                Generando imagen...
              </>
            ) : (
              <>🎨 Generar imagen con Gemini</>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
