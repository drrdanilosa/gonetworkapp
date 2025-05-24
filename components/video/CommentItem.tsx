'use client'

'use client'

'use client'

import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { useAuthStore } from '@/store/useAuthStore'
import { Check, MessageSquare, CornerRightDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CommentItemProps {
  projectId: string
  deliverableId: string
  comment: {
    id: string
    userId: string
    content: string
    timestamp: number
    createdAt: string
    resolved: boolean
    authorName?: string
  }
}

export function CommentItem({
  projectId,
  deliverableId,
  comment,
}: CommentItemProps) {
  const markCommentResolved = useProjectsStore(
    state => state.markCommentResolved
  )
  const currentUser = useAuthStore(state => state.user)
  const isEditor = currentUser?.role === 'editor'

  // Formata timestamp (segundos) para mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Formata a data para exibir
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return (
    <div
      className={cn(
        'relative mb-3 rounded-lg border p-3',
        comment.resolved
          ? 'border-green-200 bg-muted/30 dark:border-green-900'
          : 'bg-card'
      )}
    >
      {comment.resolved && (
        <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4">
          <div className="rounded-full bg-green-500 p-1 text-white">
            <Check size={12} />
          </div>
        </div>
      )}
      <div className="mb-1.5 flex items-center gap-2">
        <MessageSquare
          size={16}
          className={cn(
            comment.resolved ? 'text-green-600' : 'text-muted-foreground'
          )}
        />
        <span className="text-sm font-medium">
          {comment.authorName || 'Usuário'}
        </span>
        <span className="text-xs text-muted-foreground">
          • {formatDate(comment.createdAt)}
        </span>

        {comment.timestamp > 0 && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
            @ {formatTime(comment.timestamp)}
          </span>
        )}
      </div>

      <p className="mb-2 text-sm">{comment.content}</p>

      <div className="flex items-center justify-between">
        <div
          className={cn(
            'flex items-center text-xs',
            comment.resolved ? 'text-green-600' : 'text-muted-foreground'
          )}
        >
          {comment.resolved && (
            <>
              <Check size={14} className="mr-1" />
              <span>Resolvido</span>
            </>
          )}
        </div>

        {isEditor && !comment.resolved && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              markCommentResolved(projectId, deliverableId, comment.id)
            }
            className="h-7 text-xs"
          >
            <Check size={14} className="mr-1" />
            Marcar como resolvido
          </Button>
        )}
      </div>
    </div>
  )
}
