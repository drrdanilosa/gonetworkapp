'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  BarChart3,
} from 'lucide-react'

interface Task {
  id: string
  name: string
  description?: string
  status: string
  dueDate: string
}

interface Phase {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  status: string
  type?: string
  tasks?: Task[]
}

interface TimelineTabProps {
  eventId: string
  initialData?: Phase[]
  onDataLoad?: (data: Phase[]) => void
  refreshTrigger?: number
}

const TimelineTab = ({
  eventId,
  initialData = [],
  onDataLoad,
  refreshTrigger = 0,
}: TimelineTabProps) => {
  const [timeline, setTimeline] = useState<Phase[]>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Função para fetch da timeline com useCallback para evitar re-renders desnecessários
  const fetchTimeline = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) {
          setIsRefreshing(true)
        } else {
          setLoading(true)
        }
        setError(null)

        // Cache busting para garantir dados frescos
        const timestamp = Date.now()
        const response = await fetch(
          `/api/timeline/${eventId}?t=${timestamp}`,
          {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          }
        )

        if (!response.ok) {
          if (response.status === 404) {
            // Timeline não existe ainda
            setTimeline([])
            onDataLoad?.([])
            return
          }
          throw new Error(`Erro ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log('📅 Timeline carregada:', data)

        let timelineData: Phase[] = []

        // A API pode retornar diferentes formatos
        if (Array.isArray(data)) {
          timelineData = data
        } else if (data.timeline && Array.isArray(data.timeline)) {
          timelineData = data.timeline
        } else if (data.phases && Array.isArray(data.phases)) {
          timelineData = data.phases
        } else {
          timelineData = []
        }

        setTimeline(timelineData)
        onDataLoad?.(timelineData)
      } catch (err) {
        console.error('❌ Erro ao carregar timeline:', err)
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar timeline'
        )
      } finally {
        setLoading(false)
        setIsRefreshing(false)
      }
    },
    [eventId, onDataLoad]
  )

  // Effect para carregar dados iniciais
  useEffect(() => {
    if (initialData.length > 0) {
      console.log(
        '📊 Usando dados iniciais fornecidos:',
        initialData.length,
        'fases'
      )
      setTimeline(initialData)
      setLoading(false)
      onDataLoad?.(initialData)
    } else {
      console.log('🔄 Carregando timeline da API...')
      fetchTimeline()
    }
  }, [initialData, fetchTimeline, onDataLoad])

  // Effect para refresh trigger
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('🔄 Refresh trigger ativado:', refreshTrigger)
      fetchTimeline()
    }
  }, [refreshTrigger, fetchTimeline])

  // Função para refresh manual
  const handleManualRefresh = () => {
    fetchTimeline(true)
  }

  // Calcular estatísticas
  const getTimelineStats = () => {
    const totalPhases = timeline.length
    const completedPhases = timeline.filter(
      p => p.status === 'completed'
    ).length
    const inProgressPhases = timeline.filter(
      p => p.status === 'in-progress'
    ).length
    const pendingPhases = timeline.filter(p => p.status === 'pending').length

    const totalTasks = timeline.reduce(
      (sum, phase) => sum + (phase.tasks?.length || 0),
      0
    )
    const completedTasks = timeline.reduce(
      (sum, phase) =>
        sum + (phase.tasks?.filter(t => t.status === 'completed').length || 0),
      0
    )

    return {
      totalPhases,
      completedPhases,
      inProgressPhases,
      pendingPhases,
      totalTasks,
      completedTasks,
      progressPercentage:
        totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0,
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return 'Data inválida'
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', color: 'bg-yellow-500' },
      'in-progress': { label: 'Em Andamento', color: 'bg-blue-500' },
      completed: { label: 'Concluído', color: 'bg-green-500' },
      cancelled: { label: 'Cancelado', color: 'bg-red-500' },
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      color: 'bg-gray-500',
    }

    return (
      <Badge className={`${statusInfo.color} text-white`}>
        {statusInfo.label}
      </Badge>
    )
  }

  const getPhaseIcon = (type?: string) => {
    switch (type) {
      case 'planning':
        return <Calendar className="size-5 text-blue-500" />
      case 'production':
        return <Clock className="size-5 text-orange-500" />
      case 'execution':
        return <CheckCircle className="size-5 text-green-500" />
      default:
        return <AlertCircle className="size-5 text-gray-500" />
    }
  }

  const stats = getTimelineStats()

  if (loading) {
    return (
      <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
        <div className="mb-6 flex items-center gap-2">
          <Loader2 className="size-6 animate-spin text-[#BD93F9]" />
          <h2 className="text-2xl font-bold text-[#BD93F9]">
            Carregando Timeline...
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-[#6272A4] bg-[#44475A]">
              <CardHeader>
                <Skeleton className="h-6 w-1/2 bg-[#6272A4]" />
                <Skeleton className="h-4 w-3/4 bg-[#6272A4]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full bg-[#6272A4]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
        <h2 className="mb-6 text-2xl font-bold text-[#BD93F9]">Timeline</h2>
        <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-6">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="size-5 text-red-400" />
            <h3 className="font-semibold text-red-400">
              Erro ao carregar timeline
            </h3>
          </div>
          <p className="mb-4 text-red-300">{error}</p>
          <Button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="border-red-500/30 bg-red-900/20 text-red-300 hover:bg-red-900/40"
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 size-4" />
            )}
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  if (timeline.length === 0) {
    return (
      <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
        <h2 className="mb-6 text-2xl font-bold text-[#BD93F9]">Timeline</h2>
        <div className="rounded-lg border border-[#6272A4] bg-[#44475A] p-8 text-center">
          <Calendar className="mx-auto mb-4 size-12 text-[#6272A4]" />
          <h3 className="mb-2 text-lg font-semibold text-[#F8F8F2]">
            Nenhuma timeline encontrada
          </h3>
          <p className="mb-4 text-[#6272A4]">
            Primeiro, preencha e salve o briefing do evento. Em seguida, clique
            em &quot;Gerar Timeline&quot; para criar o cronograma
            automaticamente.
          </p>
          <div className="text-sm text-[#6272A4]">
            💡 Dica: A timeline será baseada nos dados do briefing
            (patrocinadores, palcos, entregas, etc.)
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#BD93F9]">
          Timeline do Projeto
        </h2>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="border-[#6272A4] bg-[#44475A] text-[#F8F8F2] hover:bg-[#6272A4]"
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 size-4" />
            )}
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-[#6272A4] bg-[#44475A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="size-8 text-[#BD93F9]" />
              <div>
                <p className="text-2xl font-bold text-[#F8F8F2]">
                  {stats.totalPhases}
                </p>
                <p className="text-sm text-[#6272A4]">Total de Fases</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#6272A4] bg-[#44475A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="size-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-[#F8F8F2]">
                  {stats.completedPhases}
                </p>
                <p className="text-sm text-[#6272A4]">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#6272A4] bg-[#44475A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="size-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-[#F8F8F2]">
                  {stats.inProgressPhases}
                </p>
                <p className="text-sm text-[#6272A4]">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#6272A4] bg-[#44475A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-[#F8F8F2]">
                  {stats.progressPercentage}%
                </p>
                <p className="text-sm text-[#6272A4]">Progresso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {timeline.map((phase, index) => (
          <Card key={phase.id} className="border-[#6272A4] bg-[#44475A]">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getPhaseIcon(phase.type)}
                  <div>
                    <CardTitle className="text-lg text-[#F8F8F2]">
                      {index + 1}. {phase.name}
                    </CardTitle>
                    {phase.description && (
                      <p className="mt-1 text-sm text-[#6272A4]">
                        {phase.description}
                      </p>
                    )}
                  </div>
                </div>
                {getStatusBadge(phase.status)}
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm text-[#6272A4]">
                <div className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  Início: {formatDate(phase.startDate)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="size-4" />
                  Fim: {formatDate(phase.endDate)}
                </div>
              </div>
            </CardHeader>

            {phase.tasks && phase.tasks.length > 0 && (
              <CardContent className="pt-0">
                <h4 className="mb-3 font-semibold text-[#BD93F9]">
                  Tarefas ({phase.tasks.length})
                </h4>
                <div className="space-y-2">
                  {phase.tasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg bg-[#282A36] p-3"
                    >
                      <div className="flex-1">
                        <h5 className="font-medium text-[#F8F8F2]">
                          {task.name}
                        </h5>
                        {task.description && (
                          <p className="mt-1 text-sm text-[#6272A4]">
                            {task.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-1 text-xs text-[#6272A4]">
                          <Clock className="size-3" />
                          Prazo: {formatDate(task.dueDate)}
                        </div>
                      </div>
                      <div className="ml-4">{getStatusBadge(task.status)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-[#6272A4] bg-[#44475A] p-4">
        <div className="flex items-center gap-2 text-sm text-[#6272A4]">
          <CheckCircle className="size-4 text-green-400" />
          <span>
            Timeline gerada automaticamente baseada no briefing do evento
          </span>
        </div>
      </div>
    </div>
  )
}

export default TimelineTab
