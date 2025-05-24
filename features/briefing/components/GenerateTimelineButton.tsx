'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Clock, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface GenerateTimelineButtonProps {
  projectId?: string
  onGenerated?: (success: boolean) => void
  disabled?: boolean
}

export default function GenerateTimelineButton({
  projectId,
  onGenerated,
  disabled = false,
}: GenerateTimelineButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // Debug logs
  console.log('🔍 GenerateTimelineButton rendered with:', {
    projectId,
    disabled,
  })

  // Debug logs
  console.log('🔍 GenerateTimelineButton rendered with:', {
    projectId,
    disabled,
  })

  // Função para gerar a timeline a partir dos dados do briefing
  const handleGenerateTimeline = async () => {
    console.log('🚀 handleGenerateTimeline called with projectId:', projectId)
    if (!projectId) {
      console.error('❌ No projectId provided!')
      return
    }

    setIsLoading(true)
    setIsComplete(false)

    console.log('🔄 Starting timeline generation...')

    try {
      // Primeiro, verificar se existe um briefing salvo
      console.log('📋 Checking briefing for projectId:', projectId)
      const briefingResponse = await fetch(`/api/briefings/${projectId}`)
      console.log('📋 Briefing response status:', briefingResponse.status)
      if (!briefingResponse.ok) {
        throw new Error(
          'Não foi possível carregar os dados do briefing. Certifique-se de salvar o briefing primeiro.'
        )
      }

      const briefingData = await briefingResponse.json()
      console.log('📋 Briefing data loaded:', briefingData)

      // Gerar a timeline usando a API
      console.log('⚡ Calling timeline API...')
      const timelineResponse = await fetch(`/api/timeline/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generateFromBriefing: true,
          briefingData,
        }),
      })

      console.log('⚡ Timeline API response status:', timelineResponse.status)

      if (!timelineResponse.ok) {
        const errorData = await timelineResponse.json()
        console.error('❌ Timeline API error:', errorData)
        throw new Error(errorData.error || 'Erro ao gerar timeline')
      }

      const generatedTimeline = await timelineResponse.json()
      console.log('✅ Timeline gerada com sucesso:', generatedTimeline)

      setIsComplete(true)

      if (onGenerated) {
        onGenerated(true)
      }

      // Fechar o modal após um momento
      setTimeout(() => {
        setIsOpen(false)
        setIsComplete(false) // Reset para próxima geração
      }, 3000)
    } catch (error) {
      console.error('❌ Erro ao gerar timeline:', error)

      // Melhor feedback de erro
      let errorMessage = 'Erro desconhecido ao gerar timeline'
      if (error instanceof Error) {
        errorMessage = error.message
      }

      console.error('Detalhes do erro:', errorMessage)

      if (onGenerated) {
        onGenerated(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          disabled={disabled || !projectId}
        >
          <Clock className="mr-2 size-4" />
          Gerar Timeline
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar Timeline</DialogTitle>
          <DialogDescription>
            Uma nova timeline será gerada com base nos dados do briefing.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Processando dados do briefing...
              </p>
            </div>
          </div>
        ) : isComplete ? (
          <div className="flex items-center justify-center py-10">
            <div className="flex flex-col items-center gap-2 text-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-8"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p>Timeline gerada com sucesso!</p>
              <p className="text-sm text-muted-foreground">
                Agora você pode visualizá-la na aba Timeline.
              </p>
            </div>
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
          {!isLoading && !isComplete && (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGenerateTimeline}>
                Confirmar Geração
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
