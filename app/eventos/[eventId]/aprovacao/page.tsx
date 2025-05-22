'use client'

'use client'

"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Check,
  X,
  ArrowLeft,
  Clock,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
import DeliveryWidget from '@/components/widgets/DeliveryWidget'
import AssetsWidget from '@/components/widgets/AssetsWidget'
import RoleGuard from '@/components/auth/RoleGuard'
import dynamic from 'next/dynamic'
import VideoComments from '@/components/video/VideoComments'
import VideoErrorDisplay from '@/components/video/VideoErrorDisplay'

// Importação dinâmica do componente de player para evitar problemas de SSR
const VideoPlayer = dynamic(() => import('@/components/video/VideoPlayer'), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-muted animate-pulse rounded-md" />
  ),
})

// Componente para página de Aprovação
export default function ApprovalPage() {
  const { eventId } = useParams() as { eventId: string }
  const router = useRouter()
  const {
    projects,
    currentProject,
    approveVideoVersion,
    addComment,
    setCommentResolved,
  } = useProjectsStore()
  const { user } = useAuthStore()
  const { addNotification } = useUIStore()
  const [rejectReason, setRejectReason] = useState('')
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null
  )
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('revisao')

  // Carregar projeto ao montar o componente
  useEffect(() => {
    const project = projects.find(p => p.id === eventId)
    if (project) {
      setCurrentProject(project)
      // Limpar erros ao carregar um projeto
      setLoadError(null)
    } else {
      setLoadError('Projeto não encontrado')
      addNotification('Projeto não encontrado', 'error')
      // Não redirecionamos imediatamente para permitir que o usuário veja a mensagem de erro
    }
  }, [eventId, projects, setCurrentProject, addNotification])

  // Se ocorrer um erro de carregamento
  if (loadError) {
    return (
      <div className="container mx-auto p-4">
        <VideoErrorDisplay
          error={loadError}
          title="Erro ao carregar o projeto"
          retryAction={() => router.push('/eventos')}
        />
      </div>
    )
  }

  // Se não tiver projeto
  if (!currentProject) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Verificar se o projeto tem vídeos
  const deliverable = currentProject.videos?.[0]
  if (!deliverable || !deliverable.versions?.length) {
    return (
      <div className="container mx-auto p-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/eventos/${eventId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Aprovação de Vídeos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
              <h2 className="text-xl font-semibold">
                Nenhum vídeo disponível para aprovação
              </h2>
              <p className="text-muted-foreground mt-2">
                Ainda não há vídeos exportados para este projeto. Os vídeos
                serão exibidos aqui automaticamente quando forem detectados pelo
                watcher.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Obter a versão selecionada ou mais recente
  const selectedVersion = selectedVersionId
    ? deliverable.versions.find(v => v.id === selectedVersionId)
    : deliverable.versions[deliverable.versions.length - 1]

  // Função para aprovar um vídeo
  const handleApprove = () => {
    if (!selectedVersion) return
    approveVideoVersion(
      currentProject.id,
      deliverable.id,
      selectedVersion.id,
      user?.name || 'Cliente'
    )
    // Adicionar um comentário automático de aprovação
    addComment(
      currentProject.id,
      deliverable.id,
      'Vídeo aprovado ✅',
      0,
      user?.id,
      user?.name || 'Cliente'
    )
  }

  // Função para rejeitar um vídeo
  const handleReject = () => {
    if (!selectedVersion) return
    rejectVideoVersion(
      currentProject.id,
      deliverable.id,
      selectedVersion.id,
      rejectReason
    )
    // Adicionar um comentário automático com o motivo da rejeição
    if (rejectReason.trim()) {
      addComment(
        currentProject.id,
        deliverable.id,
        `Alterações solicitadas: ${rejectReason}`,
        0,
        user?.id,
        user?.name || 'Cliente'
      )
    }
    setRejectReason('')
  }

  // Função para adicionar comentário no vídeo
  const handleAddComment = (content: string, timestamp?: number) => {
    if (!selectedVersion) return
    addComment(
      currentProject.id,
      deliverable.id,
      content,
      timestamp || 0,
      user?.id,
      user?.name || 'Cliente'
    )
  }

  // Verificar se é o usuário tem permissão para aprovar/rejeitar
  const isClient = user?.role === 'client'
  const canApprove = isClient || user?.role === 'admin'

  return (
    <RoleGuard
      allowedRoles={['admin', 'editor', 'client']}
      fallback={
        <div className="container mx-auto p-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p>Você não tem permissão para acessar esta página.</p>
                <p className="text-muted-foreground mt-2">
                  Entre em contato com o administrador para solicitar acesso.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/eventos/${eventId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Projeto
          </Button>
          <h1 className="text-2xl font-bold">
            {currentProject.name || 'Sem nome'}
          </h1>
        </div>

        <Tabs
          defaultValue="revisao"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="revisao">Revisão e Aprovação</TabsTrigger>
            <TabsTrigger value="historico">
              Histórico de Comentários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revisao">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Player de vídeo e controles */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <span>Vídeo para Aprovação</span>
                      <span className="text-sm text-muted-foreground">
                        Versão: {selectedVersion?.name || 'Mais recente'}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Avalie o vídeo e forneça feedback ou aprovação
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedVersion && (
                      <>
                        {' '}
                        <VideoPlayer
                          src={selectedVersion.url}
                          poster={selectedVersion.thumbnailUrl || undefined}
                          autoPlay={false}
                          allowFullscreen={true}
                        />
                        {/* Seleção de versões */}
                        {deliverable.versions.length > 1 && (
                          <div className="mt-4">
                            <h3 className="text-sm font-medium mb-2">
                              Versões Disponíveis:
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {deliverable.versions.map((version, index) => (
                                <Button
                                  key={version.id}
                                  variant={
                                    version.id === selectedVersion.id
                                      ? 'default'
                                      : 'outline'
                                  }
                                  size="sm"
                                  onClick={() =>
                                    setSelectedVersionId(version.id)
                                  }
                                >
                                  {version.name || `v${index + 1}`}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Área de aprovação/rejeição para clientes */}
                        {canApprove && (
                          <div className="mt-6 border rounded-md p-4">
                            <h3 className="font-medium mb-2">
                              Decisão de Aprovação
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Você pode aprovar esta versão do vídeo ou
                              solicitar alterações
                            </p>

                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="outline"
                                className="w-1/2 bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                                onClick={handleApprove}
                              >
                                <ThumbsUp className="mr-2 h-4 w-4" />
                                Aprovar Vídeo
                              </Button>

                              <Button
                                variant="outline"
                                className="w-1/2 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                                onClick={handleReject}
                              >
                                <ThumbsDown className="mr-2 h-4 w-4" />
                                Solicitar Alterações
                              </Button>
                            </div>

                            <textarea
                              className="w-full mt-2 p-2 border rounded-md"
                              placeholder="Descreva aqui as alterações necessárias (opcional)"
                              rows={3}
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                            />
                          </div>
                        )}
                        {/* Informações de status para editores */}
                        {!canApprove && (
                          <div className="mt-6 border rounded-md p-4">
                            <h3 className="font-medium mb-2">
                              Status de Aprovação
                            </h3>
                            <div className="flex items-center">
                              <Clock className="mr-2 h-5 w-5 text-yellow-500" />
                              <span>Aguardando aprovação do cliente</span>
                            </div>
                          </div>
                        )}
                        {/* Área de comentários */}
                        <div className="mt-6">
                          <h3 className="font-medium mb-2">
                            Adicionar comentário
                          </h3>
                          <VideoComments
                            comments={
                              deliverable.comments?.map(comment => ({
                                ...comment,
                                author: comment.author || 'Desconhecido',
                              })) || []
                            }
                            versionId={selectedVersion.id}
                            onAddComment={handleAddComment}
                            onResolveComment={(commentId, resolved) =>
                              setCommentResolved(
                                currentProject.id,
                                deliverable.id,
                                commentId,
                                resolved
                              )
                            }
                            height="300px"
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Widgets de entrega e assets */}
              <div>
                <DeliveryWidget
                  projectId={currentProject.id}
                  deliverableId={deliverable.id}
                />
                <div className="mt-4">
                  <AssetsWidget projectId={currentProject.id} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="historico">
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Comentários e Feedback</CardTitle>
                  <CardDescription>
                    Todos os comentários e feedback recebidos para este vídeo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VideoComments
                    comments={
                      deliverable.comments?.map(comment => ({
                        ...comment,
                        author: comment.author || 'Desconhecido',
                      })) || []
                    }
                    onResolveComment={(commentId, resolved) =>
                      setCommentResolved(
                        currentProject.id,
                        deliverable.id,
                        commentId,
                        resolved
                      )
                    }
                    height="500px"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  )
}
