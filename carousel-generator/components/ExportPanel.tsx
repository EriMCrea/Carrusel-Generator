'use client'

import { useState } from 'react'
import { GeneratedSlide } from '@/lib/types'

interface Props {
  slides: GeneratedSlide[]
  topic: string
}

export default function ExportPanel({ slides, topic }: Props) {
  const [exporting, setExporting] = useState(false)
  const [exportType, setExportType] = useState<'png' | 'pdf' | null>(null)

  const exportAllPNG = async () => {
    setExporting(true)
    setExportType('png')
    try {
      const html2canvas = (await import('html2canvas')).default
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      const folderName = topic.slice(0, 30).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_áéíóúñ]/g, '')

      for (let i = 0; i < slides.length; i++) {
        const el = document.getElementById(`slide-export-${slides[i].id}`)
        if (!el) continue
        const canvas = await html2canvas(el, {
          scale: 3,
          backgroundColor: '#09090b',
          useCORS: true,
        })
        // Convert canvas to blob and add to ZIP
        const blob: Blob = await new Promise((resolve) =>
          canvas.toBlob((b) => resolve(b!), 'image/png')
        )
        zip.file(`slide-${i + 1}.png`, blob)
      }

      // Generate ZIP and trigger single download
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const link = document.createElement('a')
      link.download = `${folderName || 'carrusel'}.zip`
      link.href = URL.createObjectURL(zipBlob)
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (e) {
      console.error('Error exportando PNG:', e)
    } finally {
      setExporting(false)
      setExportType(null)
    }
  }

  const exportPDF = async () => {
    setExporting(true)
    setExportType('pdf')
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [1080, 1080],
      })

      for (let i = 0; i < slides.length; i++) {
        const el = document.getElementById(`slide-export-${slides[i].id}`)
        if (!el) continue
        const canvas = await html2canvas(el, {
          scale: 3,
          backgroundColor: null,
          useCORS: true,
        })
        const imgData = canvas.toDataURL('image/png')
        if (i > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, 0, 1080, 1080)
      }

      pdf.save(`${topic.slice(0, 30).replace(/\s+/g, '-')}-carrusel.pdf`)
    } catch (e) {
      console.error('Error exportando PDF:', e)
    } finally {
      setExporting(false)
      setExportType(null)
    }
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={exportAllPNG}
        disabled={exporting}
        className="flex-1 flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
      >
        {exporting && exportType === 'png' ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Exportando...
          </>
        ) : (
          <>📸 Exportar PNGs</>
        )}
      </button>
      <button
        onClick={exportPDF}
        disabled={exporting}
        className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
      >
        {exporting && exportType === 'pdf' ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Exportando...
          </>
        ) : (
          <>📄 Exportar PDF</>
        )}
      </button>
    </div>
  )
}
