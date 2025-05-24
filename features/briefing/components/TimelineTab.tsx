'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

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
}

const TimelineTab = ({ eventId }: TimelineTabProps) => {
  const [timeline, setTimeline] = useState<Phase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) return

    const fetchTimeline = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/timeline/${eventId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            // Timeline não existe ainda
            setTimeline([])
            return
          }
          throw new Error(`Erro ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log('📅 Timeline carregada:', data)
        
        // A API pode retornar diferentes formatos
        if (Array.isArray(data)) {
          setTimeline(data)
        } else if (data.phases && Array.isArray(data.phases)) {
          setTimeline(data.phases)
        } else {
          setTimeline([])
        }
        
      } catch (err) {
        console.error('❌ Erro ao carregar timeline:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar timeline')
      } finally {
        setLoading(false)
      }
    }

    fetchTimeline()
  }, [eventId])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
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
      color: 'bg-gray-500' 
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
        return <Calendar className="h-5 w-5 text-blue-500" />
      case 'production':
        return <Clock className="h-5 w-5 text-orange-500" />
      case 'execution':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
        <div className="mb-6 flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#BD93F9]" />
          <h2 className="text-2xl font-bold text-[#BD93F9]">
            Carregando Timeline...
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-[#44475A] border-[#6272A4]">
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
        <div className="rounded-lg bg-red-900/20 border border-red-500/30 p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <h3 className="font-semibold text-red-400">Erro ao carregar timeline</h3>
          </div>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  if (timeline.length === 0) {
    return (
      <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
        <h2 className="mb-6 text-2xl font-bold text-[#BD93F9]">Timeline</h2>
        <div className="rounded-lg bg-[#44475A] border border-[#6272A4] p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-[#6272A4] mb-4" />
          <h3 className="text-lg font-semibold text-[#F8F8F2] mb-2">
            Nenhuma timeline encontrada
          </h3>
          <p className="text-[#6272A4] mb-4">
            Primeiro, preencha e salve o briefing do evento. 
            Em seguida, clique em "Gerar Timeline" para criar o cronograma automaticamente.
          </p>
          <div className="text-sm text-[#6272A4]">
            💡 Dica: A timeline será baseada nos dados do briefing (patrocinadores, palcos, entregas, etc.)
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#BD93F9]">Timeline do Projeto</h2>
        <div className="flex items-center gap-2 text-sm text-[#6272A4]">
          <CheckCircle className="h-4 w-4" />
          {timeline.length} {timeline.length === 1 ? 'fase' : 'fases'} planejadas
        </div>
      </div>

      <div className="space-y-6">
        {timeline.map((phase, index) => (
          <Card key={phase.id} className="bg-[#44475A] border-[#6272A4]">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getPhaseIcon(phase.type)}
                  <div>
                    <CardTitle className="text-[#F8F8F2] text-lg">
                      {index + 1}. {phase.name}
                    </CardTitle>
                    {phase.description && (
                      <p className="text-[#6272A4] text-sm mt-1">
                        {phase.description}
                      </p>
                    )}
                  </div>
                </div>
                {getStatusBadge(phase.status)}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-[#6272A4] mt-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Início: {formatDate(phase.startDate)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Fim: {formatDate(phase.endDate)}
                </div>
              </div>
            </CardHeader>

            {phase.tasks && phase.tasks.length > 0 && (
              <CardContent className="pt-0">
                <h4 className="font-semibold text-[#BD93F9] mb-3">
                  Tarefas ({phase.tasks.length})
                </h4>
                <div className="space-y-2">
                  {phase.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg bg-[#282A36] p-3"
                    >
                      <div className="flex-1">
                        <h5 className="font-medium text-[#F8F8F2]">{task.name}</h5>
                        {task.description && (
                          <p className="text-sm text-[#6272A4] mt-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-[#6272A4] mt-2">
                          <Clock className="h-3 w-3" />
                          Prazo: {formatDate(task.dueDate)}
                        </div>
                      </div>
                      <div className="ml-4">
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-[#44475A] border border-[#6272A4]">
        <div className="flex items-center gap-2 text-sm text-[#6272A4]">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <span>Timeline gerada automaticamente baseada no briefing do evento</span>
        </div>
      </div>
    </div>
  )
}

export default TimelineTab
