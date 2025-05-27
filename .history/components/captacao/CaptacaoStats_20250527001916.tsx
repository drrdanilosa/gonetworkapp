'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCaptacaoStore } from '@/store/useCaptacaoStore'
import { useProjectsStore } from '@/store/useProjectsStore'
import {
  FileImage,
  Video,
  TrendingUp,
  Clock,
} from 'lucide-react'

interface CaptacaoStatsProps {
  eventId?: string
}

export function CaptacaoStats({ eventId }: CaptacaoStatsProps) {
  const { autorizacoes, reunioes } = useCaptacaoStore()
  const { projects, currentProject } = useProjectsStore()

  const targetEventId = eventId || currentProject?.id

  // Filtrar dados por evento se especificado
  const eventAutorizacoes = targetEventId
    ? autorizacoes.filter(auth => auth.eventId === targetEventId)
    : autorizacoes

  const eventReunioes = targetEventId
    ? reunioes.filter(reuniao => reuniao.eventId === targetEventId)
    : reunioes

  // Estatísticas das autorizações
  const authStats = {
    total: eventAutorizacoes.length,
    hoje: eventAutorizacoes.filter(auth => {
      const today = new Date().toISOString().split('T')[0]
      return auth.dataAutorizacao.startsWith(today)
    }).length,
  }

  // Estatísticas das reuniões
  const meetingStats = {
    total: eventReunioes.length,
    agendadas: eventReunioes.filter(r => r.status === 'agendada').length,
    finalizadas: eventReunioes.filter(r => r.status === 'finalizada').length,
    emAndamento: eventReunioes.filter(r => r.status === 'em_andamento').length,
  }

  // Próximas reuniões
  const proximasReunioes = eventReunioes
    .filter(r => r.dataHora && r.status === 'agendada')
    .filter(r => new Date(r.dataHora) > new Date())
    .sort(
      (a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()
    )
    .slice(0, 3)

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total de Autorizações */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Autorizações</CardTitle>
          <FileImage className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{authStats.total}</div>
          {authStats.hoje > 0 && (
            <p className="text-xs text-muted-foreground">
              +{authStats.hoje} hoje
            </p>
          )}
        </CardContent>
      </Card>

      {/* Total de Reuniões */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reuniões</CardTitle>
          <Video className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{meetingStats.total}</div>
          <p className="text-xs text-muted-foreground">
            {meetingStats.agendadas} agendadas
          </p>
        </CardContent>
      </Card>

      {/* Status das Reuniões */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          <TrendingUp className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {meetingStats.agendadas > 0 && (
              <Badge variant="secondary" className="text-xs">
                {meetingStats.agendadas} agendadas
              </Badge>
            )}
            {meetingStats.emAndamento > 0 && (
              <Badge variant="default" className="bg-green-500 text-xs">
                {meetingStats.emAndamento} ativas
              </Badge>
            )}
            {meetingStats.finalizadas > 0 && (
              <Badge variant="outline" className="text-xs">
                {meetingStats.finalizadas} finalizadas
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Próximas Reuniões */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Próximas</CardTitle>
          <Clock className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {proximasReunioes.length > 0 ? (
            <div className="space-y-1">
              {proximasReunioes.map((reuniao, index) => (
                <div key={reuniao.id} className="text-xs">
                  <div className="truncate font-medium">{reuniao.titulo}</div>
                  <div className="text-muted-foreground">
                    {new Date(reuniao.dataHora).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Nenhuma reunião agendada
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
