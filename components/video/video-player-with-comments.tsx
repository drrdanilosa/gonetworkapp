'use client'

'use client'

'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CheckCircle, MessageSquare, Flag } from 'lucide-react'
import type { Comment } from '@/types/project'

// Fallback interface para tornar o componente retro-compatível
interface VideoComment {
  id: string
  authorId?: string
  authorName?: string
  content: string
  timestamp: number
  createdAt: string
  resolved: boolean
  userId?: string
  userName?: string
}

interface VideoPlayerWithCommentsProps {
  src: string
  comments: (Comment | VideoComment)[]
  onAddComment: (content: string, timestamp: number) => void
  onResolveComment: (commentId: string) => void
}

export function VideoPlayerWithComments({
  src,
  comments,
  onAddComment,
  onResolveComment,
}: VideoPlayerWithCommentsProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [newCommentText, setNewCommentText] = useState('')
  const [newCommentTime, setNewCommentTime] = useState(0)
  const { toast } = useToast()

  // Atualizar duração quando o vídeo estiver carregado
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [src])

  // Atualizar tempo atual durante a reprodução
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [])

  // Parar o vídeo quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [])

  // Controlar play/pause
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Atualizar quando o play/pause for alterado
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [])

  // Controlar volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  // Controlar a barra de progresso
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  // Clicar na timeline para adicionar comentário
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const position = (e.clientX - rect.left) / rect.width
    const newTime = position * duration

    if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
  }

  // Abrir diálogo para adicionar comentário
  const openCommentDialog = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
      setNewCommentTime(videoRef.current.currentTime)
      setShowCommentDialog(true)
    }
  }

  // Submeter novo comentário
  const handleSubmitComment = () => {
    if (newCommentText.trim()) {
      onAddComment(newCommentText, newCommentTime)
      toast({
        title: 'Comentário adicionado',
        description: `Seu comentário foi adicionado em ${formatTime(newCommentTime)}.`,
      })
      setNewCommentText('')
      setShowCommentDialog(false)
    }
  }

  // Formatador de tempo (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full space-y-2">
      {/* Container de vídeo */}
      <div className="relative w-full overflow-hidden rounded-lg bg-black">
        <video
          ref={videoRef}
          src={src}
          className="w-full"
          controls={false}
          onEnded={() => setIsPlaying(false)}
        />
      </div>

      {/* Controles do player */}
      <div className="w-full space-y-2">
        {/* Barra de progresso e comentários */}
        <div className="relative">
          <div
            ref={timelineRef}
            className="relative h-6 cursor-pointer rounded-full bg-secondary/40"
            onClick={handleTimelineClick}
          >
            {/* Progresso do vídeo */}
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-primary/30"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />

            {/* Marcadores de comentários */}
            {comments.map(comment => (
              <div
                key={comment.id}
                className={`absolute top-0 h-full w-1 cursor-pointer ${comment.resolved ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{ left: `${(comment.timestamp / duration) * 100}%` }}
                onClick={e => {
                  e.stopPropagation()
                  if (videoRef.current) {
                    videoRef.current.currentTime = comment.timestamp
                  }
                }}
              />
            ))}

            {/* Tempo atual/duração total */}
            <div className="absolute -bottom-6 left-0 text-xs">
              {formatTime(currentTime)}
            </div>
            <div className="absolute -bottom-6 right-0 text-xs">
              {formatTime(duration)}
            </div>
          </div>

          {/* Input da barra de progresso (acima da visualização) */}
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleProgressChange}
            className="absolute left-0 top-0 h-6 w-full cursor-pointer opacity-0"
            style={{ zIndex: 10 }}
          />
        </div>

        {/* Botões de controle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="px-2"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>

            <div className="flex items-center gap-1">
              <span className="text-xs">Volume:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20"
              />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={openCommentDialog}
            className="flex items-center gap-1"
          >
            <MessageSquare className="size-4" />
            <span>Adicionar Comentário</span>
          </Button>
        </div>
      </div>

      {/* Lista de comentários */}
      <div className="mt-4 space-y-3">
        <h3 className="font-medium">Comentários ({comments.length})</h3>

        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum comentário ainda. Adicione o primeiro!
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map(comment => (
              <div
                key={comment.id}
                className={`rounded-lg border p-3 ${comment.resolved ? 'bg-muted/30' : 'bg-card'}`}
              >
                <div className="mb-1 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = comment.timestamp
                        }
                      }}
                    >
                      {formatTime(comment.timestamp)}
                    </Badge>
                    <span className="text-sm font-medium">
                      {comment.authorName || comment.userName || 'Usuário'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {!comment.resolved && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => onResolveComment(comment.id)}
                          >
                            <CheckCircle className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Marcar como resolvido</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {comment.resolved && (
                    <Badge
                      variant="outline"
                      className="border-green-300 bg-green-100 text-green-800"
                    >
                      Resolvido
                    </Badge>
                  )}
                </div>

                <p className="whitespace-pre-wrap text-sm">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo para adicionar comentário */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Comentário</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Adicionando comentário no tempo{' '}
              <strong>{formatTime(newCommentTime)}</strong>
            </p>

            <Textarea
              placeholder="Digite seu comentário aqui..."
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={handleSubmitComment}
              disabled={!newCommentText.trim()}
            >
              Adicionar Comentário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
