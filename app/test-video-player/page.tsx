'use client'

'use client'

'use client'

import { useState } from 'react'
import { VideoPlayerWithComments } from '@/components/video/video-player-with-comments'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function TestVideoPlayer() {
  const { toast } = useToast()
  const [comments, setComments] = useState([
    {
      id: '1',
      authorName: 'Tester',
      userId: 'tester',
      content: 'Este é um comentário de teste',
      timestamp: 5,
      createdAt: new Date().toISOString(),
      resolved: false,
    },
  ])

  // Função para adicionar um comentário
  const handleAddComment = (content: string, timestamp: number) => {
    const newComment = {
      id: `comment_${Date.now()}`,
      authorName: 'Tester',
      userId: 'tester',
      content,
      timestamp,
      createdAt: new Date().toISOString(),
      resolved: false,
    }

    setComments([...comments, newComment])
    toast({
      title: 'Comentário adicionado',
      description: `Comentário adicionado em ${Math.floor(timestamp / 60)}:${String(Math.floor(timestamp % 60)).padStart(2, '0')}`,
    })
  }

  // Função para marcar um comentário como resolvido
  const handleResolveComment = (commentId: string) => {
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          resolved: true,
        }
      }
      return comment
    })

    setComments(updatedComments)
    toast({
      title: 'Comentário resolvido',
      description: 'O comentário foi marcado como resolvido.',
    })
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">
        Teste do VideoPlayerWithComments
      </h1>

      <div className="mx-auto max-w-4xl">
        <VideoPlayerWithComments
          src="/exemplo.mp4" // Substitua pelo caminho correto de um vídeo de exemplo
          comments={comments}
          onAddComment={handleAddComment}
          onResolveComment={handleResolveComment}
        />
      </div>

      <div className="mt-8">
        <Button
          onClick={() => {
            setComments([])
            toast({
              title: 'Comentários limpos',
              description: 'Todos os comentários foram removidos.',
            })
          }}
        >
          Limpar Comentários
        </Button>
      </div>
    </div>
  )
}
