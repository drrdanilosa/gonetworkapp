'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RefreshCw, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import GeneralInfoTab from '@/features/briefing/components/GeneralInfoTab'
import TimelineTab from '@/features/briefing/components/TimelineTab'
import DiagnosticTool from '@/components/DiagnosticTool'

// Interfaces para tipagem
interface BriefingState {
  saved: boolean
  hasChanges: boolean
  lastSaved?: Date
}

interface TimelineState {
  data: Phase[]
  generated: boolean
  lastGenerated?: Date
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

interface Task {
  id: string
  name: string
  description?: string
  status: string
  dueDate: string
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  timestamp: Date
}

export default function BriefingPage() {
  const params = useParams()

  // NextJS 15 compatible - await params to avoid warnings
  const eventId = React.useMemo(() => {
    if (!params.eventId) return undefined
    return Array.isArray(params.eventId)
      ? params.eventId[0]
      : (params.eventId as string)
  }, [params.eventId])

  const [activeTab, setActiveTab] = useState('general-info')
  const [briefingState, setBriefingState] = useState<BriefingState>({
    saved: false,
    hasChanges: false,
  })
  const [timelineState, setTimelineState] = useState<TimelineState>({
    data: [],
    generated: false,
  })
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Função para adicionar notificação
  const addNotification = (type: Notification['type'], message: string) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
    }
    setNotifications(prev => [...prev, notification])

    // Auto-remover após 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  // Remover notificação manualmente
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Handlers para o GeneralInfoTab
  const handleBriefingChange = () => {
    setBriefingState(prev => ({ ...prev, hasChanges: true }))
  }

  const handleBriefingSaved = (_data: unknown) => {
    setBriefingState({
      saved: true,
      hasChanges: false,
      lastSaved: new Date(),
    })
    addNotification('success', 'Briefing salvo com sucesso!')
  }

  // Handlers para o timeline
  const handleTimelineGenerated = (success: boolean) => {
    if (success) {
      setTimelineState(prev => ({
        ...prev,
        generated: true,
        lastGenerated: new Date(),
      }))
      addNotification('success', 'Timeline gerada com sucesso!')

      // Aguardar um pouco e mudar para a aba timeline
      setTimeout(() => {
        setActiveTab('timeline')
        setRefreshTrigger(prev => prev + 1)
      }, 1000)
    } else {
      addNotification('error', 'Erro ao gerar timeline. Tente novamente.')
    }
  }

  const handleTimelineDataLoaded = (data: Phase[]) => {
    setTimelineState(prev => ({
      ...prev,
      data,
      generated: data.length > 0,
    }))
  }

  // Função para refresh geral
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
    addNotification('info', 'Atualizando dados...')
  }

  // Função para voltar
  const handleGoBack = () => {
    window.history.back()
  }

  // Função para gerar timeline a partir do botão no cabeçalho
  const generateTimelineFromHeader = async () => {
    if (!eventId) {
      addNotification('error', 'ID do evento não disponível')
      return
    }

    addNotification('info', 'Iniciando geração de timeline...')

    try {
      console.log('🚀 Iniciando geração de timeline para evento:', eventId)

      // Carregar dados do briefing
      const briefingResponse = await fetch(
        `/api/briefings/${eventId}?t=${Date.now()}`,
        {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        }
      )

      if (!briefingResponse.ok) {
        throw new Error('Erro ao buscar dados do briefing')
      }

      const briefingData = await briefingResponse.json()
      console.log('📋 Dados do briefing carregados:', briefingData)

      if (!briefingData || Object.keys(briefingData).length === 0) {
        throw new Error('Briefing não encontrado ou vazio')
      }

      addNotification(
        'info',
        'Dados do briefing carregados, gerando timeline...'
      )

      // Gerar timeline
      const timelineResponse = await fetch(`/api/timeline/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(briefingData),
        cache: 'no-store',
      })

      if (!timelineResponse.ok) {
        const errorText = await timelineResponse.text()
        throw new Error(
          `Erro na API: ${timelineResponse.status} - ${errorText}`
        )
      }

      const timelineData = await timelineResponse.json()
      console.log('✅ Timeline gerada com sucesso:', timelineData)

      // Atualizar estado
      setTimelineState({
        data: Array.isArray(timelineData)
          ? timelineData
          : timelineData.phases
            ? timelineData.phases
            : [],
        generated: true,
        lastGenerated: new Date(),
      })

      // Notificar sucesso
      addNotification('success', 'Timeline gerada com sucesso!')

      // Redirecionar para a aba Timeline
      setTimeout(() => {
        setActiveTab('timeline')
        setRefreshTrigger(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('❌ Erro ao gerar timeline:', error)
      addNotification(
        'error',
        error instanceof Error ? error.message : 'Erro desconhecido'
      )
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#282A36] p-4 text-[#F8F8F2] md:p-8">
      {/* Header com navegação e status */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="text-[#6272A4] hover:text-[#F8F8F2]"
            >
              <ArrowLeft className="mr-2 size-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#8BE9FD]">
                Briefing do Evento
              </h1>
              <p className="text-lg text-[#6272A4]">
                Gerencie todas as informações essenciais do evento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status badges */}
            <div className="flex gap-2">
              <Badge
                variant={briefingState.saved ? 'default' : 'secondary'}
                className={briefingState.saved ? 'bg-green-600' : ''}
              >
                Briefing: {briefingState.saved ? 'Salvo' : 'Não salvo'}
              </Badge>
              <Badge
                variant={timelineState.generated ? 'default' : 'secondary'}
                className={timelineState.generated ? 'bg-blue-600' : ''}
              >
                Timeline: {timelineState.generated ? 'Gerada' : 'Não gerada'}
              </Badge>
            </div>{' '}
            <div className="flex gap-2">
              {/* Botão Gerar Timeline no header */}
              <Button
                variant="outline"
                size="sm"
                onClick={generateTimelineFromHeader}
                disabled={!eventId}
                className="bg-[#50FA7B] text-[#282A36] hover:bg-[#50FA7B]/90 disabled:opacity-50"
              >
                <Calendar className="mr-2 size-4" />
                Gerar Timeline
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="text-[#F8F8F2]"
              >
                <RefreshCw className="mr-2 size-4" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Notificações */}
        {notifications.length > 0 && (
          <div className="mt-4 space-y-2">
            {notifications.map(notification => (
              <Alert
                key={notification.id}
                variant={
                  notification.type === 'error' ? 'destructive' : 'default'
                }
                className={
                  notification.type === 'success'
                    ? 'border-green-500 bg-green-500/10'
                    : notification.type === 'info'
                      ? 'border-blue-500 bg-blue-500/10'
                      : ''
                }
              >
                <AlertDescription className="flex items-center justify-between">
                  <span>{notification.message}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNotification(notification.id)}
                    className="h-auto p-1 text-xs"
                  >
                    ✕
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto border-b border-[#44475A] bg-[#21222C]">
          <TabsTrigger
            value="general-info"
            className="data-[state=active]:bg-[#44475A] data-[state=active]:text-[#F8F8F2]"
          >
            Informações Gerais
            {briefingState.hasChanges && (
              <span className="ml-2 size-2 rounded-full bg-yellow-500" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="data-[state=active]:bg-[#44475A] data-[state=active]:text-[#F8F8F2]"
          >
            Timeline
            {timelineState.generated && (
              <span className="ml-2 size-2 rounded-full bg-green-500" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="technical"
            className="data-[state=active]:bg-[#44475A] data-[state=active]:text-[#F8F8F2]"
          >
            Requisitos Técnicos
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="data-[state=active]:bg-[#44475A] data-[state=active]:text-[#F8F8F2]"
          >
            Cronograma
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="data-[state=active]:bg-[#44475A] data-[state=active]:text-[#F8F8F2]"
          >
            Recursos
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="data-[state=active]:bg-[#44475A] data-[state=active]:text-[#F8F8F2]"
          >
            Equipe
          </TabsTrigger>
          <TabsTrigger
            value="diagnostics"
            className="data-[state=active]:bg-[#44475A] data-[state=active]:text-[#F8F8F2]"
          >
            Diagnóstico
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="general-info">
            <GeneralInfoTab
              eventId={eventId}
              onChange={handleBriefingChange}
              onSaved={handleBriefingSaved}
              onTimelineGenerated={handleTimelineGenerated}
            />
          </TabsContent>
          <TabsContent value="timeline">
            <TimelineTab
              eventId={eventId}
              initialData={timelineState.data}
              onDataLoad={handleTimelineDataLoaded}
              refreshTrigger={refreshTrigger}
            />
          </TabsContent>
          <TabsContent value="technical">
            <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
              <h2 className="mb-6 text-2xl font-bold text-[#BD93F9]">
                Requisitos Técnicos
              </h2>
              <p className="text-[#F8F8F2]">
                Funcionalidade em desenvolvimento...
              </p>
            </div>
          </TabsContent>
          <TabsContent value="schedule">
            <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
              <h2 className="mb-6 text-2xl font-bold text-[#BD93F9]">
                Cronograma
              </h2>
              <p className="text-[#F8F8F2]">
                Funcionalidade em desenvolvimento...
              </p>
            </div>
          </TabsContent>
          <TabsContent value="resources">
            <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
              <h2 className="mb-6 text-2xl font-bold text-[#BD93F9]">
                Recursos
              </h2>
              <p className="text-[#F8F8F2]">
                Funcionalidade em desenvolvimento...
              </p>
            </div>
          </TabsContent>
          <TabsContent value="team">
            <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
              <h2 className="mb-6 text-2xl font-bold text-[#BD93F9]">Equipe</h2>
              <p className="text-[#F8F8F2]">
                Funcionalidade em desenvolvimento...
              </p>
            </div>
          </TabsContent>
          <TabsContent value="diagnostics">
            <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
              <h2 className="mb-6 text-2xl font-bold text-[#BD93F9]">
                Ferramenta de Diagnóstico
              </h2>
              <DiagnosticTool />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
