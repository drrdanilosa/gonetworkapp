'use client'

'use client'

"use client"

import { useProjectsStore } from '@/store/useProjectsStore'
import { useEffect, useState } from 'react'
import { Comment } from '@/types/project'
import { User, MessageSquare } from 'lucide-react'

interface CommentOverlayProps {
  currentTime: number
  deliverableId: string
  projectId: string
  tolerance?: number // tolerância em segundos para mostrar comentários
  onClick?: (comment: Comment) => void // Callback para clicar em um comentário
}

export default function CommentOverlay({
  currentTime,
  deliverableId,
  projectId,
  tolerance = 1.5,
  onClick,
}: CommentOverlayProps) {
  const project = useProjectsStore(s => s.currentProject)
  const [visibleComments, setVisibleComments] = useState<Comment[]>([])
  const [fadeOut, setFadeOut] = useState<Record<string, boolean>>({})

  // Efeito para destacar comentários próximos do timestamp atual
  useEffect(() => {
    if (!project) return

    // Buscar o deliverable pelo ID
    const deliverable = project.videos.find(v => v.id === deliverableId)
    if (!deliverable) return

    // Filtrar comentários não resolvidos próximos ao tempo atual
    const activeComments = (deliverable.comments || [])
      .filter(
        c => !c.resolved && Math.abs(c.timestamp - currentTime) < tolerance
      )
      .sort(
        (a, b) =>
          Math.abs(a.timestamp - currentTime) -
          Math.abs(b.timestamp - currentTime)
      )

    // Limitar a 3 comentários para não sobrecarregar a tela
    const limitedComments = activeComments.slice(0, 3)

    // Criar novo objeto para o estado de fade out
    const newFadeOut: Record<string, boolean> = {}

    // Para comentários que estão saindo (não estão mais na lista ativa)
    visibleComments.forEach(comment => {
      if (!limitedComments.find(c => c.id === comment.id)) {
        newFadeOut[comment.id] = true
      }
    })

    setFadeOut(newFadeOut)

    // Atualizar comentários visíveis após o fade out
    const timeoutId = setTimeout(
      () => {
        setVisibleComments(limitedComments)
      },
      Object.keys(newFadeOut).length ? 300 : 0
    )

    return () => clearTimeout(timeoutId)
  }, [currentTime, project, deliverableId, tolerance])

  // Manipular clique em um comentário
  const handleCommentClick = (comment: Comment) => {
    if (onClick) {
      onClick(comment)
    }
  }

  if (!visibleComments.length) return null

  return (
    <div className="absolute top-12 right-5 z-50 space-y-2 max-w-[350px]">
      {visibleComments.map(comment => (
        <div
          key={comment.id}
          onClick={() => handleCommentClick(comment)}
          className={`
            bg-black/70 text-white p-3 rounded-md shadow-lg
            border-l-4 border-yellow-500 cursor-pointer
            transition-all duration-300 transform hover:scale-[1.02]
            ${fadeOut[comment.id] ? 'opacity-0 translate-x-5' : 'opacity-100'}
          `}
        >
          <div className="flex items-center justify-between text-xs text-yellow-400 mb-1">
            <div className="flex items-center gap-1">
              <MessageSquare size={14} />
              <span>Comentário em {formatTime(comment.timestamp)}</span>
            </div>

            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{comment.userName || 'Usuário'}</span>
            </div>
          </div>

          <div className="text-sm">{comment.content}</div>

          <div className="text-xs mt-2 text-gray-300">
            Clique para mostrar detalhes
          </div>
        </div>
      ))}
    </div>
  )
}

// Formata segundos para MM:SS
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
