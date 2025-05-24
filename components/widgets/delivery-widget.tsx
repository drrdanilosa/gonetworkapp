import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Clock, Download, FileText, Plus, Upload, Video } from 'lucide-react'

import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { useUIStore } from '@/store/useUIStore'

export default function DeliveryWidget() {
  const { projects } = useProjectsStore()
  const { selectedEventId } = useUIStore()

  // Buscar projeto selecionado
  const selectedProject = projects.find(p => p.id === selectedEventId)

  // Buscar entregas do projeto selecionado
  const projectDeliverables = selectedProject?.videos || []

  const pendingDeliveries = projectDeliverables
    .filter(deliverable => deliverable.status !== 'approved')
    .map(deliverable => ({
      id: deliverable.id,
      title: deliverable.title,
      event: selectedProject?.name || 'Projeto não selecionado',
      deadline: deliverable.dueDate
        ? new Date(deliverable.dueDate).toLocaleString('pt-BR')
        : 'Sem prazo definido',
      status:
        deliverable.status === 'editing'
          ? 'Em edição'
          : deliverable.status === 'ready_for_review'
            ? 'Aguardando revisão'
            : deliverable.status === 'changes_requested'
              ? 'Revisão solicitada'
              : 'Pendente',
      editor: selectedProject?.editorId || 'Editor não definido',
      type: deliverable.title.includes('Teaser')
        ? 'Teaser'
        : deliverable.title.includes('Stories')
          ? 'Stories'
          : deliverable.title.includes('Reels')
            ? 'Reels'
            : 'Vídeo',
      urgent: deliverable.dueDate
        ? new Date(deliverable.dueDate) <
          new Date(Date.now() + 24 * 60 * 60 * 1000)
        : false,
    }))

  const completedDeliveries = projectDeliverables
    .filter(deliverable => deliverable.status === 'approved')
    .map(deliverable => ({
      id: deliverable.id,
      title: deliverable.title,
      event: selectedProject?.name || 'Projeto não selecionado',
      completedDate: deliverable.lastUpdated
        ? new Date(deliverable.lastUpdated).toLocaleString('pt-BR')
        : 'Data não disponível',
      editor: selectedProject?.editorId || 'Editor não definido',
      type: deliverable.title.includes('Teaser')
        ? 'Teaser'
        : deliverable.title.includes('Stories')
          ? 'Stories'
          : deliverable.title.includes('Reels')
            ? 'Reels'
            : 'Vídeo',
    }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Entregas</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>Evento:</Label>
            <Select
              value={selectedEventId || ''}
              onValueChange={value =>
                useUIStore.getState().setSelectedEventId(value)
              }
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecione um evento" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} -{' '}
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString('pt-BR')
                      : 'Data não definida'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button>
            <Plus className="mr-2 size-4" />
            Nova Entrega
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingDeliveries.map(delivery => (
              <Card
                key={delivery.id}
                className={delivery.urgent ? 'border-destructive' : ''}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-start justify-between text-lg">
                    <span>{delivery.title}</span>
                    {delivery.urgent && (
                      <Badge variant="destructive">Urgente</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <FileText className="mr-2 size-4 text-muted-foreground" />
                      <span>Evento: {delivery.event}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 size-4 text-muted-foreground" />
                      <span>Prazo: {delivery.deadline}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Video className="mr-2 size-4 text-muted-foreground" />
                      <span>Editor: {delivery.editor}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        delivery.status === 'Pendente'
                          ? 'outline'
                          : delivery.status === 'Em edição'
                            ? 'secondary'
                            : 'default'
                      }
                    >
                      {delivery.status}
                    </Badge>
                    <Badge variant="outline">{delivery.type}</Badge>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm">
                      Detalhes
                    </Button>
                    <Button size="sm">
                      <Upload className="mr-2 size-4" />
                      Entregar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedDeliveries.map(delivery => (
              <Card key={delivery.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-start justify-between text-lg">
                    <span>{delivery.title}</span>
                    <Badge variant="success">Concluída</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <FileText className="mr-2 size-4 text-muted-foreground" />
                      <span>Evento: {delivery.event}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 size-4 text-muted-foreground" />
                      <span>Entregue em: {delivery.completedDate}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Video className="mr-2 size-4 text-muted-foreground" />
                      <span>Editor: {delivery.editor}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{delivery.type}</Badge>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm">
                      Detalhes
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 size-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
