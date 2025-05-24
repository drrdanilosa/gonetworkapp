'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  Edit,
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
  initialData?: Phase[] // Nova prop para dados iniciais
  onDataLoad?: (data: Phase[]) => void // Callback quando dados são carregados
  refreshTrigger?: number // Trigger para forçar refresh
}

const TimelineTabImproved = ({ 
  eventId, 
  initialData, 
  onDataLoad,
  refreshTrigger = 0 
}: TimelineTabProps) => {
  const [timeline, setTimeline] = useState<Phase[]>(initialData || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  // Função para buscar dados da timeline
  const fetchTimeline = async (showLoading = true) => {
    if (!eventId) return

    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)

      console.log('📅 Buscando timeline para eventId:', eventId)

      // Cache busting para garantir dados mais recentes
      const timestamp = Date.now()
      const response = await fetch(`/api/timeline/${eventId}?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.log('📅 Timeline não existe ainda')
          setTimeline([])
          return
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📅 Timeline carregada:', data)

      // Processar diferentes formatos de resposta da API
      let timelineData: Phase[] = []
      if (Array.isArray(data)) {
        timelineData = data
      } else if (data.timeline && Array.isArray(data.timeline)) {
        timelineData = data.timeline
      } else if (data.phases && Array.isArray(data.phases)) {
        timelineData = data.phases
      }

      console.log(`✅ Timeline processada: ${timelineData.length} fases`)
      setTimeline(timelineData)
      setLastFetch(new Date())

      // Callback para notificar o componente pai
      if (onDataLoad) {
        onDataLoad(timelineData)
      }

    } catch (err) {
      console.error('❌ Erro ao carregar timeline:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar timeline'
      setError(errorMessage)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  // Effect para carregar dados iniciais
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      console.log('📅 Usando dados iniciais da timeline')
      setTimeline(initialData)
      setLastFetch(new Date())
    } else {
      fetchTimeline()
    }
  }, [eventId, initialData])

  // Effect para responder a mudanças no trigger de refresh
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('📅 Refresh trigger acionado:', refreshTrigger)
      fetchTimeline(false) // Refresh silencioso
    }
  }, [refreshTrigger])

  // Função para refresh manual
  const handleRefresh = () => {
    fetchTimeline(true)
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

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
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
      planned: { label: 'Planejado', color: 'bg-purple-500' },
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
      case 'post-event':
        return <Eye className="size-5 text-purple-500" />
      default:
        return <AlertCircle className="size-5 text-gray-500" />
    }
  }

  const getTimelineStats = () => {
    const total = timeline.length
    const completed = timeline.filter(phase => phase.status === 'completed').length
    const inProgress = timeline.filter(phase => phase.status === 'in-progress').length
    const pending = timeline.filter(phase => phase.status === 'pending' || phase.status === 'planned').length

    return { total, completed, inProgress, pending }
  }

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
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#BD93F9]">Timeline</h2>
          <Button variant="outline" onClick={handleRefresh} size="sm">
            <RefreshCw className="mr-2 size-4" />
            Tentar Novamente
          </Button>
        </div>
        <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-6">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="size-5 text-red-400" />
            <h3 className="font-semibold text-red-400">
              Erro ao carregar timeline
            </h3>
          </div>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  if (timeline.length === 0) {
    return (
      <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#BD93F9]">Timeline</h2>
          <Button variant="outline" onClick={handleRefresh} size="sm">
            <RefreshCw className="mr-2 size-4" />
            Atualizar
          </Button>
        </div>
        <div className="rounded-lg border border-[#6272A4] bg-[#44475A] p-8 text-center">
          <Calendar className="mx-auto mb-4 size-12 text-[#6272A4]" />
          <h3 className="mb-2 text-lg font-semibold text-[#F8F8F2]">
            Nenhuma timeline encontrada
          </h3>
          <p className="mb-4 text-[#6272A4]">
            Primeiro, preencha e salve o briefing do evento. Em seguida, clique
            em "Gerar Timeline" para criar o cronograma automaticamente.
          </p>
          <div className="text-sm text-[#6272A4]">
            💡 Dica: A timeline será baseada nos dados do briefing
            (patrocinadores, palcos, entregas, etc.)
          </div>
        </div>
      </div>
    )
  }

  const stats = getTimelineStats()

  return (
    <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#BD93F9]">
            Timeline do Projeto
          </h2>
          {lastFetch && (
            <p className="text-xs text-[#6272A4]">
              Última atualização: {formatDateTime(lastFetch.toISOString())}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} size="sm">
            <RefreshCw className="mr-2 size-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas da timeline */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[#6272A4] bg-[#44475A] p-3 text-center">
          <div className="text-2xl font-bold text-[#F8F8F2]">{stats.total}</div>
          <div className="text-xs text-[#6272A4]">Total de Fases</div>
        </div>
        <div className="rounded-lg border border-green-500/30 bg-green-900/20 p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
          <div className="text-xs text-green-300">Concluídas</div>
        </div>
        <div className="rounded-lg border border-blue-500/30 bg-blue-900/20 p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.inProgress}</div>
          <div className="text-xs text-blue-300">Em Andamento</div>
        </div>
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
          <div className="text-xs text-yellow-300">Pendentes</div>
        </div>
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
                <div className="flex items-center gap-2">
                  {getStatusBadge(phase.status)}
                  <Button variant="ghost" size="sm">
                    <Edit className="size-4" />
                  </Button>
                </div>
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
                {phase.type && (
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {phase.type}
                    </Badge>
                  </div>
                )}
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#6272A4]">
            <CheckCircle className="size-4 text-green-400" />
            <span>
              Timeline gerada automaticamente baseada no briefing do evento
            </span>
          </div>
          {initialData && (
            <Badge variant="outline" className="text-xs">
              Dados Iniciais
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export default TimelineTabImproved
