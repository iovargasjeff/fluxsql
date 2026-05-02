'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Link, Loader2 } from 'lucide-react'
import { togglePublicAction } from '@/actions/projects/togglePublic'

interface PublicShareToggleProps {
  diagramId: string
  initialIsPublic: boolean
}

export function PublicShareToggle({ diagramId, initialIsPublic }: PublicShareToggleProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    if (loading) return

    setLoading(true)
    const newVal = !isPublic

    try {
      const result = await togglePublicAction(diagramId, newVal)
      if (result.error) {
        toast.error(result.error)
      } else {
        if (newVal === true) {
          const url = window.location.origin + result.publicUrl
          navigator.clipboard.writeText(url).catch(() => {})
          toast.success('Link público copiado al portapapeles')
        } else {
          toast.info('El diagrama ahora es privado')
        }
        setIsPublic(newVal)
      }
    } catch (err) {
      toast.error('Error inesperado al cambiar privacidad')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 mr-4">
      <div className="flex flex-col items-end mr-2 hidden sm:flex">
        <span className="text-sm font-medium text-[#E2E8F0]">Enlace público</span>
        <span className="text-[10px] text-[#94A3B8]">Cualquiera con el link</span>
      </div>
      
      <button
        type="button"
        role="switch"
        aria-checked={isPublic}
        disabled={loading}
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A6CF6] disabled:cursor-not-allowed disabled:opacity-50 ${
          isPublic ? 'bg-[#1A6CF6]' : 'bg-[#374151]'
        }`}
      >
        <span className="sr-only">Habilitar enlace público</span>
        
        {loading ? (
          <span className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-lg ring-0 transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0'}`}>
            <Loader2 className="w-3 h-3 text-gray-500 animate-spin" />
          </span>
        ) : (
          <span
            className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-lg ring-0 transition-transform ${
              isPublic ? 'translate-x-5' : 'translate-x-0'
            }`}
          >
            {isPublic && <Link className="w-3 h-3 text-[#1A6CF6]" />}
          </span>
        )}
      </button>
    </div>
  )
}
