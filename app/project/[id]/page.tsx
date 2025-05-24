'use client'

'use client'

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
import { CheckCircle, FileVideo, Clock } from 'lucide-react'

import type { Comment } from '@/types/project'

export default function EditingPage({ params }: { params: { id: string } }) {
  const { user } = useAuthStore()
  const {
    currentProject,
    selectProject,
    _addVideoVersion,
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
  const [commentText, setCommentText] = useState('')
  const [feedbackText, setFeedbackText] = useState('')
  const [activeTab, setActiveTab] = useState('videos')

  useEffect(() => {
    // Carrega o projeto com base no ID da URL
    if (params.id) {
      selectProject(params.id)
    }
  }, [params.id, selectProject])

  // Coloque todos os useEffect antes de qualquer retorno condicional
  useEffect(() => {
    if (
      currentProject &&
      currentProject.videos.length > 0 &&
      !selectedDeliverableId
    ) {
      setSelectedDeliverableId(currentProject.videos[0].id)
    }
  }, [currentProject, selectedDeliverableId, setSelectedDeliverableId])

  // Se não houver projeto selecionado, mostra mensagem de carregamento
  if (!currentProject) {
    return <div className="p-4">Carregando projeto...</div>
  }

  // Obtém o deliverable ativo
  const activeDeliverable = selectedDeliverableId
    ? currentProject.videos.find(v => v.id === selectedDeliverableId)
    : currentProject.videos[0]

  if (!activeDeliverable) {
    return <div className="p-4">Nenhum vídeo encontrado neste projeto.</div>
  }

  // Obtém a versão ativa do vídeo
  const activeVersion =
    activeDeliverable.versions.find(v => v.active) ||
    (activeDeliverable.versions.length > 0
      ? activeDeliverable.versions[activeDeliverable.versions.length - 1]
      : null)

  const handleAddComment = (timestamp: number) => {
    if (!commentText.trim()) return

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      projectId: currentProject.id,
      deliverableId: activeDeliverable.id,
      userId: user?.id || 'unknown',
      userName: user?.name || 'Usuário',
      timestamp,
      content: commentText,
      createdAt: new Date().toISOString(),
      resolved: false,
    }

    addComment(newComment)
    setCommentText('')
    toast({
      title: 'Comentário adicionado',
      description: 'Seu comentário foi adicionado com sucesso ao vídeo.',
    })
  }

  const handleResolveComment = (commentId: string) => {
    markCommentResolved(currentProject.id, activeDeliverable.id, commentId)
    toast({
      title: 'Comentário resolvido',
      description: 'O comentário foi marcado como resolvido.',
    })
  }

  const handleRequestChanges = () => {
    requestChanges(currentProject.id, activeDeliverable.id, feedbackText)
    setFeedbackText('')
    toast({
      title: 'Alterações solicitadas',
      description: 'Sua solicitação de alterações foi enviada com sucesso.',
    })
  }

  const handleApprove = () => {
    if (activeVersion) {
      approveVideoVersion(
        currentProject.id,
        activeDeliverable.id,
        activeVersion.id,
        user?.name
      )
      toast({
        title: 'Vídeo aprovado',
        description: 'O vídeo foi aprovado com sucesso!',
      })
    }
  }

  const handleMarkReady = () => {
    markVideoReady(currentProject.id, activeDeliverable.id)
    toast({
      title: 'Vídeo pronto para revisão',
      description: 'O vídeo foi marcado como pronto para revisão pelo cliente.',
    })
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'editing':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Em edição
          </Badge>
        )
      case 'ready_for_review':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Pronto para revisão
          </Badge>
        )
      case 'changes_requested':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Alterações solicitadas
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Aprovado
          </Badge>
        )
      default:
        return <Badge variant="outline">Status desconhecido</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{currentProject.name}</h1>
            <p className="text-gray-500">
              Criado em{' '}
              {new Date(currentProject.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Tabs
          defaultValue="videos"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
            <TabsTrigger value="review">Revisão & Aprovação</TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="space-y-4">
            {activeVersion ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <VideoPlayerWithComments
                    videoSrc={activeVersion.url}
                    comments={activeDeliverable.comments || []}
                    onAddComment={handleAddComment}
                    onResolveComment={handleResolveComment}
                  />
                  <div className="mt-4">
                    <Textarea
                      placeholder="Digite seu comentário sobre o vídeo..."
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      className="w-full"
                    />
                    <div className="mt-2 flex justify-end">
                      <Button onClick={() => handleAddComment(0)}>
                        Adicionar Comentário Geral
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações do Vídeo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Título:</span>
                          <span>{activeDeliverable.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Versão:</span>
                          <span>{activeVersion.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Status:</span>
                          <span>
                            {getStatusBadge(activeDeliverable.status)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Enviado em:</span>
                          <span>
                            {new Date(
                              activeVersion.uploadedAt
                            ).toLocaleString()}
                          </span>
                        </div>
                        {activeVersion.approved && (
                          <div className="flex justify-between">
                            <span className="font-medium">Aprovado por:</span>
                            <span>
                              {activeVersion.approvedBy} em{' '}
                              {new Date(
                                activeVersion.approvedAt!
                              ).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Versões Disponíveis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {activeDeliverable.versions.map(version => (
                          <div
                            key={version.id}
                            className="flex items-center space-x-2"
                          >
                            <Button
                              variant={version.active ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                // Selecionar esta versão
                                setActiveVideoVersion(
                                  currentProject.id,
                                  activeDeliverable.id,
                                  version.id
                                )
                              }}
                            >
                              {version.name}
                            </Button>
                            {version.approved && (
                              <CheckCircle className="size-4 text-green-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <FileVideo className="mx-auto size-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">
                  Nenhuma versão disponível
                </h3>
                <p className="mt-2 text-gray-500">
                  Este entregável ainda não possui nenhuma versão de vídeo.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revisão e Aprovação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-lg font-medium">Status Atual</h3>
                    <div className="mb-4 flex items-center space-x-2">
                      {getStatusBadge(activeDeliverable.status)}
                      {activeDeliverable.status === 'approved' && (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="mr-1 size-4" />
                          Aprovado
                        </span>
                      )}
                      {activeDeliverable.status === 'ready_for_review' && (
                        <span className="flex items-center text-blue-600">
                          <Clock className="mr-1 size-4" />
                          Aguardando aprovação
                        </span>
                      )}
                    </div>

                    <h3 className="mb-2 text-lg font-medium">Ações</h3>
                    <div className="flex flex-wrap gap-2">
                      {activeDeliverable.status === 'editing' && (
                        <Button onClick={handleMarkReady}>
                          Marcar como Pronto para Revisão
                        </Button>
                      )}
                      {activeDeliverable.status === 'ready_for_review' && (
                        <>
                          <Button
                            variant="default"
                            onClick={handleApprove}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Aprovar Vídeo
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setActiveTab('feedback')}
                          >
                            Solicitar Alterações
                          </Button>
                        </>
                      )}
                      {activeDeliverable.status === 'changes_requested' && (
                        <Button disabled>
                          Aguardando Implementação de Alterações
                        </Button>
                      )}
                      {activeDeliverable.status === 'approved' && (
                        <Button disabled className="bg-green-600">
                          <CheckCircle className="mr-2 size-4" />
                          Aprovado
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-lg font-medium">Feedback</h3>
                    <Textarea
                      placeholder="Descreva seu feedback ou solicitações de alterações aqui..."
                      value={feedbackText}
                      onChange={e => setFeedbackText(e.target.value)}
                      className="min-h-[150px]"
                    />
                    <div className="mt-2 flex justify-end">
                      <Button
                        onClick={handleRequestChanges}
                        disabled={
                          !feedbackText ||
                          activeDeliverable.status === 'approved'
                        }
                      >
                        Enviar Solicitação de Alterações
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
