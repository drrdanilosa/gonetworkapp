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

export default function GenerateTimelineButton({
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
  const [retryCount, setRetryCount] = useState(0)

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
        `Erro na verificação da timeline: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        true
      )
      return false
    }
  }

  // Função para resetar estado
  const resetState = () => {
    setCurrentStep('idle')
    setProgress(0)
    setErrorMessage('')
    setLogs([])
    setRetryCount(0)
  }

  // Função principal para gerar a timeline com verificação robusta
  const handleGenerateTimeline = async () => {
    if (!id) {
      setErrorMessage('ID do evento não fornecido')
      setCurrentStep('error')
      return
    }

    setIsLoading(true)
    setCurrentStep('checking-briefing')
    setProgress(0)
    setErrorMessage('')
    if (retryCount === 0) {
      setLogs([])
    }

    addLog('Iniciando processo de geração da timeline...')

    try {
      // Passo 1: Verificar briefing (0-20%)
      setProgress(20)
      addLog('Verificando dados do briefing...')

      const briefingResponse = await fetch(`/api/briefings/${id}`)
      if (!briefingResponse.ok) {
        throw new Error(
          'Não foi possível carregar os dados do briefing. Certifique-se de salvar o briefing primeiro.'
        )
      }

      const briefingData = await briefingResponse.json()
      addLog('Dados do briefing carregados com sucesso')

      // Passo 2: Gerar timeline (20-40%)
      setCurrentStep('generating-timeline')
      setProgress(40)
      addLog('Gerando timeline a partir dos dados do briefing...')

      const timelineResponse = await fetch(`/api/timeline/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generateFromBriefing: true,
          briefingData,
        }),
      })

      if (!timelineResponse.ok) {
        const errorData = await timelineResponse.json()
        addLog(`Erro na API: ${errorData.error || 'Erro desconhecido'}`, true)
        throw new Error(errorData.error || 'Erro ao gerar timeline')
      }

      const _generatedTimeline = await timelineResponse.json()
      console.log('✅ Timeline gerada:', _generatedTimeline)
      addLog('Timeline gerada pela API')

      // Passo 3: Verificar se foi realmente criada (40-70%)
      setCurrentStep('verifying-timeline')
      setProgress(70)

      const isVerified = await verifyTimelineGeneration(id)
      if (!isVerified) {
        throw new Error(
          'Timeline foi gerada mas não pôde ser verificada. Tente novamente.'
        )
      }

      // Passo 4: Sucesso (70-100%)
      setProgress(100)
      setCurrentStep('success')
      addLog('Timeline gerada e verificada com sucesso!')

      if (onGenerated) {
        onGenerated(true)
      }

      // Chamar callback de redirecionamento se fornecido
      if (onTimelineGenerated) {
        setTimeout(() => {
          onTimelineGenerated()
        }, 1000)
      }

      // Fechar o modal após um momento
      setTimeout(() => {
        setIsOpen(false)
        resetState()
      }, 3000)
    } catch (error) {
      console.error('❌ Erro ao gerar timeline:', error)

      setCurrentStep('error')
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao gerar timeline'
      setErrorMessage(errorMsg)
      addLog(errorMsg, true)

      if (onGenerated) {
        onGenerated(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Função para tentar novamente
  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    handleGenerateTimeline()
  }

  // Função para obter o texto do passo atual
  const getStepText = () => {
    switch (currentStep) {
      case 'checking-briefing':
        return 'Verificando dados do briefing...'
      case 'generating-timeline':
        return 'Gerando timeline...'
      case 'verifying-timeline':
        return 'Verificando resultado...'
      case 'success':
        return 'Timeline gerada com sucesso!'
      case 'error':
        return 'Erro na geração'
      default:
        return 'Preparando...'
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        setIsOpen(open)
        if (!open) {
          resetState()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          disabled={disabled || !id}
        >
          <Clock className="mr-2 size-4" />
          Gerar Timeline
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerar Timeline</DialogTitle>
          <DialogDescription>
            Uma nova timeline será gerada com base nos dados do briefing.
          </DialogDescription>
        </DialogHeader>

        {isLoading || currentStep !== 'idle' ? (
          <div className="space-y-4">
            {/* Barra de Progresso */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{getStepText()}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>

            {/* Estado Visual */}
            <div className="flex items-center justify-center py-4">
              <div className="flex flex-col items-center gap-2">
                {currentStep === 'success' ? (
                  <Check className="size-8 text-green-500" />
                ) : currentStep === 'error' ? (
                  <AlertTriangle className="size-8 text-red-500" />
                ) : (
                  <Loader2 className="size-8 animate-spin text-primary" />
                )}
                <p className="text-sm text-muted-foreground">{getStepText()}</p>
              </div>
            </div>

            {/* Logs */}
            {logs.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-md border bg-muted p-3">
                <div className="space-y-1 font-mono text-xs">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={
                        log.includes('❌') ? 'text-red-600' : 'text-green-600'
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mensagem de Erro */}
            {currentStep === 'error' && errorMessage && (
              <Alert variant="destructive">
                <AlertTriangle className="size-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="py-4">
            <p>
              Esta ação irá gerar uma timeline com base nos dados atuais do
              briefing:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
              <li>Datas e horários do evento</li>
              <li>Patrocinadores e suas ativações</li>
              <li>Programação de palcos e atrações</li>
              <li>Entregas em tempo real e pós-evento</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Nota: Você poderá editar a timeline manualmente após a geração.
            </p>
          </div>
        )}

        <DialogFooter>
          {currentStep === 'error' ? (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Fechar
              </Button>
              <Button onClick={handleRetry}>
                <RefreshCw className="mr-2 size-4" />
                Tentar Novamente
              </Button>
            </>
          ) : currentStep === 'success' ? (
            <Button onClick={() => setIsOpen(false)}>Fechar</Button>
          ) : !isLoading ? (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGenerateTimeline}>
                Confirmar Geração
              </Button>
            </>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
