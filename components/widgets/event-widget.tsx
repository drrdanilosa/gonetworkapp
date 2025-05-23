"use client"

import { useEffect, useState } from 'react'
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  BarChart2,
  Settings,
  CheckCircle2
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUIStore } from '@/store/useUIStore'
import { useProjectsStore } from '@/store/projects-store'
import { toast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

// Componente para exibir o card expandido com detalhes do evento
function ExpandedEventCard({ event }) {
  const { setCurrentPage, setSelectedEventId } = useUIStore()
  const { projects } = useProjectsStore()
  
  // Buscar briefing e timeline associados ao evento
  const projectDetails = projects.find(p => p.id === event.id)
  const hasBriefing = projectDetails?.briefing && Object.keys(projectDetails.briefing).length > 0
  const hasTimeline = projectDetails?.timeline && projectDetails.timeline.length > 0
  
  const navigateToSection = (section) => {
    setSelectedEventId(event.id)
    
    // Mapear para os índices de páginas conforme necessário
    const pageIndices = {
      'briefing': 3,
      'timeline': 4,
      'editing': 5,
      'team': 2
    }
    
    setCurrentPage(pageIndices[section])
  }

  return (
    <div className="space-y-4 mt-4 pt-4 border-t">
      <Tabs defaultValue="details">
        <TabsList className="mb-3">
          <TabsTrigger value="details">
            <BarChart2 className="h-4 w-4 mr-2" />
            Detalhes
          </TabsTrigger>
          <TabsTrigger value="briefing">
            <FileText className="h-4 w-4 mr-2" />
            Briefing
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock className="h-4 w-4 mr-2" />
            Timeline
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold">Informações do Evento</h4>
              <ul className="text-sm space-y-1 mt-2">
                <li><strong>Nome:</strong> {event.name}</li>
                <li><strong>Cliente:</strong> {event.client}</li>
                <li><strong>Local:</strong> {event.location}</li>
                <li><strong>Status:</strong> {getStatusText(event.status)}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold">Estatísticas</h4>
              <ul className="text-sm space-y-1 mt-2">
                <li><strong>Equipe:</strong> {event.team} membros</li>
                <li><strong>Entregas planejadas:</strong> {event.deliveries}</li>
                <li><strong>Concluídas:</strong> {event.completed}</li>
                <li><strong>Taxa de conclusão:</strong> {calculateCompletionRate(event.completed, event.deliveries)}%</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateToSection('team')}
            >
              <Users className="h-4 w-4 mr-1" />
              Gerenciar Equipe
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => navigateToSection('briefing')}
            >
              <Settings className="h-4 w-4 mr-1" />
              Configurar Evento
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="briefing">
          {hasBriefing ? (
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold">Objetivo do Evento</h4>
                <p className="text-sm text-muted-foreground">
                  {projectDetails.briefing.objective || 'Objetivo não definido'}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold">Formato</h4>
                <p className="text-sm text-muted-foreground">
                  {projectDetails.briefing.format || 'Formato não definido'}
                </p>
              </div>
              
              {projectDetails.briefing.sponsors?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold">Patrocinadores</h4>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {projectDetails.briefing.sponsors.map(sponsor => (
                      <Badge key={sponsor.id} variant="outline">{sponsor.name}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-3">
                <Button 
                  size="sm"
                  onClick={() => navigateToSection('briefing')}
                >
                  Ver Briefing Completo
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">Briefing não configurado</p>
              <p className="text-xs text-muted-foreground mb-3">
                Configure o briefing para definir todos os detalhes do evento
              </p>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => navigateToSection('briefing')}
              >
                Configurar Briefing
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="timeline">
          {hasTimeline ? (
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold">Cronograma</h4>
                <div className="mt-2 border p-2 rounded-md overflow-x-auto">
                  <div className="flex gap-1 min-w-[400px]">
                    {projectDetails.timeline.map(phase => (
                      <div 
                        key={phase.id}
                        className={`py-1 px-2 rounded-sm text-xs ${
                          phase.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}
                        style={{ width: `${phase.duration}%` }}
                      >
                        {phase.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <Button 
                  size="sm"
                  onClick={() => navigateToSection('timeline')}
                >
                  Ver Timeline Completa
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">Timeline não gerada</p>
              <p className="text-xs text-muted-foreground mb-3">
                Gere a timeline a partir do briefing para visualizar o cronograma
              </p>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => navigateToSection('briefing')}
              >
                Gerar Timeline
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between pt-2 border-t">
        <Button 
          variant="default"
          size="sm" 
          onClick={() => navigateToSection('editing')}
        >
          Acessar Entregas
        </Button>
        
        <Button 
          variant="outline"
          size="sm"
          onClick={() => navigateToSection('briefing')}
        >
          Configurar Evento
        </Button>
      </div>
    </div>
  )
}

// Função auxiliar para calcular a taxa de conclusão
function calculateCompletionRate(completed, total) {
  if (!total) return 0
  return Math.round((completed / total) * 100)
}

// Funções auxiliares para formatar texto
function getStatusText(status) {
  const statusMap = {
    'planejamento': 'Planejamento',
    'em_andamento': 'Em andamento',
    'concluido': 'Concluído',
    'cancelado': 'Cancelado'
  }
  return statusMap[status] || status
}

function getStatusVariant(status) {
  const variantMap = {
    'planejamento': 'secondary',
    'em_andamento': 'default',
    'concluido': 'success',
    'cancelado': 'destructive'
  }
  return variantMap[status] || 'outline'
}

export default function EventsWidget() {
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({ 
    name: '', 
    startDate: '', 
    endDate: '', 
    location: '', 
    client: '' 
  })
  
  // Usando estados do Zustand conforme direcionamento
  const { expandedCardId, setExpandedCardId } = useUIStore()
  const { projects, addProject } = useProjectsStore()

  // Efeito para simular carregamento inicial
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
  }, [])

  const toggleExpand = (id) => {
    setExpandedCardId(expandedCardId === id ? null : id)
  }

  const handleCreateEvent = () => {
    if (!newEvent.name || !newEvent.startDate || !newEvent.client) {
      toast({ 
        title: 'Campos obrigatórios',
        description: 'Preencha nome, data de início e cliente.',
        variant: 'destructive'
      })
      return
    }

    // Criar o novo projeto com os campos básicos
    const newProject = {
      id: `evt-${Date.now().toString().slice(-6)}`,
      name: newEvent.name,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate || newEvent.startDate,
      location: newEvent.location,
      client: newEvent.client,
      status: 'planejamento',
      team: 0,
      deliveries: 0,
      completed: 0,
      // Campos adicionais que serão populados depois
      briefing: {},
      timeline: [],
      teamMembers: [],
      deliverables: []
    }
    
    // Adicionar o projeto via store
    addProject(newProject)
    
    // Fechar modal e limpar form
    setDialogOpen(false)
    setNewEvent({ name: '', startDate: '', endDate: '', location: '', client: '' })
    
    toast({
      title: 'Evento criado com sucesso',
      description: 'Configure mais detalhes no briefing do evento.'
    })
  }

  const formatDate = (start, end) => {
    try {
      const s = parseISO(start)
      const e = parseISO(end)
      const sameMonth = format(s, 'MM/yyyy') === format(e, 'MM/yyyy')
      return sameMonth
        ? `${format(s, 'dd')}-${format(e, 'dd MMM yyyy', { locale: ptBR })}`
        : `${format(s, 'dd MMM', { locale: ptBR })}-${format(e, 'dd MMM yyyy', { locale: ptBR })}`
    } catch {
      return 'Data inválida'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Eventos</h1>
          <p className="text-muted-foreground">
            {isLoading ? 'Carregando...' : `${projects.length} eventos encontrados`}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Evento
        </Button>
      </div>

      {isLoading ? (
        // Loading skeletons
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={`skeleton-${i}`}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-2 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // Grid de eventos
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.length > 0 ? (
            projects.map(event => (
              <Card 
                key={event.id} 
                className={`transition-shadow hover:shadow-md ${
                  expandedCardId === event.id ? 'ring-1 ring-primary' : ''
                }`}
              >
                <CardHeader 
                  onClick={() => toggleExpand(event.id)} 
                  className="cursor-pointer flex flex-row items-center justify-between pb-3"
                >
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <Badge variant={getStatusVariant(event.status)}>
                      {getStatusText(event.status)}
                    </Badge>
                  </div>
                  <div>
                    {expandedCardId === event.id ? 
                      <ChevronUp className="h-5 w-5 text-muted-foreground" /> : 
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    }
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" /> 
                    {formatDate(event.startDate, event.endDate)}
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> 
                    <span className="truncate" title={event.location}>
                      {event.location || 'Local não definido'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" /> 
                    <span className="truncate" title={`Cliente: ${event.client}`}>
                      Cliente: {event.client}
                    </span>
                  </div>
                  
                  {/* Progresso de entregas */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">
                        {event.completed}/{event.deliveries} entregas
                      </span>
                    </div>
                    <Progress 
                      value={calculateCompletionRate(event.completed, event.deliveries)} 
                      className="h-2"
                      indicatorClassName={
                        event.completed === event.deliveries && event.deliveries > 0
                          ? "bg-green-500"
                          : undefined
                      }
                    />
                  </div>
                  
                  {/* Card expandido com detalhes */}
                  {expandedCardId === event.id && (
                    <ExpandedEventCard event={event} />
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            // Estado vazio
            <div className="col-span-full text-center p-8 border rounded-lg">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">Nenhum evento encontrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione seu primeiro evento para começar.
              </p>
              <Button onClick={() => setDialogOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Evento
              </Button>
            </div>
          )}
          
          {/* Card para adicionar novo evento */}
          {projects.length > 0 && projects.length < 6 && (
            <Card className="border-dashed flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => setDialogOpen(true)}>
              <div className="mb-4 w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                <Plus className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-center">Adicionar Evento</p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Criar um novo evento para gerenciar
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Modal para criar novo evento */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Novo Evento</DialogTitle>
            <DialogDescription>
              Preencha os dados básicos do evento. Você poderá configurar detalhes adicionais depois.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="event-name">Nome do Evento *</Label>
              <Input 
                id="event-name"
                value={newEvent.name} 
                onChange={e => setNewEvent(v => ({ ...v, name: e.target.value }))} 
                placeholder="Ex: Festival de Verão 2025"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="event-start">Data de Início *</Label>
                <Input 
                  id="event-start"
                  type="date" 
                  value={newEvent.startDate} 
                  onChange={e => setNewEvent(v => ({ ...v, startDate: e.target.value }))} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="event-end">Data de Término</Label>
                <Input 
                  id="event-end"
                  type="date" 
                  value={newEvent.endDate} 
                  onChange={e => setNewEvent(v => ({ ...v, endDate: e.target.value }))} 
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="event-location">Local do Evento</Label>
              <Input 
                id="event-location"
                value={newEvent.location} 
                onChange={e => setNewEvent(v => ({ ...v, location: e.target.value }))} 
                placeholder="Ex: Centro de Convenções"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="event-client">Cliente *</Label>
              <Input 
                id="event-client"
                value={newEvent.client} 
                onChange={e => setNewEvent(v => ({ ...v, client: e.target.value }))} 
                placeholder="Ex: Empresa ABC"
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            
            <Button 
              onClick={handleCreateEvent}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Criar Evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}