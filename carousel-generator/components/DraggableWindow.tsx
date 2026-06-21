'use client'

import { useState, useRef, useCallback, ReactNode } from 'react'

interface Props {
  id: string
  title: string
  subtitle?: string
  initialX: number
  initialY: number
  initialWidth: number
  initialHeight: number
  onClose: (id: string) => void
  onFocus: (id: string) => void
  zIndex: number
  children: ReactNode
}

export default function DraggableWindow({
  id, title, subtitle, initialX, initialY, initialWidth, initialHeight,
  onClose, onFocus, zIndex, children,
}: Props) {
  const [pos, setPos] = useState({ x: initialX, y: initialY })
  const [size, setSize] = useState({ w: initialWidth, h: initialHeight })
  const [isMaximized, setIsMaximized] = useState(false)
  const [preMaxState, setPreMaxState] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; originW: number; originH: number } | null>(null)

  const handleMouseDownDrag = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return
    e.preventDefault()
    onFocus(id)
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: pos.x, originY: pos.y }

    const handleMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      const dx = ev.clientX - dragRef.current.startX
      const dy = ev.clientY - dragRef.current.startY
      setPos({ x: dragRef.current.originX + dx, y: Math.max(0, dragRef.current.originY + dy) })
    }
    const handleUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }, [id, isMaximized, onFocus, pos])

  const handleMouseDownResize = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return
    e.preventDefault()
    e.stopPropagation()
    onFocus(id)
    resizeRef.current = { startX: e.clientX, startY: e.clientY, originW: size.w, originH: size.h }

    const handleMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return
      const dw = ev.clientX - resizeRef.current.startX
      const dh = ev.clientY - resizeRef.current.startY
      setSize({
        w: Math.max(320, resizeRef.current.originW + dw),
        h: Math.max(250, resizeRef.current.originH + dh),
      })
    }
    const handleUp = () => {
      resizeRef.current = null
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }, [id, isMaximized, onFocus, size])

  const toggleMaximize = () => {
    if (isMaximized) {
      setPos({ x: preMaxState.x, y: preMaxState.y })
      setSize({ w: preMaxState.w, h: preMaxState.h })
      setIsMaximized(false)
    } else {
      setPreMaxState({ x: pos.x, y: pos.y, w: size.w, h: size.h })
      setPos({ x: 0, y: 0 })
      setSize({ w: window.innerWidth - 384, h: window.innerHeight - 65 })
      setIsMaximized(true)
    }
  }

  const style = isMaximized
    ? { left: 0, top: 0, width: '100%', height: '100%', zIndex }
    : { left: pos.x, top: pos.y, width: size.w, height: size.h, zIndex }

  return (
    <div
      style={style}
      className="absolute flex flex-col bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-2xl shadow-black/50"
      onMouseDown={() => onFocus(id)}
    >
      {/* Title bar */}
      <div
        onMouseDown={handleMouseDownDrag}
        className="flex items-center justify-between px-3 py-2 bg-zinc-800 border-b border-zinc-700 cursor-grab active:cursor-grabbing select-none shrink-0"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-zinc-200 truncate">{title}</span>
          {subtitle && (
            <span className="text-xs text-zinc-500 truncate hidden sm:inline">{subtitle}</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={toggleMaximize}
            className="w-6 h-6 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 transition-colors text-xs"
            title={isMaximized ? 'Restaurar' : 'Maximizar'}
          >
            {isMaximized ? '◇' : '□'}
          </button>
          <button
            onClick={() => onClose(id)}
            className="w-6 h-6 rounded flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-zinc-700 transition-colors text-xs"
            title="Cerrar"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Resize handle */}
      {!isMaximized && (
        <div
          onMouseDown={handleMouseDownResize}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          style={{ background: 'linear-gradient(135deg, transparent 50%, #52525b 50%)' }}
        />
      )}
    </div>
  )
}
