export type SlideType = 'cover' | 'content' | 'cta'
export type Tone = 'direct' | 'educational' | 'inspirational' | 'storytelling' | 'controversial' | 'humorous' | 'tutorial'

export interface SlideStructure {
  id: string
  type: SlideType
  label: string
  instruction: string
  locked: boolean
}

export interface GeneratedSlide {
  id: string
  type: SlideType
  title?: string
  bullets?: string[]
  body?: string
  cta?: string
}

export interface CarouselConfig {
  topic: string
  tone: Tone
  slideCount: number
  structure: SlideStructure[]
}

export interface GenerateRequest {
  topic: string
  tone: Tone
  structure: SlideStructure[]
}

export interface GenerateResponse {
  slides: GeneratedSlide[]
  error?: string
}
