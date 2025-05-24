"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  
  const { projects, addVideoToProject, updateDeliverableStatus } = useProjectsStore()
  const { selectedEventId } = useUIStore()
  
  const selectedProject = projects.find(p => p.id === selectedEventId)
  const videoDeliverables = selectedProject?.deliverables?.filter(d => d.type === 'video') || []
  
  const handleVideoUpload = (videoData: any) => {
    if (!selectedEventId) {
      toast({
        title: "Nenhum evento selecionado",
        description: "Selecione um evento antes de fazer upload de vídeos.",
        variant: "destructive"
      })
      return
    }
    
    addVideoToProject(selectedEventId, videoData)
  }
  
  const handleStatusChange = (deliverableId: string, status: string) => {
    if (!selectedEventId) return
    
    updateDeliverableStatus(selectedEventId, deliverableId, status)
    
    const statusText = status === 'approved' ? 'aprovado' : 
                      status === 'rejected' ? 'rejeitado' : 
                      status === 'review' ? 'em revisão' : 'em análise'
    
    toast({
      title: `Status atualizado`,
      description: `O vídeo foi marcado como "${statusText}".`
    })
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edição e Aprovação</h1>
        
        <EventSelector label="Evento" />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="videos">
            <Video className="h-4 w-4 mr-2" />
            Vídeos
          </TabsTrigger>
          <TabsTrigger value="comments">
            <MessageSquare className="h-4 w-4 mr-2" />
            Comentários
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="videos" className="space-y-6">
          {!selectedEventId ? (
            <div className="flex flex-col items-center justify-center p-10 border rounded-lg">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-xl font-medium">Nenhum evento selecionado</p>
              <p className="text-muted-foreground mt-2">
                Selecione um evento no menu acima para gerenciar seus vídeos.
              </p>
            </div>
          ) : (
            <>
              <VideoUploader 
                onVideoUpload={handleVideoUpload} 
                isDisabled={!selectedEventId}
              />
              
              <h3 className="text-lg font-medium mt-8">Vídeos do Evento</h3>
              
              {videoDeliverables.length === 0 ? (
                <div className="text-center p-8 border rounded-md">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Nenhum vídeo adicionado a este evento.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Utilize o uploader acima para adicionar vídeos.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videoDeliverables.map((video) => (
                    <Card key={video.id}>
                      <div className="aspect-video bg-black">
                        {video.localUrl && (
                          <video 
                            src={video.localUrl} 
                            controls 
                            poster={video.thumbnailUrl}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{video.title}</CardTitle>
                          {getStatusBadge(video.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Upload em {format(new Date(video.uploadDate), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant={video.status === 'rejected' ? 'destructive' : 'outline'}
                            onClick={() => handleStatusChange(video.id, 'rejected')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                          <Button 
                            size="sm" 
                            variant={video.status === 'approved' ? 'success' : 'outline'}
                            onClick={() => handleStatusChange(video.id, 'approved')}
                          >
                            <Check className="h-4 w-4 mr-1" />
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
          <div className="text-center p-10 border rounded-lg">
            <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Comentários e aprovações</p>
            <p className="text-muted-foreground mt-2 mb-4">
              Esta funcionalidade será implementada em breve.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}