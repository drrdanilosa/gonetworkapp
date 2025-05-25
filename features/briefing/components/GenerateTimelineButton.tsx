'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Calendar } from 'lucide-react'

interface GenerateTimelineButtonProps {
  eventId?: string
  onGenerated?: (success: boolean) => void
  onTimelineGenerated?: () => void
  disabled?: boolean
}

export default function GenerateTimelineButton({
  eventId,
  onGenerated,
  onTimelineGenerated,
  disabled = false,
}: GenerateTimelineButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateTimeline = async () => {
    if (!eventId) {
      console.error('EventId não fornecido')
      onGenerated?.(false)
      return
    }

    setIsGenerating(true)

    try {
      console.log('🚀 Iniciando geração de timeline para evento:', eventId)

      // Primeiro, verificar se há dados de briefing
      const briefingResponse = await fetch(
        `/api/briefings/${eventId}?t=${Date.now()}`,
        {
          cache: 'no-store',
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

      // Gerar timeline
      console.log('⏱️ Iniciando geração da timeline...')
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

      // Notificar sucesso
      onGenerated?.(true)
      onTimelineGenerated?.()
    } catch (error) {
      console.error('❌ Erro ao gerar timeline:', error)
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
