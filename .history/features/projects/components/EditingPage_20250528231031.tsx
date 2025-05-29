'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Video, MessageSquare, Check, X } from 'lucide-react'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { useUIStore } from '@/store/useUIStore'
import VideoUploader from '@/components/video/VideoUploader'
import EventSelector from '@/components/project/EventSelector'
import { toast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

export default function EditingPage() {
  const [activeTab, setActiveTab] = useState<string>('videos')
  const [aspectRatio, setAspectRatio] = useState('16:9')

  const { projects, addVideoToProject, updateDeliverableStatus } =
    useProjectsStore()
  const { selectedEventId } = useUIStore()

  const selectedProject = projects.find(p => p.id === selectedEventId)
  const videoDeliverables =
    selectedProject?.deliverables?.filter(d => d.type === 'video') || []

  // Função para obter classes CSS baseadas na proporção dos cards de vídeo
  const getVideoCardClasses = () => {
    const baseClasses = 'bg-black'

    switch (aspectRatio) {
      case '16:9':
        return `${baseClasses} aspect-video`
      case '9:16':
        return `${baseClasses} aspect-[9/16]`
      case '1:1':
        return `${baseClasses} aspect-square`
      case '4:3':
        return `${baseClasses} aspect-[4/3]`
      case '21:9':
        return `${baseClasses} aspect-[21/9]`
      default:
        return `${baseClasses} aspect-video`
    }
  }

  // Opções de proporção disponíveis
  const aspectRatioOptions = [
    { value: '16:9', label: '16:9 (Widescreen)', icon: '📺' },
    { value: '9:16', label: '9:16 (Vertical)', icon: '📱' },
    { value: '1:1', label: '1:1 (Quadrado)', icon: '⬜' },
    { value: '4:3', label: '4:3 (Tradicional)', icon: '🖥️' },
    { value: '21:9', label: '21:9 (Cinema)', icon: '🎬' },
  ]

  const handleVideoUpload = (videoData: unknown) => {
    if (!selectedEventId) {
      toast({
        title: 'Nenhum evento selecionado',
        description: 'Selecione um evento antes de fazer upload de vídeos.',
        variant: 'destructive',
      })
      return
    }

    addVideoToProject(selectedEventId, videoData)
  }

  const handleStatusChange = (deliverableId: string, status: string) => {
    if (!selectedEventId) return

    updateDeliverableStatus(selectedEventId, deliverableId, status)

    const statusText =
      status === 'approved'
        ? 'aprovado'
        : status === 'rejected'
          ? 'rejeitado'
          : status === 'review'
            ? 'em revisão'
            : 'em análise'

    toast({
      title: `Status atualizado`,
      description: `O vídeo foi marcado como "${statusText}".`,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Aprovado</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>
      case 'review':
        return <Badge variant="warning">Em Revisão</Badge>
      default:
        return <Badge variant="outline">Rascunho</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edição e Aprovação</h1>

        <EventSelector label="Evento" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="videos">
            <Video className="mr-2 size-4" />
            Vídeos
          </TabsTrigger>
          <TabsTrigger value="comments">
            <MessageSquare className="mr-2 size-4" />
            Comentários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-6">
          {!selectedEventId ? (
            <div className="flex flex-col items-center justify-center rounded-lg border p-10">
              <AlertCircle className="mb-4 size-10 text-muted-foreground" />
              <p className="text-xl font-medium">Nenhum evento selecionado</p>
              <p className="mt-2 text-muted-foreground">
                Selecione um evento no menu acima para gerenciar seus vídeos.
              </p>
            </div>
          ) : (
            <>
              <VideoUploader
                onVideoUpload={handleVideoUpload}
                isDisabled={!selectedEventId}
              />

              <h3 className="mt-8 text-lg font-medium">Vídeos do Evento</h3>

              {videoDeliverables.length === 0 ? (
                <div className="rounded-md border p-8 text-center">
                  <Video className="mx-auto mb-3 size-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nenhum vídeo adicionado a este evento.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Utilize o uploader acima para adicionar vídeos.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {videoDeliverables.map(video => (
                    <Card key={video.id}>
                      <div className="h-48 bg-black">
                        {video.localUrl && (
                          <video
                            src={video.localUrl}
                            controls
                            poster={video.thumbnailUrl}
                            className="size-full object-contain"
                          />
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">
                            {video.title}
                          </CardTitle>
                          {getStatusBadge(video.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Upload em{' '}
                          {format(
                            new Date(video.uploadDate),
                            'dd/MM/yyyy HH:mm'
                          )}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant={
                              video.status === 'rejected'
                                ? 'destructive'
                                : 'outline'
                            }
                            onClick={() =>
                              handleStatusChange(video.id, 'rejected')
                            }
                          >
                            <X className="mr-1 size-4" />
                            Rejeitar
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              video.status === 'approved'
                                ? 'success'
                                : 'outline'
                            }
                            onClick={() =>
                              handleStatusChange(video.id, 'approved')
                            }
                          >
                            <Check className="mr-1 size-4" />
                            Aprovar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="comments">
          <div className="rounded-lg border p-10 text-center">
            <MessageSquare className="mx-auto mb-4 size-10 text-muted-foreground" />
            <p className="text-lg font-medium">Comentários e aprovações</p>
            <p className="mb-4 mt-2 text-muted-foreground">
              Esta funcionalidade será implementada em breve.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
