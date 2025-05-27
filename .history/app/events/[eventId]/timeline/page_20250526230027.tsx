'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import Timeline from '@/components/widgets/Timeline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Clock, CheckCircle, Circle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Interface para as fases da timeline
interface TimelinePhase {
  id: string
  name: string
  start: string
  end: string
  completed: boolean
  duration?: number
}

export default function TimelinePage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string
  const { projects, currentProject, setCurrentProject } = useProjectsStore()

  const [isLoading, setIsLoading] = useState(true)

  // Carregar o projeto atual
  useEffect(() => {
    const project = projects.find(p => p.id === eventId)
    if (project) {
      setCurrentProject(project)
    }
    setIsLoading(false)
  }, [eventId, projects, setCurrentProject])

  // Voltar para a página principal do evento
  const handleBackToEvent = () => {
    router.push(`/events/${eventId}`)
  }

  // Converter fases do formato do store para o formato do componente Timeline
  const convertPhasesToTimelineFormat = (phases: TimelinePhase[]): any[] => {
    return phases.map(phase => ({
      id: phase.id,
      name: phase.name,
      plannedStart: new Date(phase.start),
      plannedEnd: new Date(phase.end),
      completed: phase.completed,
      duration: phase.duration,
    }))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#50FA7B] mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando timeline...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Projeto não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar os dados do projeto.
            </p>
            <Button onClick={handleBackToEvent} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasTimeline = currentProject.timeline && currentProject.timeline.length > 0
  const timelinePhases = hasTimeline ? convertPhasesToTimelineFormat(currentProject.timeline) : []

  // Estatísticas da timeline
  const completedPhases = timelinePhases.filter(phase => phase.completed).length
  const totalPhases = timelinePhases.length
  const progressPercentage = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleBackToEvent} variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{currentProject.title}</h1>
            <p className="text-muted-foreground">Timeline do Projeto</p>
          </div>
        </div>
        <Badge variant={progressPercentage === 100 ? "default" : "secondary"}>
          {progressPercentage}% Concluído
        </Badge>
      </div>

      {/* Estatísticas */}
      {hasTimeline && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#50FA7B]" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Fases</p>
                  <p className="text-2xl font-bold">{totalPhases}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Fases Concluídas</p>
                  <p className="text-2xl font-bold">{completedPhases}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Progresso</p>
                  <p className="text-2xl font-bold">{progressPercentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasTimeline ? (
            <Timeline 
              phases={timelinePhases}
              projectName={currentProject.title}
              showDetails={true}
            />
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma timeline criada</h3>
              <p className="text-muted-foreground mb-4">
                Este projeto ainda não possui uma timeline. Vá para a página de briefing para gerar uma.
              </p>
              <Button 
                onClick={() => router.push(`/events/${eventId}/briefing`)}
                className="bg-[#50FA7B] text-[#282A36] hover:bg-[#50FA7B]/90"
              >
                Ir para Briefing
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista detalhada das fases */}
      {hasTimeline && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes das Fases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timelinePhases.map((phase, index) => (
                <div 
                  key={phase.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {phase.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{phase.name}</h4>
                      <Badge variant={phase.completed ? "default" : "secondary"}>
                        {phase.completed ? "Concluída" : "Pendente"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Início: {format(phase.plannedStart, "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <span>
                        Fim: {format(phase.plannedEnd, "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <span>
                        Duração: {Math.ceil((phase.plannedEnd.getTime() - phase.plannedStart.getTime()) / (1000 * 60 * 60 * 24))} dias
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
