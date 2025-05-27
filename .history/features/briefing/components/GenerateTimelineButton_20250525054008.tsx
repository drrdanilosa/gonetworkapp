'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Calendar } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { generateScheduleFromBriefing } from '@/lib/scheduleGenerator'

interface GenerateTimelineButtonProps {
  eventId?: string
  onGenerated?: (success: boolean) => void
  onTimelineGenerated?: () => void
  formData?: any // Dados do formulário atual (não salvos)
  disabled?: boolean
}

export default function GenerateTimelineButton({
  eventId,
  onGenerated,
  onTimelineGenerated,
  formData,
  disabled = false,
}: GenerateTimelineButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  // Store global de projetos para atualizar a timeline
  const { projects, updateProject } = useProjectsStore()

  const generateTimeline = async () => {
    if (!eventId) {
      console.error('EventId não fornecido')
      toast({
        title: 'Erro',
        description: 'ID do evento não fornecido.',
        variant: 'destructive',
      })
      onGenerated?.(false)
      return
    }

    setIsGenerating(true)

    try {
      console.log('🚀 Iniciando geração de timeline para evento:', eventId)

      // Usar dados do formulário se disponíveis, ou buscar dados do briefing
      let briefingData = formData

      if (!briefingData) {
        // Caso não tenha dados do formulário, buscar do backend
        console.log('📝 Buscando dados do briefing da API...')
        const briefingResponse = await fetch(
          `/api/briefings/${eventId}?t=${Date.now()}`,
          {
            cache: 'no-store',
          }
        )

        if (!briefingResponse.ok) {
          throw new Error('Erro ao buscar dados do briefing')
        }

        briefingData = await briefingResponse.json()
      }

      console.log('📋 Dados do briefing carregados:', briefingData)

      if (!briefingData || Object.keys(briefingData).length === 0) {
        throw new Error('Briefing não encontrado ou vazio')
      }

      // Extrair dados necessários para a geração da timeline
      const projectName = briefingData.eventName || 'Projeto'
      const numVideos =
        briefingData.deliverables?.filter(d => d.type === 'video')?.length || 1
      const eventDate = briefingData.eventDate
        ? new Date(briefingData.eventDate)
        : undefined
      const finalDueDate = undefined // Poderia ser extraído do briefing se disponível

      console.log('⏱️ Gerando timeline localmente...')

      // Gerar timeline usando a função local em vez da API
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

      // Notificar sucesso
      onGenerated?.(true)

      // Redirecionar para a aba Timeline e/ou executar callback
      router.push(`/events/${eventId}/timeline`)
      onTimelineGenerated?.()
    } catch (error) {
      console.error('❌ Erro ao gerar timeline:', error)

      // Mostrar toast de erro
      toast({
        title: 'Erro ao gerar timeline',
        description:
          error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
        variant: 'destructive',
      })

      onGenerated?.(false)
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
