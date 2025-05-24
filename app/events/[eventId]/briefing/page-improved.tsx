'use client'

import { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import GeneralInfoTab from '@/features/briefing/components/GeneralInfoTab'
import TimelineTabImproved from '@/features/briefing/components/TimelineTabImproved'
import GenerateTimelineButtonImproved from '@/features/briefing/components/GenerateTimelineButtonImproved'
import DiagnosticTool from '@/components/DiagnosticTool'

interface BriefingState {
  isLoaded: boolean
  hasChanges: boolean
  lastSaved?: Date
  data?: any
}

interface TimelineState {
  isLoaded: boolean
  hasData: boolean
  lastGenerated?: Date
  phases: any[]
}

export default function BriefingPageImproved() {
  const router = useRouter()
  const params = useParams()
  const eventId = Array.isArray(params.eventId)
    ? params.eventId[0]
    : (params.eventId as string)

  // Estados principais
  const [activeTab, setActiveTab] = useState('general-info')
  const [briefingState, setBriefingState] = useState<BriefingState>({
    isLoaded: false,
    hasChanges: false,
    phases: [],
  })
  const [timelineState, setTimelineState] = useState<TimelineState>({
    isLoaded: false,
    hasData: false,
    phases: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState<string[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Função para adicionar notificações
  const addNotification = useCallback((message: string) => {
    setNotifications(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
    // Remover notificação após 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.slice(1))
    }, 5000)
  }, [])

  // Função para verificar estado do briefing
  const checkBriefingState = useCallback(async () => {
    if (!eventId) return

    try {
      const response = await fetch(`/api/briefings/${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setBriefingState(prev => ({
          ...prev,
          isLoaded: true,
          data,
          lastSaved: data.updatedAt ? new Date(data.updatedAt) : undefined,
        }))
        return data
      }
    } catch (error) {
      console.error('Erro ao verificar briefing:', error)
    }
    return null
  }, [eventId])

  // Função para verificar estado da timeline
  const checkTimelineState = useCallback(async () => {
    if (!eventId) return

    try {
      const response = await fetch(`/api/timeline/${eventId}`)
      if (response.ok) {
        const data = await response.json()
        let phases = []
        
        if (Array.isArray(data)) {
          phases = data
        } else if (data.timeline && Array.isArray(data.timeline)) {
          phases = data.timeline
        } else if (data.phases && Array.isArray(data.phases)) {
          phases = data.phases
        }

        setTimelineState(prev => ({
          ...prev,
          isLoaded: true,
          hasData: phases.length > 0,
          phases,
          lastGenerated: data.createdAt ? new Date(data.createdAt) : undefined,
        }))
        return phases
      }
    } catch (error) {
      console.error('Erro ao verificar timeline:', error)
    }
    return []
  }, [eventId])

  // Carregar estados iniciais
  useEffect(() => {
    if (eventId) {
      checkBriefingState()
      checkTimelineState()
    }
  }, [eventId, checkBriefingState, checkTimelineState])

  // Função para lidar com geração de timeline bem-sucedida
  const handleTimelineGenerated = useCallback(() => {
    addNotification('Timeline gerada com sucesso!')
    
    // Aguardar um momento e então verificar a timeline
    setTimeout(() => {
      checkTimelineState().then(() => {
        // Mudar para a aba timeline após geração
        setActiveTab('timeline')
        addNotification('Redirecionado para visualizar a timeline')
        
        // Trigger refresh no componente TimelineTab
        setRefreshTrigger(prev => prev + 1)
      })
    }, 1000)
  }, [addNotification, checkTimelineState])

  // Função para lidar com mudanças no briefing
  const handleBriefingChange = useCallback(() => {
    setBriefingState(prev => ({
      ...prev,
      hasChanges: true,
    }))
  }, [])

  // Função para lidar com salvamento do briefing
  const handleBriefingSaved = useCallback((data: any) => {
    setBriefingState(prev => ({
      ...prev,
      hasChanges: false,
      lastSaved: new Date(),
      data,
    }))
    addNotification('Briefing salvo com sucesso!')
  }, [addNotification])

  // Função para refresh geral
  const handleRefresh = useCallback(async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        checkBriefingState(),
        checkTimelineState(),
      ])
      addNotification('Dados atualizados')
      setRefreshTrigger(prev => prev + 1)
    } finally {
      setIsLoading(false)
    }
  }, [checkBriefingState, checkTimelineState, addNotification])

  // Função para voltar à lista de eventos
  const handleGoBack = () => {
    router.push('/events')
  }

  // Verificar se pode gerar timeline
  const canGenerateTimeline = briefingState.isLoaded && briefingState.data && !briefingState.hasChanges

  // Obter informações de status
  const getStatusInfo = () => {
    if (!briefingState.isLoaded) {
      return {
        status: 'loading',
        message: 'Carregando dados do briefing...',
        color: 'text-yellow-500',
      }
    }

    if (!briefingState.data) {
      return {
        status: 'no-briefing',
        message: 'Briefing não encontrado',
        color: 'text-red-500',
      }
    }

    if (briefingState.hasChanges) {
      return {
        status: 'unsaved',
        message: 'Alterações não salvas',
        color: 'text-orange-500',
      }
    }

    if (timelineState.hasData) {
      return {
        status: 'complete',
        message: 'Briefing e timeline prontos',
        color: 'text-green-500',
      }
    }

    return {
      status: 'ready',
      message: 'Pronto para gerar timeline',
      color: 'text-blue-500',
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="min-h-screen w-full bg-[#282A36] p-4 text-[#F8F8F2] md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleGoBack}
            size="sm"
          >
            <ArrowLeft className="mr-2 size-4" />
            Voltar aos Eventos
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 size-4" />
            )}
            Atualizar
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#8BE9FD]">
              Briefing do Evento
            </h1>
            <p className="text-lg text-[#6272A4]">
              Gerencie todas as informações essenciais do evento
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className={statusInfo.color}>
                {statusInfo.message}
              </Badge>
              {briefingState.lastSaved && (
                <span className="text-xs text-[#6272A4]">
                  Último salvamento: {briefingState.lastSaved.toLocaleString('pt-BR')}
                </span>
              )}
            </div>
          </div>

          {/* Ações principais */}
          <div className="flex items-center gap-2">
            {activeTab === 'general-info' && canGenerateTimeline && (
              <GenerateTimelineButtonImproved
                eventId={eventId}
                onGenerated={(success) => {
                  if (success) {
                    handleTimelineGenerated()
                  } else {
                    addNotification('Erro ao gerar timeline')
                  }
                }}
                onTimelineGenerated={handleTimelineGenerated}
              />
            )}
          </div>
        </div>
      </div>

      {/* Notificações */}
      {notifications.length > 0 && (
        <div className="mb-6 space-y-2">
          {notifications.slice(-3).map((notification, index) => (
            <Alert key={index} className="border-green-500/30 bg-green-900/20">
              <CheckCircle className="size-4 text-green-400" />
              <AlertDescription className="text-green-300">
                {notification}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Alertas de estado */}
      {briefingState.hasChanges && (
        <Alert className="mb-6 border-orange-500/30 bg-orange-900/20">
          <AlertTriangle className="size-4 text-orange-400" />
          <AlertDescription className="text-orange-300">
            <strong>Atenção:</strong> Você possui alterações não salvas no briefing. 
            Salve as alterações antes de gerar a timeline.
          </AlertDescription>
        </Alert>
      )}

      {!canGenerateTimeline && briefingState.data && (
        <Alert className="mb-6 border-blue-500/30 bg-blue-900/20">
          <AlertTriangle className="size-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            <strong>Dica:</strong> Complete e salve o briefing para habilitar a geração da timeline.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs principais */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto border-b border-[#44475A] bg-[#21222C]">
          <TabsTrigger
            value="general-info"
            className="data-[state=active]:bg-[#44475A] data-[state=active]:text-[#F8F8F2]"
          >
            <div className="flex items-center gap-2">
              Informações Gerais
              {briefingState.hasChanges && (
                <div className="size-2 rounded-full bg-orange-400" />
              )}
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="data-[state=active]:bg-[#44475A] data-[state=active]:text-[#F8F8F2]"
          >
            <div className="flex items-center gap-2">
              Timeline
              {timelineState.hasData && (
                <Badge variant="outline" className="ml-1 text-xs">
                  {timelineState.phases.length}
                </Badge>
              )}
            </div>
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
            />
          </TabsContent>
          
          <TabsContent value="timeline">
            <TimelineTabImproved 
              eventId={eventId}
              initialData={timelineState.phases}
              onDataLoad={(data) => {
                setTimelineState(prev => ({
                  ...prev,
                  hasData: data.length > 0,
                  phases: data,
                }))
              }}
              refreshTrigger={refreshTrigger}
            />
          </TabsContent>
          
          <TabsContent value="technical">
            <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
              <h2 className="mb-6 text-2xl font-bold text-[#BD93F9]">
                Requisitos Técnicos
              </h2>
              <div className="rounded-lg border border-[#6272A4] bg-[#44475A] p-6 text-center">
                <AlertTriangle className="mx-auto mb-4 size-12 text-[#6272A4]" />
                <p className="text-[#F8F8F2]">
                  Funcionalidade em desenvolvimento...
                </p>
                <p className="mt-2 text-sm text-[#6272A4]">
                  Em breve você poderá gerenciar todos os requisitos técnicos do evento.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule">
            <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
              <h2 className="mb-6 text-2xl font-bold text-[#BD93F9]">
                Cronograma
              </h2>
              <div className="rounded-lg border border-[#6272A4] bg-[#44475A] p-6 text-center">
                <AlertTriangle className="mx-auto mb-4 size-12 text-[#6272A4]" />
                <p className="text-[#F8F8F2]">
                  Funcionalidade em desenvolvimento...
                </p>
                <p className="mt-2 text-sm text-[#6272A4]">
                  Em breve você poderá gerenciar o cronograma detalhado do evento.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="resources">
            <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
              <h2 className="mb-6 text-2xl font-bold text-[#BD93F9]">
                Recursos
              </h2>
              <div className="rounded-lg border border-[#6272A4] bg-[#44475A] p-6 text-center">
                <AlertTriangle className="mx-auto mb-4 size-12 text-[#6272A4]" />
                <p className="text-[#F8F8F2]">
                  Funcionalidade em desenvolvimento...
                </p>
                <p className="mt-2 text-sm text-[#6272A4]">
                  Em breve você poderá gerenciar todos os recursos necessários.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="team">
            <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
              <h2 className="mb-6 text-2xl font-bold text-[#BD93F9]">Equipe</h2>
              <div className="rounded-lg border border-[#6272A4] bg-[#44475A] p-6 text-center">
                <AlertTriangle className="mx-auto mb-4 size-12 text-[#6272A4]" />
                <p className="text-[#F8F8F2]">
                  Funcionalidade em desenvolvimento...
                </p>
                <p className="mt-2 text-sm text-[#6272A4]">
                  Em breve você poderá gerenciar a equipe do evento.
                </p>
              </div>
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

      {/* Footer com informações de estado */}
      <div className="mt-8 rounded-lg border border-[#6272A4] bg-[#44475A] p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${
                briefingState.data ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span>Briefing: {briefingState.data ? 'Carregado' : 'Não encontrado'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${
                timelineState.hasData ? 'bg-green-400' : 'bg-gray-400'
              }`} />
              <span>Timeline: {timelineState.hasData ? `${timelineState.phases.length} fases` : 'Não gerada'}</span>
            </div>
          </div>
          <div className="text-[#6272A4]">
            Event ID: {eventId}
          </div>
        </div>
      </div>
    </div>
  )
}
