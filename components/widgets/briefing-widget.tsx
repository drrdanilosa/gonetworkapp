"use client"

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Clock, Save, Trash2, Plus, FileText } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import GeneralInfoTab from '@/features/briefing/components/GeneralInfoTab'
import { useUIStore } from '@/store/useUIStore'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { toast } from '@/components/ui/use-toast'
import { v4 as uuidv4 } from 'uuid'
import { cn } from '@/lib/utils'
import GenerateTimelineButton from './GenerateTimelineButton'

// Definições de tipos
type Event = {
  id: string
  name: string
  date: string
}

type Sponsor = {
  id: string
  name: string
  actions: SponsorAction[]
}

type SponsorAction = {
  id: string
  name: string
  captureTime: string
  isFreeTime: boolean
  responsibleId: string
  isRealTime: boolean
  rtDeliveryTime: string
  editorId: string
  instructions: string
}

type Stage = {
  id: string
  name: string
  attractions: Attraction[]
}

type Attraction = {
  id: string
  name: string
  time: string
  notes: string
}

type RealTimeDelivery = {
  id: string
  title: string
  time: string
  editorId: string
  platforms: {
    reels: boolean
    stories: boolean
    feed: boolean
  }
  instructions: string
}

type BriefingWidgetProps = {
  projectId?: string
}

/**
 * BriefingWidget - Componente para gerenciar briefings de eventos com múltiplas seções
 * 
 * Inclui gerenciamento de:
 * - Informações gerais do evento
 * - Estilo visual e referências
 * - Patrocinadores e suas ações
 * - Programação do evento (palcos e atrações)
 * - Entregas em tempo real e pós-evento
 */
export function BriefingWidget({ projectId }: BriefingWidgetProps) {
  // Usar store unificado
  const { projects, updateProject } = useProjectsStore()
  
  // Obter o projeto atual a partir do ID recebido
  const currentProject = projects.find(p => p.id === projectId)

  // Estado da aba de estilo visual
  const [visualStyle, setVisualStyle] = useState<string>('')
  const [references, setReferences] = useState<string>('')

  // Estado de patrocinadores
  const [sponsors, setSponsors] = useState<Sponsor[]>([
    {
      id: 'patrocinadorA',
      name: 'Patrocinador A',
      actions: [
        {
          id: uuidv4(),
          name: 'Stand promocional',
          captureTime: '14:30',
          isFreeTime: false,
          responsibleId: 'joao',
          isRealTime: true,
          rtDeliveryTime: '15:00',
          editorId: 'maria',
          instructions: 'Capturar interação com visitantes'
        }
      ]
    },
    { id: 'patrocinadorB', name: 'Patrocinador B', actions: [] },
    { id: 'patrocinadorC', name: 'Patrocinador C', actions: [] }
  ])

  // Estado de palcos
  const [stages, setStages] = useState<Stage[]>([
    {
      id: uuidv4(),
      name: 'Palco Principal',
      attractions: [
        {
          id: uuidv4(),
          name: 'Banda XYZ',
          time: '20:30',
          notes: ''
        },
        {
          id: uuidv4(),
          name: 'DJ ABC',
          time: '22:00',
          notes: 'Preparar iluminação especial'
        }
      ]
    }
  ])

  // Estado de entregas em tempo real
  const [realTimeDeliveries, setRealTimeDeliveries] = useState<RealTimeDelivery[]>([
    {
      id: uuidv4(),
      title: 'Stories - Abertura',
      time: '12:30',
      editorId: 'maria',
      platforms: { reels: false, stories: true, feed: false },
      instructions: ''
    },
    {
      id: uuidv4(),
      title: 'Reels - Patrocinador',
      time: '15:00',
      editorId: 'pedro',
      platforms: { reels: true, stories: false, feed: false },
      instructions: ''
    }
  ])
  
  // Estado de entregas pós-evento
  const [teaserTime, setTeaserTime] = useState<string>('21:00')
  const [postEventDeadline, setPostEventDeadline] = useState<string>('7')
  const [deadlineUnit, setDeadlineUnit] = useState<string>('dias')
  const [postEventOptions, setPostEventOptions] = useState({
    aftermovie: true,
    highlights: true,
    sponsorVersions: false
  })
  const [postEventNotes, setPostEventNotes] = useState<string>('')
  
  // Estado de UI ativa
  const [activeTab, setActiveTab] = useState<string>("general")
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // Integração com o store global
  const selectedEventId = useUIStore(state => state.selectedEventId)
  const setSelectedEventId = useUIStore(state => state.setSelectedEventId)

  // Estado local para seleção de evento (fallback)
  const [selectedEvent, setSelectedEvent] = useState<string>('123')

  // ID efetivo do evento (prioriza o global)
  const effectiveEventId = selectedEventId || selectedEvent

  // Handlers para patrocinadores
  const handleAddSponsor = () => {
    const newSponsor: Sponsor = {
      id: uuidv4(),
      name: `Novo Patrocinador`,
      actions: []
    }
    setSponsors([...sponsors, newSponsor])
  }

  const handleRemoveSponsor = (sponsorId: string) => {
    setSponsors(sponsors.filter(sponsor => sponsor.id !== sponsorId))
  }

  const handleAddSponsorAction = (sponsorId: string) => {
    const newAction: SponsorAction = {
      id: uuidv4(),
      name: '',
      captureTime: '',
      isFreeTime: false,
      responsibleId: '',
      isRealTime: false,
      rtDeliveryTime: '',
      editorId: '',
      instructions: ''
    }
    
    setSponsors(
      sponsors.map(sponsor => 
        sponsor.id === sponsorId 
          ? { ...sponsor, actions: [...sponsor.actions, newAction] }
          : sponsor
      )
    )
  }

  const handleRemoveSponsorAction = (sponsorId: string, actionId: string) => {
    setSponsors(
      sponsors.map(sponsor => 
        sponsor.id === sponsorId 
          ? { 
              ...sponsor, 
              actions: sponsor.actions.filter(action => action.id !== actionId) 
            }
          : sponsor
      )
    )
  }

  // Handlers para palcos
  const handleAddStage = () => {
    const newStage: Stage = {
      id: uuidv4(),
      name: 'Novo Palco',
      attractions: []
    }
    setStages([...stages, newStage])
  }

  const handleRemoveStage = (stageId: string) => {
    setStages(stages.filter(stage => stage.id !== stageId))
  }

  const handleAddAttraction = (stageId: string) => {
    const newAttraction: Attraction = {
      id: uuidv4(),
      name: '',
      time: '',
      notes: ''
    }
    
    setStages(
      stages.map(stage => 
        stage.id === stageId 
          ? { ...stage, attractions: [...stage.attractions, newAttraction] }
          : stage
      )
    )
  }

  const handleRemoveAttraction = (stageId: string, attractionId: string) => {
    setStages(
      stages.map(stage => 
        stage.id === stageId 
          ? { 
              ...stage, 
              attractions: stage.attractions.filter(attraction => attraction.id !== attractionId) 
            }
          : stage
      )
    )
  }

  // Handlers para entregas em tempo real
  const handleAddRealTimeDelivery = () => {
    const newDelivery: RealTimeDelivery = {
      id: uuidv4(),
      title: '',
      time: '',
      editorId: '',
      platforms: { reels: false, stories: false, feed: false },
      instructions: ''
    }
    setRealTimeDeliveries([...realTimeDeliveries, newDelivery])
  }

  const handleRemoveRealTimeDelivery = (deliveryId: string) => {
    setRealTimeDeliveries(realTimeDeliveries.filter(delivery => delivery.id !== deliveryId))
  }

  // Salvar dados do briefing
  const handleSaveBriefing = async () => {
    try {
      setIsSaving(true)
      
      // Simular uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Aqui seria implementada a chamada para salvar no backend
      // Example: await api.saveBriefing(projectId, { sponsors, stages, ... })
      
      toast({
        title: "Briefing salvo",
        description: "As informações do briefing foram salvas com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao salvar briefing:', error)
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as informações do briefing.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Carregar dados do backend (quando disponível)
  useEffect(() => {
    const loadBriefingData = async () => {
      if (!projectId) return
      
      try {
        // Simular carregamento de dados
        console.log(`Carregando dados do briefing para o projeto ${projectId}`)
        
        // Implementação futura: 
        // const data = await api.getBriefingData(projectId)
        // setSponsors(data.sponsors)
        // setStages(data.stages)
        // ...etc
      } catch (error) {
        console.error('Erro ao carregar briefing:', error)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as informações do briefing.",
          variant: "destructive"
        })
      }
    }
    
    loadBriefingData()
  }, [projectId])

  // Calcular estatísticas do briefing
  const briefingStats = useMemo(() => {
    const totalSponsors = sponsors.length
    const totalActions = sponsors.reduce(
      (total, sponsor) => total + sponsor.actions.length, 0
    )
    const totalRealTimeDeliveries = realTimeDeliveries.length
    const totalStages = stages.length
    const totalAttractions = stages.reduce(
      (total, stage) => total + stage.attractions.length, 0
    )
    
    return {
      totalSponsors,
      totalActions,
      totalRealTimeDeliveries,
      totalStages,
      totalAttractions
    }
  }, [sponsors, realTimeDeliveries, stages])

  // Obter eventos do store global
  const events = projects.flatMap(project => 
    project.events?.map(event => ({
      id: event.id,
      name: event.name,
      date: event.date
    })) || []
  )

  // Adicionar eventos automaticamente para projetos que não possuem a propriedade events
  useEffect(() => {
    // Encontrar projetos sem a propriedade events ou com array events vazio
    const projectsWithoutEvents = projects.filter(p => !p.events || p.events.length === 0);
    
    if (projectsWithoutEvents.length > 0) {
      // Para cada projeto, criar um evento a partir dos dados do projeto
      projectsWithoutEvents.forEach(project => {
        const { id, name, startDate } = project;
        if (id && name) {
          // Atualizar o projeto adicionando um evento baseado no próprio projeto
          updateProject(id, {
            events: [{
              id,
              name,
              date: startDate || new Date().toISOString()
            }]
          });
        }
      });
    }
  }, [projects, updateProject]);

  return (
    <div className="animate-in fade-in-50 duration-300">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">Briefing</h2>
          <p className="text-muted-foreground">
            Configure todos os detalhes do evento
          </p>
        </div>

        <div className="flex gap-2">
          <GenerateTimelineButton 
            projectId={projectId} 
            disabled={isSaving}
            onGenerated={(success) => {
              if (success) {
                toast({
                  title: "Timeline gerada",
                  description: "A timeline foi gerada com sucesso com base no briefing.",
                });
              } else {
                toast({
                  title: "Erro ao gerar timeline",
                  description: "Não foi possível gerar a timeline. Tente novamente.",
                  variant: "destructive"
                });
              }
            }}
          />
          <Button 
            onClick={handleSaveBriefing} 
            disabled={isSaving}
            className="transition-all"
          >
            <Save className={cn("h-4 w-4 mr-2", isSaving && "animate-spin")} />
            {isSaving ? "Salvando..." : "Salvar Briefing"}
          </Button>
        </div>
      </div>
      
      {/* Estatísticas do briefing */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        <Card className="p-2">
          <CardContent className="p-2 text-center">
            <p className="text-2xl font-bold">{briefingStats.totalSponsors}</p>
            <p className="text-xs text-muted-foreground">Patrocinadores</p>
          </CardContent>
        </Card>
        <Card className="p-2">
          <CardContent className="p-2 text-center">
            <p className="text-2xl font-bold">{briefingStats.totalActions}</p>
            <p className="text-xs text-muted-foreground">Ações</p>
          </CardContent>
        </Card>
        <Card className="p-2">
          <CardContent className="p-2 text-center">
            <p className="text-2xl font-bold">{briefingStats.totalStages}</p>
            <p className="text-xs text-muted-foreground">Palcos</p>
          </CardContent>
        </Card>
        <Card className="p-2">
          <CardContent className="p-2 text-center">
            <p className="text-2xl font-bold">{briefingStats.totalAttractions}</p>
            <p className="text-xs text-muted-foreground">Atrações</p>
          </CardContent>
        </Card>
        <Card className="p-2">
          <CardContent className="p-2 text-center">
            <p className="text-2xl font-bold">{briefingStats.totalRealTimeDeliveries}</p>
            <p className="text-xs text-muted-foreground">Entregas RT</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Seleção de evento */}
      <div className="mb-6">
        <Label htmlFor="event-select" className="mb-2 block">
          Selecionar Evento:
        </Label>
        <Select 
          value={effectiveEventId} 
          onValueChange={val => {
            setSelectedEvent(val)
            setSelectedEventId(val)
          }}
        >
          <SelectTrigger id="event-select" className="w-[350px]">
            <SelectValue placeholder={events.length > 0 ? "Selecione um evento" : "Nenhum evento disponível"} />
          </SelectTrigger>
          <SelectContent>
            {events.length > 0 ? (
              events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name} ({event.date})
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Nenhum evento disponível
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="general">Informações Gerais</TabsTrigger>
          <TabsTrigger value="style">Estilo Visual</TabsTrigger>
          <TabsTrigger value="sponsors">Patrocinadores</TabsTrigger>
          <TabsTrigger value="schedule">Programação</TabsTrigger>
          <TabsTrigger value="deliveries">Entregas</TabsTrigger>
        </TabsList>

        {/* Aba: Informações Gerais */}
        <TabsContent value="general">
          <GeneralInfoTab />
        </TabsContent>

        {/* Aba: Estilo Visual */}
        <TabsContent value="style" className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Estilo Visual</h3>
            <div className="space-y-2">
              <Label htmlFor="visual-style">
                Descreva o estilo visual desejado:
              </Label>
              <Textarea
                id="visual-style"
                placeholder="Descreva aqui o estilo visual, identidade e linguagem desejados para as entregas..."
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Referências</h3>
            <div className="space-y-2">
              <Label htmlFor="references">
                Links e descrições de referências:
              </Label>
              <Textarea
                id="references"
                placeholder="Adicione aqui links para vídeos, imagens ou outras referências de estilo..."
                value={references}
                onChange={e => setReferences(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          </div>
        </TabsContent>

        {/* Aba: Patrocinadores */}
        <TabsContent value="sponsors" className="mt-6 space-y-6">
          <p className="text-muted-foreground mb-4">
            Adicione os patrocinadores e defina as ativações que precisarão ser registradas durante o evento.
          </p>

          <Button onClick={handleAddSponsor} className="mb-4">
            <Plus className="h-4 w-4 mr-2" />
            Novo Patrocinador
          </Button>

          {sponsors.length === 0 ? (
            <div className="text-center p-12 border rounded-lg">
              <p className="text-lg font-medium mb-2">Nenhum patrocinador cadastrado</p>
              <p className="text-muted-foreground mb-4">Adicione patrocinadores para definir suas ativações</p>
            </div>
          ) : (
            sponsors.map((sponsor) => (
              <Card key={sponsor.id} className="border-border mb-4 overflow-hidden">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Label>Patrocinador:</Label>
                      <Input 
                        className="w-[250px]"
                        value={sponsor.name}
                        onChange={e => {
                          setSponsors(
                            sponsors.map(s => 
                              s.id === sponsor.id 
                                ? { ...s, name: e.target.value }
                                : s
                            )
                          )
                        }}
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveSponsor(sponsor.id)}
                      title="Remover patrocinador"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    {sponsor.actions.map((action) => (
                      <Card key={action.id} className="bg-secondary/20">
                        <CardContent className="p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium text-primary">
                              Ação / Ativação
                            </h3>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleRemoveSponsorAction(sponsor.id, action.id)}
                              title="Remover ação"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`action-name-${action.id}`}>Ação / Ativação:</Label>
                              <Input
                                id={`action-name-${action.id}`}
                                placeholder="Nome da ação/ativação"
                                value={action.name}
                                onChange={e => {
                                  setSponsors(
                                    sponsors.map(s => 
                                      s.id === sponsor.id 
                                        ? { 
                                            ...s, 
                                            actions: s.actions.map(a => 
                                              a.id === action.id 
                                                ? { ...a, name: e.target.value }
                                                : a
                                            ) 
                                          }
                                        : s
                                    )
                                  )
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`action-time-${action.id}`}>
                                Horário de captação:
                              </Label>
                              <div className="flex items-center gap-2">
                                <Input 
                                  id={`action-time-${action.id}`} 
                                  type="time"
                                  value={action.captureTime}
                                  disabled={action.isFreeTime}
                                  onChange={e => {
                                    setSponsors(
                                      sponsors.map(s => 
                                        s.id === sponsor.id 
                                          ? { 
                                              ...s, 
                                              actions: s.actions.map(a => 
                                                a.id === action.id 
                                                  ? { ...a, captureTime: e.target.value }
                                                  : a
                                              ) 
                                            }
                                          : s
                                      )
                                    )
                                  }}
                                />
                                <div className="flex items-center gap-2">
                                  <Checkbox 
                                    id={`free-time-${action.id}`}
                                    checked={action.isFreeTime}
                                    onCheckedChange={checked => {
                                      setSponsors(
                                        sponsors.map(s => 
                                          s.id === sponsor.id 
                                            ? { 
                                                ...s, 
                                                actions: s.actions.map(a => 
                                                  a.id === action.id 
                                                    ? { ...a, isFreeTime: Boolean(checked) }
                                                    : a
                                                ) 
                                              }
                                            : s
                                        )
                                      )
                                    }}
                                  />
                                  <Label htmlFor={`free-time-${action.id}`}>Horário Livre</Label>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`responsible-${action.id}`}>
                                Responsável pela captação:
                              </Label>
                              <Select 
                                value={action.responsibleId}
                                onValueChange={value => {
                                  setSponsors(
                                    sponsors.map(s => 
                                      s.id === sponsor.id 
                                        ? { 
                                            ...s, 
                                            actions: s.actions.map(a => 
                                              a.id === action.id 
                                                ? { ...a, responsibleId: value }
                                                : a
                                            ) 
                                          }
                                        : s
                                    )
                                  )
                                }}
                              >
                                <SelectTrigger id={`responsible-${action.id}`}>
                                  <SelectValue placeholder="Selecionar responsável" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="joao">João Silva</SelectItem>
                                  <SelectItem value="maria">Maria Souza</SelectItem>
                                  <SelectItem value="carlos">Carlos Lima</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 h-10">
                                <Checkbox 
                                  id={`realtime-${action.id}`}
                                  checked={action.isRealTime}
                                  onCheckedChange={checked => {
                                    setSponsors(
                                      sponsors.map(s => 
                                        s.id === sponsor.id 
                                          ? { 
                                              ...s, 
                                              actions: s.actions.map(a => 
                                                a.id === action.id 
                                                  ? { ...a, isRealTime: Boolean(checked) }
                                                  : a
                                              ) 
                                            }
                                          : s
                                      )
                                    )
                                  }}
                                />
                                <Label htmlFor={`realtime-${action.id}`}>Entrega Real Time?</Label>
                              </div>
                            </div>

                            {action.isRealTime && (
                              <>
                                <div className="space-y-2">
                                  <Label htmlFor={`rt-time-${action.id}`}>Horário da entrega RT:</Label>
                                  <Input 
                                    id={`rt-time-${action.id}`} 
                                    type="time"
                                    value={action.rtDeliveryTime}
                                    onChange={e => {
                                      setSponsors(
                                        sponsors.map(s => 
                                          s.id === sponsor.id 
                                            ? { 
                                                ...s, 
                                                actions: s.actions.map(a => 
                                                  a.id === action.id 
                                                    ? { ...a, rtDeliveryTime: e.target.value }
                                                    : a
                                                ) 
                                              }
                                            : s
                                        )
                                      )
                                    }}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`editor-${action.id}`}>Editor responsável:</Label>
                                  <Select
                                    value={action.editorId}
                                    onValueChange={value => {
                                      setSponsors(
                                        sponsors.map(s => 
                                          s.id === sponsor.id 
                                            ? { 
                                                ...s, 
                                                actions: s.actions.map(a => 
                                                  a.id === action.id 
                                                    ? { ...a, editorId: value }
                                                    : a
                                                ) 
                                              }
                                            : s
                                        )
                                      )
                                    }}
                                  >
                                    <SelectTrigger id={`editor-${action.id}`}>
                                      <SelectValue placeholder="Selecionar editor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="maria">Maria Souza</SelectItem>
                                      <SelectItem value="pedro">Pedro Alves</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </>
                            )}

                            <div className="col-span-1 md:col-span-2 space-y-2">
                              <Label htmlFor={`instructions-${action.id}`}>Orientações:</Label>
                              <Textarea
                                id={`instructions-${action.id}`}
                                placeholder="Orientações específicas..."
                                className="min-h-[100px]"
                                value={action.instructions}
                                onChange={e => {
                                  setSponsors(
                                    sponsors.map(s => 
                                      s.id === sponsor.id 
                                        ? { 
                                            ...s, 
                                            actions: s.actions.map(a => 
                                              a.id === action.id 
                                                ? { ...a, instructions: e.target.value }
                                                : a
                                            ) 
                                          }
                                        : s
                                    )
                                  )
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Button 
                    variant="outline"
                    onClick={() => handleAddSponsorAction(sponsor.id)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Ação
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Aba: Programação */}
        <TabsContent value="schedule" className="mt-6 space-y-6">
          <p className="text-muted-foreground mb-4">
            Adicione a programação completa do evento, organizada por palco.
          </p>

          <Button onClick={handleAddStage} className="mb-4">
            <Plus className="h-4 w-4 mr-2" />
            Novo Palco
          </Button>

          {stages.length === 0 ? (
            <div className="text-center p-12 border rounded-lg">
              <p className="text-lg font-medium mb-2">Nenhum palco cadastrado</p>
              <p className="text-muted-foreground mb-4">Adicione palcos para definir a programação</p>
            </div>
          ) : (
            stages.map((stage) => (
              <Card key={stage.id} className="border-border mb-4 overflow-hidden">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Label>Palco:</Label>
                      <Input 
                        className="w-[250px]"
                        value={stage.name}
                        onChange={(e) => {
                          setStages(
                            stages.map((s) =>
                              s.id === stage.id ? { ...s, name: e.target.value } : s
                            )
                          );
                        }}
                      />
                    </div>

                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleRemoveStage(stage.id)}
                      title="Remover palco"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    {stage.attractions.map((attraction) => (
                      <Card key={attraction.id} className="bg-secondary/20">
                        <CardContent className="p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">Atração</h3>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleRemoveAttraction(stage.id, attraction.id)}
                              title="Remover atração"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`artist-${attraction.id}`}>Artista:</Label>
                              <Input
                                id={`artist-${attraction.id}`}
                                placeholder="Nome do artista/atração"
                                value={attraction.name}
                                onChange={(e) => {
                                  setStages(
                                    stages.map((s) =>
                                      s.id === stage.id
                                        ? {
                                            ...s,
                                            attractions: s.attractions.map((a) =>
                                              a.id === attraction.id
                                                ? { ...a, name: e.target.value }
                                                : a
                                            ),
                                          }
                                        : s
                                    )
                                  );
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`showtime-${attraction.id}`}>Horário:</Label>
                              <Input 
                                id={`showtime-${attraction.id}`} 
                                type="time"
                                value={attraction.time}
                                onChange={e => {
                                  setStages(
                                    stages.map(s => 
                                      s.id === stage.id 
                                        ? { 
                                            ...s, 
                                            attractions: s.attractions.map(a => 
                                              a.id === attraction.id 
                                                ? { ...a, time: e.target.value }
                                                : a
                                            ) 
                                          }
                                        : s
                                    )
                                  )
                                }}
                              />
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-2">
                              <Label htmlFor={`notes-${attraction.id}`}>Observações:</Label>
                              <Textarea
                                id={`notes-${attraction.id}`}
                                placeholder="Observações (opcional)..."
                                className="min-h-[80px]"
                                value={attraction.notes}
                                onChange={e => {
                                  setStages(
                                    stages.map(s => 
                                      s.id === stage.id 
                                        ? { 
                                            ...s, 
                                            attractions: s.attractions.map(a => 
                                              a.id === attraction.id 
                                                ? { ...a, notes: e.target.value }
                                                : a
                                            ) 
                                          }
                                        : s
                                    )
                                  )
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {stage.attractions.length === 0 && (
                      <div className="text-center p-8 border-dashed border-2 rounded-md">
                        <p className="text-muted-foreground">Nenhuma atração adicionada neste palco</p>
                      </div>
                    )}
                  </div>

                  <Button 
                    variant="outline"
                    onClick={() => handleAddAttraction(stage.id)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Atração
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Aba: Entregas */}
        <TabsContent value="deliveries" className="mt-6 space-y-6">
          <div className="space-y-6">
            {/* Seção: Entregas Real Time */}
            <div className="bg-background border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium text-primary">
                Entregas Real Time
              </h3>

              <div className="space-y-4">
                {realTimeDeliveries.map((delivery) => (
                  <Card key={delivery.id} className="bg-secondary/20">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Entrega Real Time</h3>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleRemoveRealTimeDelivery(delivery.id)}
                          title="Remover entrega"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`delivery-title-${delivery.id}`}>
                            Título/Descrição:
                          </Label>
                          <Input
                            id={`delivery-title-${delivery.id}`}
                            placeholder="Título/descrição da entrega"
                            value={delivery.title}
                            onChange={e => {
                              setRealTimeDeliveries(
                                realTimeDeliveries.map(d => 
                                  d.id === delivery.id 
                                    ? { ...d, title: e.target.value }
                                    : d
                                )
                              )
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`delivery-time-${delivery.id}`}>
                            Horário de entrega:
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id={`delivery-time-${delivery.id}`}
                              type="time"
                              value={delivery.time}
                              onChange={e => {
                                setRealTimeDeliveries(
                                  realTimeDeliveries.map(d => 
                                    d.id === delivery.id 
                                      ? { ...d, time: e.target.value }
                                      : d
                                  )
                                )
                              }}
                            />
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Definir para agora"
                              onClick={() => {
                                const now = new Date();
                                const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                                setRealTimeDeliveries(
                                  realTimeDeliveries.map(d => 
                                    d.id === delivery.id 
                                      ? { ...d, time: timeString }
                                      : d
                                  )
                                )
                              }}
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`delivery-editor-${delivery.id}`}>
                            Editor responsável:
                          </Label>
                          <Select
                            value={delivery.editorId}
                            onValueChange={value => {
                              setRealTimeDeliveries(
                                realTimeDeliveries.map(d => 
                                  d.id === delivery.id 
                                    ? { ...d, editorId: value }
                                    : d
                                )
                              )
                            }}
                          >
                            <SelectTrigger id={`delivery-editor-${delivery.id}`}>
                              <SelectValue placeholder="Selecionar editor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="maria">Maria Souza</SelectItem>
                              <SelectItem value="pedro">Pedro Alves</SelectItem>
                              <SelectItem value="carlos">Carlos Lima</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Plataforma de destino:</Label>
                          <div className="flex items-center gap-4 h-10">
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                id={`reels-${delivery.id}`}
                                checked={delivery.platforms.reels}
                                onCheckedChange={checked => {
                                  setRealTimeDeliveries(
                                    realTimeDeliveries.map(d => 
                                      d.id === delivery.id 
                                        ? { 
                                            ...d, 
                                            platforms: { 
                                              ...d.platforms,
                                              reels: Boolean(checked)
                                            } 
                                          }
                                        : d
                                    )
                                  )
                                }}
                              />
                              <Label htmlFor={`reels-${delivery.id}`}>Reels</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                id={`stories-${delivery.id}`}
                                checked={delivery.platforms.stories}
                                onCheckedChange={checked => {
                                  setRealTimeDeliveries(
                                    realTimeDeliveries.map(d => 
                                      d.id === delivery.id 
                                        ? { 
                                            ...d, 
                                            platforms: { 
                                              ...d.platforms,
                                              stories: Boolean(checked)
                                            } 
                                          }
                                        : d
                                    )
                                  )
                                }}
                              />
                              <Label htmlFor={`stories-${delivery.id}`}>Stories</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                id={`feed-${delivery.id}`}
                                checked={delivery.platforms.feed}
                                onCheckedChange={checked => {
                                  setRealTimeDeliveries(
                                    realTimeDeliveries.map(d => 
                                      d.id === delivery.id 
                                        ? { 
                                            ...d, 
                                            platforms: { 
                                              ...d.platforms,
                                              feed: Boolean(checked)
                                            } 
                                          }
                                        : d
                                    )
                                  )
                                }}
                              />
                              <Label htmlFor={`feed-${delivery.id}`}>Feed</Label>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-2">
                          <Label htmlFor={`delivery-instructions-${delivery.id}`}>
                            Orientações:
                          </Label>
                          <Textarea
                            id={`delivery-instructions-${delivery.id}`}
                            placeholder="Orientações específicas..."
                            className="min-h-[80px]"
                            value={delivery.instructions}
                            onChange={e => {
                              setRealTimeDeliveries(
                                realTimeDeliveries.map(d => 
                                  d.id === delivery.id 
                                    ? { ...d, instructions: e.target.value }
                                    : d
                                )
                              )
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {realTimeDeliveries.length === 0 && (
                  <div className="text-center p-8 border-dashed border-2 rounded-md">
                    <p className="text-muted-foreground">Nenhuma entrega real-time configurada</p>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleAddRealTimeDelivery} 
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Entrega Real Time
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="teaser-time">Horário do teaser final:</Label>
                  <Input 
                    id="teaser-time" 
                    type="time" 
                    value={teaserTime}
                    onChange={e => setTeaserTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Seção: Entregas Pós-Evento */}
            <div className="bg-background border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium text-cyan-500">
                Entregas Pós-Evento
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo de entrega:</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="deadline"
                      type="number"
                      min="1"
                      max="30"
                      value={postEventDeadline}
                      onChange={e => setPostEventDeadline(e.target.value)}
                      className="w-20"
                    />
                    <Select 
                      value={deadlineUnit}
                      onValueChange={setDeadlineUnit}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="horas">horas</SelectItem>
                        <SelectItem value="dias">dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-md p-4 space-y-2">
                <Label>Opções de pacote:</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="aftermovie" 
                      checked={postEventOptions.aftermovie}
                      onCheckedChange={(checked) => {
                        setPostEventOptions({
                          ...postEventOptions,
                          aftermovie: Boolean(checked)
                        })
                      }}
                    />
                    <Label htmlFor="aftermovie">Aftermovie</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="highlights" 
                      checked={postEventOptions.highlights}
                      onCheckedChange={(checked) => {
                        setPostEventOptions({
                          ...postEventOptions,
                          highlights: Boolean(checked)
                        })
                      }}
                    />
                    <Label htmlFor="highlights">
                      Vídeo de melhores momentos
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="sponsor-versions" 
                      checked={postEventOptions.sponsorVersions}
                      onCheckedChange={(checked) => {
                        setPostEventOptions({
                          ...postEventOptions,
                          sponsorVersions: Boolean(checked)
                        })
                      }}
                    />
                    <Label htmlFor="sponsor-versions">
                      Versões individuais por patrocinador
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-notes">Anotações:</Label>
                <Textarea
                  id="post-notes"
                  placeholder="Anotações adicionais para entregas pós-evento..."
                  className="min-h-[100px]"
                  value={postEventNotes}
                  onChange={e => setPostEventNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Exportação padrão para uso em imports diretos
export default BriefingWidget