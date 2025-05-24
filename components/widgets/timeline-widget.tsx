"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  RefreshCcw, 
  Clock, 
  AlertCircle, 
  Download, 
  Calendar, 
  Users 
} from 'lucide-react'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { useUIStore } from '@/store/useUIStore'
import { toast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatDate } from '@/utils/date-utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import Timeline from './Timeline'
import DetailedTimelineView from './DetailedTimelineView'

// Função auxiliar para formatar datas de forma segura
const formatProjectDate = (dateValue: any): string => {
  if (!dateValue) return 'Data não informada'
  
  try {
    const date = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue)
    return isValid(date) ? format(date, 'dd MMM yyyy', { locale: ptBR }) : 'Data inválida'
  } catch {
    return 'Data não disponível'
  }
}

export default function TimelineWidget() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeView, setActiveView] = useState("overview")
  const { projects, generateScheduleFromBriefing } = useProjectsStore()
  const { selectedEventId, setSelectedEventId } = useUIStore()
  
  // Encontrar o projeto selecionado e sua timeline
  const selectedProject = projects.find(p => p.id === selectedEventId)
  const timelineData = selectedProject?.timeline || []
  
  // Handle event selection
  const handleEventChange = (value) => {
    setSelectedEventId(value)
  }
  
  // Handler para atualizar/gerar timeline
  const handleRefresh = () => {
    if (!selectedEventId) {
      toast({
        title: "Nenhum evento selecionado",
        description: "Selecione um evento para carregar ou gerar a timeline.",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    
    // Se não houver timeline, gerar a partir do briefing
    if (!timelineData || timelineData.length === 0) {
      generateScheduleFromBriefing(selectedEventId)
      
      toast({
        title: "Timeline gerada",
        description: "Uma nova timeline foi gerada com base nos dados do briefing."
      })
    } else {
      // Simular atualização de dados
      setTimeout(() => {
        toast({
          title: "Timeline atualizada",
          description: "A timeline foi atualizada com sucesso."
        })
      }, 500)
    }
    
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
  }

  // Handle export
  const handleExport = () => {
    if (!selectedProject || !timelineData.length) {
      toast({
        title: "Nada para exportar",
        description: "Não há dados de timeline para exportar",
        variant: "destructive"
      })
      return
    }
    
    // Criar um objeto para exportação
    const exportData = {
      project: {
        name: selectedProject.name,
        startDate: selectedProject.startDate,
        endDate: selectedProject.endDate
      },
      timeline: timelineData,
      exportedAt: new Date().toISOString(),
      exportedBy: 'contatogonetwork'
    }
    
    // Criar um arquivo para download
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    
    const fileName = `timeline-${selectedProject.name.replace(/\s+/g, '-').toLowerCase()}-${
      formatProjectDate(new Date()).replace(/\s+/g, '-')
    }.json`
    
    // Criar um elemento de link e clicar nele para iniciar o download
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', fileName)
    document.body.appendChild(linkElement)
    linkElement.click()
    document.body.removeChild(linkElement)
    
    toast({
      title: "Download iniciado",
      description: "Os dados da timeline estão sendo baixados"
    })
  }

  // Converter timeline do store para formato do componente Timeline
  const convertTimelineToPhases = (timeline) => {
    return timeline.map(phase => ({
      id: phase.id,
      name: phase.name,
      plannedStart: new Date(phase.start),
      plannedEnd: new Date(phase.end),
      completed: phase.completed,
      duration: phase.duration
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Timeline</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>Evento:</Label>
            <Select 
              value={selectedEventId || ""} 
              onValueChange={value => {
                if (value === "no-events-available") return;
                setSelectedEventId(value);
              }}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecione um evento" />
              </SelectTrigger>
              <SelectContent>
                {projects.length > 0 ? (
                  projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} - {formatProjectDate(project.startDate)}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-events-available" disabled>
                    Nenhum evento disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading || !selectedEventId}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "Atualizando..." : "Atualizar"}
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            disabled={!selectedEventId || !timelineData.length}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {isLoading ? (
        // Estado de carregamento
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-60" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ) : !selectedEventId ? (
        // Nenhum evento selecionado
        <div className="flex flex-col items-center justify-center p-10 border rounded-lg">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-xl font-medium">Nenhum evento selecionado</p>
          <p className="text-muted-foreground mt-2">
            Selecione um evento no menu acima para visualizar sua timeline.
          </p>
        </div>
      ) : !timelineData || timelineData.length === 0 ? (
        // Evento selecionado, mas sem timeline
        <div className="flex flex-col items-center justify-center p-10 border rounded-lg">
          <Clock className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-xl font-medium">Nenhum cronograma disponível</p>
          <p className="text-muted-foreground mt-2 mb-4">
            Gere uma timeline a partir dos dados do briefing.
          </p>
          <Button onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Gerar Timeline
          </Button>
        </div>
      ) : (
        // Exibir a timeline
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList>
            <TabsTrigger value="overview">
              <Calendar className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="detailed">
              <Users className="h-4 w-4 mr-2" />
              Por Membro
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>
                  Timeline: {selectedProject?.name || "Evento"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Usar o componente Timeline básico */}
                <Timeline
                  phases={convertTimelineToPhases(timelineData)}
                  finalDueDate={selectedProject?.endDate ? new Date(selectedProject.endDate) : undefined}
                  projectName={selectedProject?.name}
                  showDetails={true}
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Timeline
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="detailed">
            {/* Usar o componente de visualização detalhada */}
            <DetailedTimelineView selectedProject={selectedProject} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}