'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Clock, Loader2, Check, AlertTriangle, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

interface GenerateTimelineButtonProps {
  projectId?: string
  eventId?: string
  onGenerated?: (success: boolean) => void
  onTimelineGenerated?: () => void // Nova callback para redirecionamento
  disabled?: boolean
}

type GenerationStep =
  | 'idle'
  | 'checking-briefing'
  | 'generating-timeline'
  | 'verifying-timeline'
  | 'success'
  | 'error'

export default function GenerateTimelineButtonImproved({
  projectId,
  eventId,
  onGenerated,
  onTimelineGenerated,
  disabled = false,
}: GenerateTimelineButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<GenerationStep>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  // Use eventId as fallback if projectId is not provided
  const id = projectId || eventId

  // Função para adicionar logs com timestamp
  const addLog = (message: string, isError = false) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR')
    const logEntry = `[${timestamp}] ${isError ? '❌' : '✅'} ${message}`
    setLogs(prev => [...prev, logEntry])
    console.log(logEntry)
  }

  // Função para verificar se a timeline foi gerada corretamente
  const verifyTimelineGeneration = async (
    eventId: string
  ): Promise<boolean> => {
    try {
      addLog('Verificando se a timeline foi gerada corretamente...')

      // Cache busting para garantir dados mais recentes
      const timestamp = Date.now()
      const response = await fetch(`/api/timeline/${eventId}?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })

      if (!response.ok) {
        addLog('Timeline não encontrada após geração', true)
        return false
      }

      const data = await response.json()

      // Verificar se a timeline tem dados válidos
      let timelineData = []
      if (Array.isArray(data)) {
        timelineData = data
      } else if (data.timeline && Array.isArray(data.timeline)) {
        timelineData = data.timeline
      } else if (data.phases && Array.isArray(data.phases)) {
        timelineData = data.phases
      }

      if (timelineData.length === 0) {
        addLog('Timeline gerada mas sem fases/dados', true)
        return false
      }

      addLog(
        `Timeline verificada com sucesso: ${timelineData.length} fases encontradas`
      )
      return true
    } catch (error) {
      addLog(
        `Erro na verificação da timeline: ${
          error instanceof Error ? error.message : 'Erro desconhecido'
        }`,
        true
      )
      return false
    }
  }

  // Função principal para gerar a timeline
  const handleGenerateTimeline = async () => {
    if (!eventId) {
      setErrorMessage('ID do evento não fornecido')
      setCurrentStep('error')
      return
    }

    setIsLoading(true)
    setCurrentStep('checking-briefing')
    setProgress(0)
    setLogs([])
    setErrorMessage('')

    addLog('Iniciando geração da timeline...')

    try {
      // Passo 1: Verificar briefing
      setProgress(20)
      addLog('Verificando dados do briefing...')

      const briefingResponse = await fetch(`/api/briefings/${eventId}`)
      if (!briefingResponse.ok) {
        throw new Error(
          'Não foi possível carregar os dados do briefing. Certifique-se de salvar o briefing primeiro.'
        )
      }

      const briefingData = await briefingResponse.json()
      addLog('Dados do briefing carregados com sucesso')

      // Passo 2: Gerar timeline
      setCurrentStep('generating-timeline')
      setProgress(40)
      addLog('Gerando timeline com base no briefing...')

      const timelineResponse = await fetch(`/api/timeline/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          generateFromBriefing: true,
          briefingData,
        }),
      })

      if (!timelineResponse.ok) {
        const errorData = await timelineResponse.json()
        throw new Error(errorData.error || 'Erro ao gerar timeline')
      }

      const generatedTimeline = await timelineResponse.json()
      addLog('Timeline gerada pela API')

      // Passo 3: Verificar se a timeline foi realmente criada
      setCurrentStep('verifying-timeline')
      setProgress(70)
      addLog('Iniciando verificação da timeline...')

      // Aguardar um pouco para garantir que os dados foram salvos
      await new Promise(resolve => setTimeout(resolve, 1000))

      const isVerified = await verifyTimelineGeneration(eventId)

      if (!isVerified) {
        throw new Error(
          'Falha na verificação: Timeline não foi gerada corretamente'
        )
      }

      // Passo 4: Sucesso
      setCurrentStep('success')
      setProgress(100)
      addLog('Timeline gerada e verificada com sucesso!')

      // Callbacks
      if (onGenerated) {
        onGenerated(true)
      }

      if (onTimelineGenerated) {
        onTimelineGenerated()
      }

      // Fechar modal após sucesso
      setTimeout(() => {
        setIsOpen(false)
        // Reset para próxima geração
        setTimeout(() => {
          setCurrentStep('idle')
          setProgress(0)
          setLogs([])
        }, 500)
      }, 2000)
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Erro desconhecido'

      setCurrentStep('error')
      setErrorMessage(errorMsg)
      addLog(`Erro: ${errorMsg}`, true)

      if (onGenerated) {
        onGenerated(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Função para resetar e tentar novamente
  const handleRetry = () => {
    setCurrentStep('idle')
    setErrorMessage('')
    setProgress(0)
    setLogs([])
  }

  // Obter informações do passo atual
  const getStepInfo = () => {
    switch (currentStep) {
      case 'checking-briefing':
        return {
          title: 'Verificando Briefing',
          description: 'Carregando dados do briefing do evento...',
          icon: <Loader2 className="size-6 animate-spin text-blue-500" />,
        }
      case 'generating-timeline':
        return {
          title: 'Gerando Timeline',
          description: 'Processando dados e criando cronograma...',
          icon: <Loader2 className="size-6 animate-spin text-orange-500" />,
        }
      case 'verifying-timeline':
        return {
          title: 'Verificando Resultado',
          description: 'Confirmando que a timeline foi criada corretamente...',
          icon: <Loader2 className="size-6 animate-spin text-purple-500" />,
        }
      case 'success':
        return {
          title: 'Timeline Gerada!',
          description: 'Timeline criada e verificada com sucesso.',
          icon: <Check className="size-6 text-green-500" />,
        }
      case 'error':
        return {
          title: 'Erro na Geração',
          description: errorMessage,
          icon: <AlertTriangle className="size-6 text-red-500" />,
        }
      default:
        return null
    }
  }

  const stepInfo = getStepInfo()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          disabled={disabled || !eventId}
        >
          <Clock className="mr-2 size-4" />
          Gerar Timeline
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerar Timeline do Evento</DialogTitle>
          <DialogDescription>
            {currentStep === 'idle'
              ? 'Uma nova timeline será gerada com base nos dados do briefing.'
              : 'Processando geração da timeline...'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentStep !== 'idle' && (
            <>
              {/* Barra de progresso */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progresso da geração</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Status atual */}
              {stepInfo && (
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  {stepInfo.icon}
                  <div>
                    <h4 className="font-medium">{stepInfo.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {stepInfo.description}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Erro específico */}
          {currentStep === 'error' && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Logs detalhados */}
          {logs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Log detalhado:</h4>
              <div className="max-h-32 space-y-1 overflow-y-auto rounded-md bg-muted/50 p-3 font-mono text-xs">
                {logs.map((log, index) => (
                  <div key={index} className="text-muted-foreground">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Descrição inicial */}
          {currentStep === 'idle' && (
            <div className="space-y-4">
              <p>
                Esta ação irá gerar uma timeline automatizada com base nos dados
                atuais do briefing:
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>Datas e horários do evento</li>
                <li>Patrocinadores e suas ativações</li>
                <li>Programação de palcos e atrações</li>
                <li>Entregas em tempo real e pós-evento</li>
              </ul>
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                <strong>Importante:</strong> Certifique-se de que o briefing
                esteja completo e salvo antes de gerar a timeline.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {currentStep === 'idle' && (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGenerateTimeline} disabled={!eventId}>
                <Clock className="mr-2 size-4" />
                Confirmar Geração
              </Button>
            </>
          )}

          {currentStep === 'error' && (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Fechar
              </Button>
              <Button onClick={handleRetry}>
                <RefreshCw className="mr-2 size-4" />
                Tentar Novamente
              </Button>
            </>
          )}

          {currentStep === 'success' && (
            <Button onClick={() => setIsOpen(false)}>
              <Check className="mr-2 size-4" />
              Concluído
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
