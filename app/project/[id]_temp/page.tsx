'use client'

'use client'

"use client"

import type React from 'react'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { VideoPlayerWithComments } from '@/components/video/video-player-with-comments'

import type { Comment } from '@/types/project'

export default function EditingPage({
  params,
}: {
  params: { eventId: string }
}) {
  const { user } = useAuthStore()
  const {
    currentProject,
    selectProject,
    addVideoVersion,
    approveVideoVersion,
    addComment,
    markCommentResolved,
    requestChanges,
    markVideoReady,
  } = useProjectsStore()
  const { toast } = useToast()

  const [selectedDeliverableId, setSelectedDeliverableId] = useState<
    string | null
  >(null)
  const [changeRequestText, setChangeRequestText] = useState('')
  const [showChangeRequestForm, setShowChangeRequestForm] = useState(false)

  // Garantir que o projeto correto esteja carregado
  useEffect(() => {
    selectProject(params.eventId)
  }, [params.eventId, selectProject])

  // Garantir que o projeto atual esteja carregado
  if (!currentProject) {
    return <div className="p-8 text-center">Carregando projeto...</div>
  }

  // Selecionar o primeiro deliverable por padrão
  useEffect(() => {
    if (!selectedDeliverableId && currentProject?.videos?.length > 0) {
      setSelectedDeliverableId(currentProject.videos[0].id)
    }
  }, [currentProject, selectedDeliverableId])

  const selectedDeliverable = currentProject.videos.find(
    v => v.id === selectedDeliverableId
  )
  const isEditor = user?.role === 'editor' || user?.role === 'admin'
  const isClient = user?.role === 'client' || user?.role === 'admin'

  // Manipular upload de arquivo para nova versão de vídeo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      !selectedDeliverableId ||
      !e.target.files ||
      e.target.files.length === 0
    )
      return
    const file = e.target.files[0]
    addVideoVersion(currentProject.id, selectedDeliverableId, file)
    toast({
      title: 'Vídeo enviado',
      description: 'Seu vídeo foi enviado com sucesso.',
    })
    e.target.value = ''
  }

  // Manipular marcação de vídeo como pronto para revisão
  const handleMarkReady = () => {
    if (!selectedDeliverableId) return
    markVideoReady(currentProject.id, selectedDeliverableId)
    toast({
      title: 'Vídeo pronto para revisão',
      description:
        'O cliente foi notificado que o vídeo está pronto para revisão.',
    })
  }

  // Manipular aprovação do vídeo
  const handleApprove = () => {
    if (!selectedDeliverableId) return
    approveVideoVersion(
      currentProject.id,
      selectedDeliverableId,
      selectedDeliverable?.versions.find(v => v.active)?.id || '',
      user?.name || 'Editor'
    )
    toast({
      title: 'Vídeo aprovado',
      description: 'O vídeo foi aprovado com sucesso.',
    })
  }

  // Manipular solicitação de mudanças com um comentário
  const handleRequestChanges = () => {
    if (!selectedDeliverableId || !changeRequestText.trim()) return
    requestChanges(currentProject.id, selectedDeliverableId, changeRequestText)
    toast({
      title: 'Mudanças solicitadas',
      description: 'Sua solicitação de mudanças foi enviada ao editor.',
    })
    setChangeRequestText('')
    setShowChangeRequestForm(false)
  }

  // Manipular adição de um novo comentário em um timestamp específico
  const handleAddComment = (content: string, timestamp: number) => {
    if (!selectedDeliverableId || !content.trim()) return
    // Criar um novo objeto de comentário
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      projectId: currentProject.id,
      deliverableId: selectedDeliverableId,
      userId: user?.id || '',
      userName: user?.name || 'Usuário',
      content,
      timestamp,
      createdAt: new Date().toISOString(),
      resolved: false,
    }
    addComment(newComment)
  }

  // Manipular resolução de um comentário
  const handleResolveComment = (commentId: string) => {
    if (!selectedDeliverableId) return
    markCommentResolved(currentProject.id, selectedDeliverableId, commentId)
    toast({
      title: 'Comentário resolvido',
      description: 'O comentário foi marcado como resolvido.',
    })
  }

  // Verificar se o deliverable tem versões
  const hasVersions =
    selectedDeliverable?.versions && selectedDeliverable.versions.length > 0
  // Obter a versão ativa ou a última versão
  const activeVersion =
    selectedDeliverable?.versions?.find(v => v.active) ||
    (hasVersions
      ? selectedDeliverable?.versions[selectedDeliverable.versions.length - 1]
      : null)

  return (
    <div className="p-4">
      <Tabs
        defaultValue={selectedDeliverableId || undefined}
        value={selectedDeliverableId || undefined}
        onValueChange={value => setSelectedDeliverableId(value)}
      >
        <TabsList>
          {currentProject.videos.map(video => (
            <TabsTrigger key={video.id} value={video.id}>
              {video.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {currentProject.videos.map(video => (
          <TabsContent key={video.id} value={video.id} className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">{video.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      video.versions?.some(v => v.approved)
                        ? 'success'
                        : 'default'
                    }
                  >
                    {video.versions?.some(v => v.approved)
                      ? 'Aprovado'
                      : 'Em edição'}
                  </Badge>
                </div>
              </div>

              {isEditor && !video.versions?.some(v => v.approved) && (
                <div className="flex items-center gap-2">
                  {/* Upload new video version */}
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>Enviar Vídeo</span>
                    </Button>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  {/* Mark as ready for review */}
                  {video.versions && video.versions.length > 0 && (
                    <Button size="sm" onClick={handleMarkReady}>
                      Marcar como Pronto para Revisão
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Comments/Change Request form for client */}
            {isClient && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowChangeRequestForm(true)}
                >
                  Solicitar Alterações
                </Button>
              </div>
            )}

            {showChangeRequestForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Solicitar Alterações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Descreva as alterações que você gostaria de solicitar..."
                      value={changeRequestText}
                      onChange={e => setChangeRequestText(e.target.value)}
                      rows={4}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowChangeRequestForm(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleRequestChanges}
                        disabled={!changeRequestText.trim()}
                      >
                        Enviar Solicitação
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video player with comments */}
            {hasVersions && activeVersion ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Versão {activeVersion.name}
                  </h3>
                  <VideoPlayerWithComments
                    src={activeVersion.url}
                    comments={video.comments || []}
                    onAddComment={handleAddComment}
                    onResolveComment={handleResolveComment}
                  />
                </div>
                {isClient && !video.versions?.some(v => v.approved) && (
                  <Button onClick={handleApprove}>Aprovar Vídeo</Button>
                )}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">
                  Nenhum vídeo enviado ainda
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isEditor
                    ? 'Envie um vídeo para iniciar o processo de revisão.'
                    : 'O editor ainda não enviou nenhum vídeo.'}
                </p>
                {isEditor && (
                  <label className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>Enviar Vídeo</span>
                    </Button>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
