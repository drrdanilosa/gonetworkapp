"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCcw, Download, Calendar, Timeline as TimelineIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Definição dos tipos de dados
interface Phase {
  id: string
  name: string
  plannedStart: Date
  plannedEnd: Date
  completed: boolean
}

interface Task {
  id: string
  name: string
  memberId: string
  memberName: string
  memberRole: string
  startTime: string // formato HH:MM
  endTime: string // formato HH:MM
  type: 'captacao' | 'edicao' | 'entrega' | 'aprovacao' | string
  status: 'pendente' | 'andamento' | 'concluido' | 'atrasado' | string
  date: Date // a data da tarefa
}

interface TimelineData {
  projectId: string
  projectName: string
  phases: Phase[]
  tasks: Task[]
  finalDueDate?: Date
}

interface TimelineWidgetProps {
  eventId?: string
  initialData?: TimelineData
  onExport?: (data: TimelineData) => void
  onRefresh?: () => void
}

export default function TimelineWidget({
  eventId,
  initialData,
  onExport,
  onRefresh
}: TimelineWidgetProps) {
  // Estado para armazenar dados da timeline
  const [timelineData, setTimelineData] = useState<TimelineData | null>(initialData || null)
  
  // Estados para filtros
  const [selectedEvent, setSelectedEvent] = useState<string>(eventId || "")
  const [selectedMember, setSelectedMember] = useState<string>("all")
  const [selectedActivity, setSelectedActivity] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [activeView, setActiveView] = useState<string>("detailed")
  
  // Eventos disponíveis (em uma aplicação real, isso viria da API)
  const events = [
    { id: "festival", name: "Festival de Música - 18-20 Mai 2025" },
    { id: "lancamento", name: "Lançamento de Produto - 25 Mai 2025" },
    { id: "conferencia", name: "Conferência Tech - 01 Jun 2025" }
  ]
  
  // Membros da equipe (em uma aplicação real, isso viria da API)
  const members = [
    { id: "joao", name: "João Silva", role: "Cinegrafia" },
    { id: "maria", name: "Maria Souza", role: "Edição" },
    { id: "carlos", name: "Carlos Lima", role: "Drone" },
    { id: "ana", name: "Ana Costa", role: "Coordenação" }
  ]

  // Efeito para carregar dados com base no evento selecionado
  useEffect(() => {
    if (!selectedEvent) return
    
    // Em uma aplicação real, buscaria dados da API
    const fetchTimelineData = async () => {
      try {
        // Mock de chamada API para buscar dados baseados no ID do evento
        // const response = await fetch(`/api/events/${selectedEvent}/timeline`)
        // const data = await response.json()
        
        // Para demonstração, usamos dados de exemplo
        const mockData: TimelineData = {
          projectId: selectedEvent,
          projectName: events.find(e => e.id === selectedEvent)?.name || "",
          phases: [
            {
              id: "phase1",
              name: "Planejamento",
              plannedStart: new Date(2025, 4, 1), // 1 de maio
              plannedEnd: new Date(2025, 4, 10), // 10 de maio
              completed: true
            },
            {
              id: "phase2",
              name: "Pré-produção",
              plannedStart: new Date(2025, 4, 10), // 10 de maio
              plannedEnd: new Date(2025, 4, 15), // 15 de maio
              completed: true
            },
            {
              id: "phase3",
              name: "Evento",
              plannedStart: new Date(2025, 4, 18), // 18 de maio
              plannedEnd: new Date(2025, 4, 20), // 20 de maio
              completed: false
            },
            {
              id: "phase4",
              name: "Pós-produção",
              plannedStart: new Date(2025, 4, 21), // 21 de maio
              plannedEnd: new Date(2025, 4, 28), // 28 de maio
              completed: false
            }
          ],
          tasks: [
            {
              id: "task1",
              name: "Captação - Palco Principal",
              memberId: "joao",
              memberName: "João Silva",
              memberRole: "Cinegrafia",
              startTime: "12:00",
              endTime: "14:00",
              type: "captacao",
              status: "andamento",
              date: new Date(2025, 4, 18) // 18 de maio
            },
            {
              id: "task2",
              name: "Patrocinador A - Stand",
              memberId: "joao",
              memberName: "João Silva",
              memberRole: "Cinegrafia",
              startTime: "14:00",
              endTime: "15:00",
              type: "captacao",
              status: "pendente",
              date: new Date(2025, 4, 18) // 18 de maio
            },
            {
              id: "task3",
              name: "Captação - Backstage",
              memberId: "joao",
              memberName: "João Silva",
              memberRole: "Cinegrafia",
              startTime: "17:00",
              endTime: "19:00",
              type: "captacao",
              status: "pendente",
              date: new Date(2025, 4, 19) // 19 de maio
            },
            {
              id: "task4",
              name: "Edição - Abertura",
              memberId: "maria",
              memberName: "Maria Souza",
              memberRole: "Edição",
              startTime: "12:30",
              endTime: "14:30",
              type: "edicao",
              status: "andamento",
              date: new Date(2025, 4, 18) // 18 de maio
            },
            {
              id: "task5",
              name: "Entrega - Reels",
              memberId: "maria",
              memberName: "Maria Souza",
              memberRole: "Edição",
              startTime: "15:00",
              endTime: "15:30",
              type: "entrega",
              status: "pendente",
              date: new Date(2025, 4, 18) // 18 de maio
            },
            {
              id: "task6",
              name: "Edição - Teaser Final",
              memberId: "maria",
              memberName: "Maria Souza",
              memberRole: "Edição",
              startTime: "18:00",
              endTime: "20:00",
              type: "edicao",
              status: "andamento",
              date: new Date(2025, 4, 19) // 19 de maio
            },
            {
              id: "task7",
              name: "Captação Drone - Área Externa",
              memberId: "carlos",
              memberName: "Carlos Lima",
              memberRole: "Drone",
              startTime: "13:00",
              endTime: "14:00",
              type: "captacao",
              status: "andamento",
              date: new Date(2025, 4, 18) // 18 de maio
            },
            {
              id: "task8",
              name: "Captação Drone - Vista Geral",
              memberId: "carlos",
              memberName: "Carlos Lima",
              memberRole: "Drone",
              startTime: "16:00",
              endTime: "16:30",
              type: "captacao",
              status: "atrasado",
              date: new Date(2025, 4, 19) // 19 de maio
            },
            {
              id: "task9",
              name: "Aprovação - Material Inicial",
              memberId: "ana",
              memberName: "Ana Costa",
              memberRole: "Coordenação",
              startTime: "12:50",
              endTime: "13:20",
              type: "aprovacao",
              status: "concluido",
              date: new Date(2025, 4, 18) // 18 de maio
            },
            {
              id: "task10",
              name: "Entrega - Stories",
              memberId: "ana",
              memberName: "Ana Costa",
              memberRole: "Coordenação",
              startTime: "14:30",
              endTime: "15:00",
              type: "entrega",
              status: "concluido",
              date: new Date(2025, 4, 18) // 18 de maio
            },
            {
              id: "task11",
              name: "Aprovação - Teaser",
              memberId: "ana",
              memberName: "Ana Costa",
              memberRole: "Coordenação",
              startTime: "19:00",
              endTime: "20:00",
              type: "aprovacao",
              status: "pendente",
              date: new Date(2025, 4, 19) // 19 de maio
            }
          ],
          finalDueDate: new Date(2025, 4, 28) // 28 de maio
        }
        
        setTimelineData(mockData)
      } catch (error) {
        console.error("Erro ao buscar dados da timeline:", error)
      }
    }
    
    fetchTimelineData()
  }, [selectedEvent])

  // Filtra tarefas com base nos filtros selecionados
  const filteredTasks = timelineData?.tasks.filter(task => {
    if (selectedMember !== "all" && task.memberId !== selectedMember) return false
    if (selectedActivity !== "all" && task.type !== selectedActivity) return false
    if (selectedStatus !== "all" && task.status !== selectedStatus) return false
    return true
  }) || []

  // Agrupa tarefas por membro para visualização detalhada
  const tasksByMember = members.reduce((acc, member) => {
    acc[member.id] = filteredTasks.filter(task => task.memberId === member.id)
    return acc
  }, {} as Record<string, Task[]>)

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      // Recarregar dados
      if (selectedEvent) {
        // Simular uma atualização - em um cenário real, recarregaria da API
        const currentEvent = selectedEvent
        setSelectedEvent("")
        setTimeout(() => setSelectedEvent(currentEvent), 100)
      }
    }
  }

  const handleExport = () => {
    if (timelineData && onExport) {
      onExport(timelineData)
    } else if (timelineData) {
      // Implementação padrão de exportação - poderia gerar CSV, PDF, etc.
      const dataStr = JSON.stringify(timelineData, null, 2)
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
      
      const exportFileDefaultName = `timeline-${selectedEvent}-${new Date().toISOString().slice(0, 10)}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
    }
  }

  // Converte string de hora (HH:MM) para porcentagem do dia (0-100)
  const timeToPercentage = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    // Consideramos apenas horário das 10h às 22h (12 horas)
    const startHour = 10
    const totalHours = 12
    
    const timeValue = hours - startHour + minutes / 60
    return (timeValue / totalHours) * 100
  }

  // Calcula largura da tarefa com base nos horários de início e fim
  const calculateTaskWidth = (startTime: string, endTime: string): number => {
    return timeToPercentage(endTime) - timeToPercentage(startTime)
  }

  // Define cor de fundo da tarefa com base no tipo e status
  const getTaskColorClass = (task: Task): string => {
    if (task.status === 'concluido') return 'bg-success text-success-foreground'
    if (task.status === 'atrasado') return 'bg-destructive text-destructive-foreground'
    
    switch (task.type) {
      case 'captacao':
        return 'bg-primary text-primary-foreground'
      case 'edicao':
        return 'bg-warning text-warning-foreground'
      case 'entrega':
        return 'bg-secondary text-secondary-foreground'
      case 'aprovacao':
        return 'bg-cyan-500 text-white'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  // Componente para visualização de cronograma de fases do projeto
  const PhasesTimeline = ({ phases, finalDueDate }: { phases: Phase[], finalDueDate?: Date }) => {
    if (!phases || phases.length === 0) return null
    
    // Ordena as fases por data de início para garantir ordem cronológica
    const sortedPhases = [...phases].sort(
      (a, b) => a.plannedStart.getTime() - b.plannedStart.getTime()
    )
    const timelineStart = sortedPhases[0].plannedStart
    const lastPhaseEnd = sortedPhases[sortedPhases.length - 1].plannedEnd
    
    // Determina o fim da timeline (considera prazo final se for após a última fase)
    const timelineEnd =
      finalDueDate && finalDueDate > lastPhaseEnd ? finalDueDate : lastPhaseEnd
    const totalDurationMs = timelineEnd.getTime() - timelineStart.getTime()
    
    // Calcula a largura proporcional de cada fase em relação ao tempo total
    const columns: string[] = sortedPhases.map(phase => {
      let durationMs = phase.plannedEnd.getTime() - phase.plannedStart.getTime()
      if (durationMs <= 0) {
        // Fases instantâneas (mesmo dia) recebem um mínimo de duração visual
        durationMs = 12 * 60 * 60 * 1000 // 12h em ms (~0.5 dia)
      }
      const fraction = durationMs / totalDurationMs
      const fractionStr = (fraction * 100).toFixed(2)
      return `${fractionStr}fr`
    })
    const gridTemplate = columns.join(' ')
    
    // Define cor de fundo da fase conforme status e datas
    const getPhaseColorClass = (phase: Phase) => {
      if (phase.completed) return 'bg-green-600' // concluída: verde
      const now = new Date()
      if (phase.plannedEnd < now) return 'bg-red-600' // não concluída e já passou do fim: vermelho (atrasada)
      if (phase.plannedStart <= now && phase.plannedEnd >= now) {
        return 'bg-yellow-500' // em andamento: amarelo
      }
      return 'bg-blue-600' // futura/pendente: azul
    }
    
    // Calcula posição do marcador de prazo final (linha vertical) se houver prazo
    let finalDueMarkerStyle: React.CSSProperties | undefined
    if (finalDueDate) {
      const startTime = timelineStart.getTime()
      const endTime = timelineEnd.getTime()
      const dueTime = finalDueDate.getTime()
      if (dueTime >= startTime && dueTime <= endTime) {
        const pct = ((dueTime - startTime) / (endTime - startTime)) * 100
        finalDueMarkerStyle = { left: `${pct}%` }
      } else if (dueTime < startTime) {
        finalDueMarkerStyle = { left: '0%' }
      } else if (dueTime > endTime) {
        finalDueMarkerStyle = { left: '100%' }
      }
    }
    
    return (
      <div className="relative w-full p-4 mt-4 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Cronograma de Fases</h3>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span>Concluída</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Em Andamento</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span>Pendente</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>Atrasada</span>
            </div>
          </div>
        </div>
        
        {/* Datas na parte superior */}
        <div className="mb-1">
          <div
            className="grid items-center text-xs text-muted-foreground"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {sortedPhases.map(phase => (
              <div key={`date-${phase.id}`} className="px-1">
                {phase.plannedStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Barra de timeline usando CSS Grid */}
        <div
          className="grid items-center gap-1 w-full"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {sortedPhases.map(phase => {
            const colorClass = getPhaseColorClass(phase)
            const phaseEndsAfterDue =
              finalDueDate && phase.plannedEnd > finalDueDate
            return (
              <div 
                key={phase.id} 
                className={`${colorClass} relative h-10 rounded-md flex items-center justify-center`}
              >
                {/* Nome da fase centralizado + indicadores */}
                <span className="text-xs text-white text-center whitespace-nowrap px-1">
                  {phase.name}
                  {phase.completed && ' ✓'}
                  {/* Indicador de atraso */}
                  {!phase.completed && phase.plannedEnd < new Date() && (
                    <span className="ml-1 text-red-200">(atrasado)</span>
                  )}
                  {/* Indicador de extrapolação do prazo */}
                  {phaseEndsAfterDue && (
                    <span className="ml-1 text-yellow-200">(!)</span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
        
        {/* Marcador vertical do Prazo Final */}
        {finalDueMarkerStyle && (
          <>
            <div
              className="absolute top-0 bottom-0 border-l-2 border-yellow-400 opacity-70"
              style={finalDueMarkerStyle}
            />
            <div 
              className="absolute text-xs text-yellow-600 font-semibold"
              style={{ 
                ...finalDueMarkerStyle, 
                transform: 'translateX(-50%)',
                top: '-20px'
              }}
            >
              Prazo Final
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Timeline</CardTitle>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Evento:</Label>
              <Select 
                value={selectedEvent}
                onValueChange={setSelectedEvent}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Selecione um evento" />
                </SelectTrigger>
                <SelectContent>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              disabled={!timelineData}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {!timelineData ? (
          <div className="text-center py-8">
            <p>Selecione um evento para visualizar a timeline.</p>
          </div>
        ) : (
          <>
            <Tabs value={activeView} onValueChange={setActiveView}>
              <TabsList className="mb-4">
                <TabsTrigger value="detailed">
                  <Calendar className="h-4 w-4 mr-2" />
                  Visualização Detalhada
                </TabsTrigger>
                <TabsTrigger value="phases">
                  <TimelineIcon className="h-4 w-4 mr-2" />
                  Fases do Projeto
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="detailed">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Label>Membro:</Label>
                    <Select 
                      value={selectedMember} 
                      onValueChange={setSelectedMember}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filtrar por membro" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Membros</SelectItem>
                        {members.map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label>Atividade:</Label>
                    <Select 
                      value={selectedActivity} 
                      onValueChange={setSelectedActivity}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filtrar por atividade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Atividades</SelectItem>
                        <SelectItem value="captacao">Captação</SelectItem>
                        <SelectItem value="edicao">Edição</SelectItem>
                        <SelectItem value="entrega">Entrega</SelectItem>
                        <SelectItem value="aprovacao">Aprovação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label>Status:</Label>
                    <Select 
                      value={selectedStatus} 
                      onValueChange={setSelectedStatus}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="andamento">Em andamento</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border rounded-md overflow-hidden">
                  <div className="bg-secondary/30 p-2 border-b">
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium">
                      <div className="col-span-2">Membro</div>
                      <div className="col-span-10 flex">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="flex-1 text-center">
                            {10 + i}:00
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-background">
                    {members.map((member) => {
                      const memberTasks = tasksByMember[member.id] || []
                      
                      // Não mostrar membros sem tarefas quando houver filtro
                      if (memberTasks.length === 0 && 
                          (selectedMember !== "all" || 
                           selectedActivity !== "all" || 
                           selectedStatus !== "all")) {
                        return null
                      }
                      
                      return (
                        <div key={member.id} className="border-b last:border-b-0">
                          <div className="grid grid-cols-12 gap-2 p-2">
                            <div className="col-span-2 text-sm">{member.name} ({member.role})</div>
                            <div className="col-span-10 relative h-16">
                              {memberTasks.map(task => {
                                const left = timeToPercentage(task.startTime)
                                const width = calculateTaskWidth(task.startTime, task.endTime)
                                const colorClass = getTaskColorClass(task)
                                
                                return (
                                  <div
                                    key={task.id}
                                    className={`absolute h-12 top-2 rounded-md flex items-center justify-center text-xs px-2 overflow-hidden ${colorClass}`}
                                    style={{ 
                                      left: `${left}%`, 
                                      width: `${width}%` 
                                    }}
                                    title={`${task.name} (${task.startTime}-${task.endTime})`}
                                  >
                                    <div className="truncate">
                                      {task.name}
                                      {task.status === 'concluido' && ' ✓'}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    
                    {filteredTasks.length === 0 && (
                      <div className="p-6 text-center text-muted-foreground">
                        Nenhuma tarefa encontrada com os filtros selecionados.
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Legenda das cores */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span>Captação</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-warning"></div>
                    <span>Edição</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                    <span>Entrega</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    <span>Aprovação</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                    <span>Concluído</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <span>Atrasado</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="phases">
                {timelineData && (
                  <PhasesTimeline 
                    phases={timelineData.phases} 
                    finalDueDate={timelineData.finalDueDate} 
                  />
                )}
                
                <div className="bg-muted/30 rounded-lg p-4 mt-4">
                  <h3 className="text-lg font-medium mb-2">Resumo das Fases</h3>
                  <div className="space-y-2">
                    {timelineData?.phases.map(phase => {
                      const startDate = phase.plannedStart.toLocaleDateString('pt-BR')
                      const endDate = phase.plannedEnd.toLocaleDateString('pt-BR')
                      const completed = phase.completed
                      
                      return (
                        <div key={phase.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <span className="font-medium">{phase.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {startDate} até {endDate}
                            </span>
                          </div>
                          <div>
                            {completed ? (
                              <span className="text-green-600 font-medium flex items-center">
                                Concluído ✓
                              </span>
                            ) : (
                              <span className="text-blue-600 font-medium">
                                Pendente
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  )
}