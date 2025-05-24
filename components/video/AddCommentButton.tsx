'use client'

'use client'

'use client'

import { Button } from '@/components/ui/button'
import { MessageSquarePlus, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

interface AddCommentButtonProps {
  onClick: () => void
  time?: number // tempo atual do vídeo, opcional
  className?: string
  isPaused?: boolean // Se o vídeo está pausado
}

export default function AddCommentButton({
  onClick,
  time,
  className = '',
  isPaused = false,
}: AddCommentButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  // Mostrar tooltip brevemente quando o vídeo for pausado
  useEffect(() => {
    if (isPaused) {
      setShowTooltip(true)
      const timeout = setTimeout(() => {
        setShowTooltip(false)
      }, 3000)

      return () => clearTimeout(timeout)
    }
  }, [isPaused])

  return (
    <div className="absolute right-4 top-4 z-50">
      {showTooltip && (
        <div className="mb-2 animate-fade-in rounded-md bg-black/80 p-2 text-xs text-white">
          Vídeo pausado. Deseja adicionar um comentário neste momento?
        </div>
      )}

      <Button
        onClick={onClick}
        variant="secondary"
        size="sm"
        className={`group relative bg-purple-600 text-white transition-all hover:bg-purple-700 ${className}`}
      >
        <MessageSquarePlus className="mr-2 size-4" />
        <span>
          {time !== undefined ? (
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {formatTime(time)}
            </span>
          ) : (
            'Adicionar Comentário'
          )}
        </span>

        {/* Efeito de pulso quando o vídeo está pausado */}
        {isPaused && (
          <span className="absolute -inset-1 animate-pulse rounded-full bg-purple-500/30"></span>
        )}
      </Button>
    </div>
  )
}

// Formata segundos para MM:SS
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
