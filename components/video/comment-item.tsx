'use client'

'use client'

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Check, Clock, Edit2, MessageSquare, Trash2, X } from 'lucide-react'
import type { Comment } from './comment-markers-timeline'

interface CommentItemProps {
  comment: Comment
  onResolve: (id: string) => void
  onReopen: (id: string) => void
  onEdit: (id: string, newText: string) => void
  onDelete: (id: string) => void
  onJumpToTime: (time: number) => void
}

export default function CommentItem({
  comment,
  onResolve,
  onReopen,
  onEdit,
  onDelete,
  onJumpToTime,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.text)

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEdit(comment.id, editText)
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditText(comment.text)
    setIsEditing(false)
  }

  return (
    <Card className={comment.isResolved ? 'border-success bg-success/5' : ''}>
      <CardContent className="space-y-2 p-3">
        <div className="flex justify-between">
          <div className="font-medium">{comment.author}</div>
          <div
            className="flex cursor-pointer items-center gap-1 text-sm text-muted-foreground"
            onClick={() => onJumpToTime(comment.time)}
          >
            <Clock className="size-3" />
            {formatTime(comment.time)}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              className="min-h-[80px]"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                <X className="mr-1 size-3" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                <Check className="mr-1 size-3" /> Salvar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm">{comment.text}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="size-3" />
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
              locale: ptBR,
            })}
            {comment.isResolved && ' (Resolvido)'}
          </div>

          <div className="flex gap-1">
            {!isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="size-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => onDelete(comment.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>

                {comment.isResolved ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-success text-success"
                    onClick={() => onReopen(comment.id)}
                  >
                    Reabrir
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResolve(comment.id)}
                  >
                    Resolver
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
