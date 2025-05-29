'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { generateScheduleFromBriefing } from '@/lib/scheduleGenerator'
import { useBriefing } from '@/hooks/useBriefing'

interface GenerateTimelineButtonProps {
  eventId?: string
  formData?: unknown // Dados do formulário atual (não salvos)
  redirectToTimeline?: boolean
  disabled?: boolean
}

export default function GenerateTimelineButtonNew({
  eventId,
  formData,
  redirectToTimeline = true,
  disabled = false,
}: GenerateTimelineButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()
  const { briefing } = useBriefing(eventId || '')

  // Store global de projetos para atualizar a timeline
  const { projects, updateProject } = useProjectsStore()

  const generateTimeline = async () => {
    if (!eventId) {
      toast({
        title: 'Erro',
        description: 'ID do evento não fornecido.',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)

    try {
      console.log('🚀 Iniciando geração de timeline para evento:', eventId)

      // Usar dados do formulário se disponíveis, ou dados do briefing atual
      const briefingData = formData || briefing

      if (!briefingData) {
        throw new Error('Dados de briefing não encontrados')
      }

      console.log('📋 Dados do briefing carregados:', briefingData)

      // Extrair dados necessários do briefing para gerar a timeline
      const projectName = briefingData.eventName || 'Projeto'
      const numVideos =
        briefingData.deliverables?.filter(d => d.type === 'video')?.length || 1
      const eventDate = briefingData.eventDate
        ? new Date(briefingData.eventDate)
        : undefined
      const finalDueDate = undefined // Poderia ser extraído do briefing se disponível

      console.log('⏱️ Gerando timeline localmente...')

      // Gerar timeline usando a função local
      const phases = generateScheduleFromBriefing(
        projectName,
        numVideos,
        eventDate,
        finalDueDate
      )

      console.log('✅ Timeline gerada com sucesso:', phases)

      // Buscar o projeto atual
      const currentProject = projects.find(p => p.id === eventId)

      if (!currentProject) {
        throw new Error('Projeto não encontrado')
      }

      // Formatar as fases para o formato esperado pelo projeto
      const formattedPhases = phases.map(phase => ({
        id: crypto.randomUUID(),
        name: phase.name,
        startDate: phase.plannedStart.toISOString(),
        endDate: phase.plannedEnd.toISOString(),
        status: phase.completed ? 'completed' : 'pending',
        description: '',
        type: 'phase',
        tasks: [],
      }))

      // Atualizar o projeto com a nova timeline
      updateProject(eventId, {
        timeline: formattedPhases,
        updatedAt: new Date().toISOString(),
      })

      // Mostrar toast de sucesso
      toast({
        title: 'Timeline gerada',
        description: 'A timeline do projeto foi gerada com sucesso!',
      })

      // Redirecionar para a aba Timeline, se solicitado
      if (redirectToTimeline) {
        router.push(`/events/${eventId}/timeline`)
      }
    } catch (error) {
      console.error('❌ Erro ao gerar timeline:', error)

      // Mostrar toast de erro
      toast({
        title: 'Erro ao gerar timeline',
        description:
          error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={generateTimeline}
      disabled={disabled || isGenerating || !eventId}
      className="w-full bg-[#50FA7B] text-[#282A36] hover:bg-[#50FA7B]/90 disabled:opacity-50"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Gerando Timeline...
        </>
      ) : (
        <>
          <Calendar className="mr-2 size-4" />
          Gerar Timeline
        </>
      )}
    </Button>
  )
}
