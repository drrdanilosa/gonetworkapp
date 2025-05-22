// components/video/VideoComments.tsx
'use client'

"use client"

import React, { useState } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { MessageSquare, Send, User, Clock, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store/useAuthStore'

interface VideoComment {
  id: string
  content: string
  author: string
  createdAt: string
  versionId?: string
  timestamp?: number
  resolved?: boolean
}

interface VideoCommentsProps {
  comments: VideoComment[]
  versionId?: string
  onAddComment?: (comment: string, timestamp?: number) => void
  onDeleteComment?: (commentId: string) => void
  onResolveComment?: (commentId: string, resolved: boolean) => void
  className?: string
  height?: string
}

export default function VideoComments({
  comments,
  versionId,
  onAddComment,
  onDeleteComment,
  onResolveComment,
  className = '',
  height = '300px',
}: VideoCommentsProps) {
  const [commentText, setCommentText] = useState('')
  const { user } = useAuthStore()

  // Filtrar comentários por versão se necessário
  const filteredComments = versionId
    ? comments.filter(
        comment => !comment.versionId || comment.versionId === versionId
      )
    : comments

  // Ordenar comentários (mais recentes primeiro)
  const sortedComments = [...filteredComments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Função para adicionar um comentário
  const handleAddComment = () => {
    if (!commentText.trim()) return

    onAddComment?.(commentText)
    setCommentText('')
  }

  // Função para lidar com a tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddComment()
    }
  }

  // Renderizar os comentários
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Comentários{' '}
          {sortedComments.length > 0 && `(${sortedComments.length})`}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Área de comentários */}
        <ScrollArea
          className={`w-full rounded-md border p-2`}
          style={{ height }}
        >
          {sortedComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="h-10 w-10 mb-2" />
              <p>Nenhum comentário ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedComments.map(comment => (
                <div
                  key={comment.id}
                  className={`p-3 rounded-lg ${
                    comment.resolved ? 'bg-gray-50 opacity-75' : 'bg-white'
                  } border`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="bg-slate-100 h-8 w-8 rounded-full flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium">{comment.author}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {format(
                              new Date(comment.createdAt),
                              "dd 'de' MMMM 'às' HH:mm",
                              { locale: pt }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {comment.timestamp && (
                        <Badge variant="outline" className="mr-2">
                          {new Date(comment.timestamp * 1000)
                            .toISOString()
                            .substr(11, 8)}
                        </Badge>
                      )}

                      {comment.resolved !== undefined && (
                        <Badge
                          variant={comment.resolved ? 'outline' : 'secondary'}
                          className="mr-2"
                        >
                          {comment.resolved ? 'Resolvido' : 'Pendente'}
                        </Badge>
                      )}

                      {onDeleteComment && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={() => onDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="whitespace-pre-wrap text-sm mt-2">
                    {comment.content}
                  </p>

                  {onResolveComment && comment.resolved !== undefined && (
                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onResolveComment(comment.id, !comment.resolved)
                        }
                      >
                        {comment.resolved
                          ? 'Marcar como não resolvido'
                          : 'Marcar como resolvido'}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Área para adicionar comentário */}
        {onAddComment && (
          <>
            <Separator className="my-4" />

            <div className="flex gap-2">
              <textarea
                className="flex-1 min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Digite seu comentário..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <Button
                className="self-end"
                onClick={handleAddComment}
                disabled={!commentText.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
