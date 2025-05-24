'use client'

import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { useEffect, useState } from 'react'
import { Comment, Project, VideoDeliverable } from '@/types/project'
import { User, MessageSquare } from 'lucide-react'

interface CommentOverlayProps {
  currentTime: number
  deliverableId: string
  projectId?: string // Tornando opcional para corrigir o erro
  tolerance?: number // tolerância em segundos para mostrar comentários
  onClick?: (comment: Comment) => void // Callback para clicar em um comentário
}

export default function CommentOverlay({
  currentTime,
  deliverableId,
  tolerance = 1.5,
  onClick,
}: CommentOverlayProps) {
  const project = useProjectsStore((s) => s.currentProject as Project)
  const [visibleComments, setVisibleComments] = useState<Comment[]>([])
  const [fadeOut, setFadeOut] = useState<Record<string, boolean>>({})

  // Efeito para destacar comentários próximos do timestamp atual
  useEffect(() => {
    if (!project) return

    // Buscar o deliverable pelo ID
    const deliverable = project.videos.find((v: VideoDeliverable) => v.id === deliverableId)
    if (!deliverable) return

    // Filtrar comentários não resolvidos próximos ao tempo atual
    const activeComments = (deliverable.comments || [])
      .filter(
        (c: Comment) =>
          !c.resolved && Math.abs(c.timestamp - currentTime) < tolerance
      )
      .sort(
        (a: Comment, b: Comment) =>
          Math.abs(a.timestamp - currentTime) -
          Math.abs(b.timestamp - currentTime)
      )

    // Limitar a 3 comentários para não sobrecarregar a tela
    const limitedComments = activeComments.slice(0, 3)

    // Criar novo objeto para o estado de fade out
    const newFadeOut: Record<string, boolean> = {}

    // Para comentários que estão saindo (não estão mais na lista ativa)
    visibleComments.forEach(comment => {
      if (!limitedComments.find((c: Comment) => c.id === comment.id)) {
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
  }, [
    currentTime,
    project,
    deliverableId,
    tolerance,
    visibleComments,
    setVisibleComments,
  ])

  // Manipular clique em um comentário
  const handleCommentClick = (comment: Comment) => {
    if (onClick) {
      onClick(comment)
    }
  }

  if (!visibleComments.length) return null

  return (
    <div className="absolute right-5 top-12 z-50 max-w-[350px] space-y-2">
      {visibleComments.map(comment => (
        <div
          key={comment.id}
          onClick={() => handleCommentClick(comment)}
          className={`
            cursor-pointer rounded-md border-l-4 border-yellow-500 bg-black/70
            p-3 text-white shadow-lg
            transition-all duration-300 hover:scale-[1.02]
            ${fadeOut[comment.id] ? 'translate-x-5 opacity-0' : 'opacity-100'}
          `}
        >
          <div className="mb-1 flex items-center justify-between text-xs text-yellow-400">
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

          <div className="mt-2 text-xs text-gray-300">
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
