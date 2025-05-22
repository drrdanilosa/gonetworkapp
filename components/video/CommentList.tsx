'use client'

'use client'

"use client"

import { useProjectsStore } from '@/store/useProjectsStore'
import { Comment } from '@/types/project'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CheckCircle,
  MessageSquare,
  Clock,
  User,
  Filter,
  Plus,
  ThumbsUp,
  Reply,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'

interface CommentListProps {
  deliverableId: string
  projectId: string
  videoRef?: React.RefObject<HTMLVideoElement> // referência ao elemento de vídeo para controlar playback
  onSeek?: (time: number) => void // alternativa ao videoRef
  onAddComment?: (time: number) => void // callback para adicionar comentário no tempo especificado
  defaultFilter?: 'all' | 'resolved' | 'unresolved'
}

export default function CommentList({
  deliverableId,
  projectId,
  videoRef,
  onSeek,
  onAddComment,
  defaultFilter = 'all',
}: CommentListProps) {
  const project = useProjectsStore(s => s.currentProject)
  const markCommentResolved = useProjectsStore(s => s.markCommentResolved)
  const addTimeComment = useProjectsStore(s => s.addTimeComment)
  const user = useAuthStore(s => s.user)
  const isEditor = user?.role === 'editor'

  const [filter, setFilter] = useState<'all' | 'resolved' | 'unresolved'>(
    defaultFilter
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  if (!project)
    return (
      <div className="text-sm text-muted-foreground">Carregando projeto...</div>
    )

  const deliverable = project.videos.find(v => v.id === deliverableId)
  if (!deliverable)
    return (
      <div className="text-sm text-muted-foreground">Vídeo não encontrado</div>
    )

  const comments = deliverable.comments || []

  // Filtrar comentários conforme solicitado
  const filteredComments = comments.filter(comment => {
    // Filtro por estado de resolução
    const matchesFilterState =
      filter === 'all'
        ? true
        : filter === 'resolved'
          ? comment.resolved
          : !comment.resolved

    // Filtro por texto de busca
    const matchesSearch =
      !searchTerm ||
      comment.content.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilterState && matchesSearch
  })

  // Ordenar: não resolvidos primeiro, depois por timestamp
  const sortedComments = [...filteredComments].sort((a, b) => {
    // Primeiro por status (não resolvidos primeiro)
    if (a.resolved !== b.resolved) {
      return a.resolved ? 1 : -1
    }
    // Depois por timestamp do vídeo
    return a.timestamp - b.timestamp
  })

  // Função para ir para o tempo do comentário
  const seekTo = (seconds: number) => {
    if (videoRef?.current) {
      videoRef.current.currentTime = seconds
      videoRef.current
        .play()
        .catch(e => console.error('Erro ao reproduzir:', e))
    } else if (onSeek) {
      onSeek(seconds)
    }
  }

  // Função para marcar como resolvido
  const handleResolveComment = (commentId: string) => {
    markCommentResolved(projectId, deliverableId, commentId)
  }

  // Função para responder a um comentário
  const handleReply = (commentId: string) => {
    if (!replyText.trim()) return

    // Buscar o comentário pai para pegar o timestamp
    const parentComment = comments.find(c => c.id === commentId)
    if (!parentComment) return

    // Adicionar resposta usando o mesmo timestamp do comentário original
    addTimeComment(
      projectId,
      deliverableId,
      `RE: ${replyText}`,
      parentComment.timestamp,
      user?.id || 'current-user',
      user?.name || 'Usuário'
    )

    // Limpar campo de resposta
    setReplyText('')
    setReplyingTo(null)
  }

  // Renderização vazia
  if (sortedComments.length === 0) {
    return (
      <div className="mt-4 p-6 border border-dashed rounded-md text-center text-muted-foreground">
        <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>Nenhum comentário neste vídeo ainda.</p>
        {onAddComment && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => onAddComment(0)}
          >
            Adicionar o primeiro comentário
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-2">
      <Tabs
        defaultValue={filter}
        onValueChange={value => setFilter(value as any)}
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">Todos ({comments.length})</TabsTrigger>
            <TabsTrigger value="unresolved">
              Pendentes ({comments.filter(c => !c.resolved).length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolvidos ({comments.filter(c => c.resolved).length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() =>
                onAddComment &&
                onAddComment(videoRef?.current?.currentTime || 0)
              }
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="text-xs">Novo</span>
            </Button>
          </div>
        </div>

        <div className="my-2">
          <Input
            placeholder="Buscar comentários..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        <TabsContent value="all" className="space-y-3 mt-2">
          {renderComments(sortedComments)}
        </TabsContent>
        <TabsContent value="unresolved" className="space-y-3 mt-2">
          {renderComments(sortedComments.filter(c => !c.resolved))}
        </TabsContent>
        <TabsContent value="resolved" className="space-y-3 mt-2">
          {renderComments(sortedComments.filter(c => c.resolved))}
        </TabsContent>
      </Tabs>
    </div>
  )

  // Função auxiliar para renderizar comentários
  function renderComments(comments: Comment[]) {
    if (comments.length === 0) {
      return (
        <div className="text-center text-sm text-muted-foreground py-4">
          Nenhum comentário encontrado com estes critérios.
        </div>
      )
    }

    return comments.map(comment => (
      <div
        key={comment.id}
        className={cn(
          'p-3 rounded-md shadow-sm border transition-colors',
          comment.resolved
            ? 'bg-muted/30 border-muted'
            : 'bg-card border-yellow-200 hover:border-yellow-300 dark:border-yellow-900 dark:hover:border-yellow-800'
        )}
      >
        <div className="flex justify-between items-start mb-2">
          <div
            className="flex items-center space-x-2 cursor-pointer hover:text-blue-500 transition-colors"
            onClick={() => seekTo(comment.timestamp)}
            title="Clique para ir para este momento no vídeo"
          >
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium bg-muted/50 px-1.5 py-0.5 rounded">
              {formatTime(comment.timestamp)}
            </span>
          </div>

          <div className="flex items-center text-xs text-muted-foreground">
            <User className="h-3 w-3 mr-1" />
            <span>{comment.userName || 'Usuário'}</span>
            <span className="mx-1">•</span>
            <span>
              {format(new Date(comment.createdAt), 'dd/MM/yy HH:mm', {
                locale: ptBR,
              })}
            </span>
          </div>
        </div>

        <p className="text-sm mb-2">{comment.content}</p>

        <div className="flex justify-between items-center mt-3">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() =>
                setReplyingTo(replyingTo === comment.id ? null : comment.id)
              }
            >
              <Reply className="h-3 w-3 mr-1" />
              Responder
            </Button>

            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <ThumbsUp className="h-3 w-3 mr-1" />
              Concordar
            </Button>
          </div>

          {comment.resolved ? (
            <div className="text-xs text-green-600 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span>Resolvido</span>
            </div>
          ) : isEditor ? (
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={() => handleResolveComment(comment.id)}
            >
              Marcar como resolvido
            </Button>
          ) : (
            <div className="ml-auto"></div> // Espaçador quando não tem botão
          )}
        </div>

        {/* Campo de resposta */}
        {replyingTo === comment.id && (
          <div className="mt-3 flex items-center gap-2">
            <Input
              placeholder="Escreva sua resposta..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              className="text-xs h-8"
              autoFocus
            />
            <Button
              size="sm"
              className="h-8"
              onClick={() => handleReply(comment.id)}
            >
              Enviar
            </Button>
          </div>
        )}
      </div>
    ))
  }
}

// Formata segundos para MM:SS
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
