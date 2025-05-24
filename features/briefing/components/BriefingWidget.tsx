"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { Save } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { useBriefing } from '@/hooks/useBriefing'

type BriefingWidgetProps = {
  projectId?: string
}

export function BriefingWidget({ projectId }: BriefingWidgetProps) {
  const { selectedEventId } = useUIStore()
  const effectiveEventId = selectedEventId || projectId || ""
  const { briefing, loading, error, saveBriefing } = useBriefing(effectiveEventId)

  // Estados locais para os campos reais do briefing
  const [eventName, setEventName] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventLocation, setEventLocation] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [estimatedAttendees, setEstimatedAttendees] = useState(0)
  const [budget, setBudget] = useState(0)
  const [objectives, setObjectives] = useState<string[]>([])
  const [requirements, setRequirements] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Preenche os campos ao carregar briefing real
  useEffect(() => {
    if (!briefing) return
    setEventName(briefing.eventName || "")
    setEventDate(briefing.eventDate || "")
    setEventLocation(briefing.eventLocation || "")
    setEventDescription(briefing.eventDescription || "")
    setTargetAudience(briefing.targetAudience || "")
    setEstimatedAttendees(briefing.estimatedAttendees || 0)
    setBudget(briefing.budget || 0)
    setObjectives(briefing.objectives || [])
    setRequirements(briefing.requirements || [])
  }, [briefing])

  // Salvar briefing real via API
  const handleSaveBriefing = async () => {
    try {
      setIsSaving(true)
      if (!effectiveEventId) {
        toast({
          title: "Nenhum evento selecionado",
          description: "Selecione um evento antes de salvar o briefing.",
          variant: "destructive",
        })
        return
      }
      await saveBriefing({
        eventName,
        eventDate,
        eventLocation,
        eventDescription,
        targetAudience,
        estimatedAttendees,
        budget,
        objectives,
        requirements
      })
      toast({
        title: "Briefing salvo",
        description: "As informações do briefing foram salvas com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao salvar briefing:', error)
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as informações do briefing.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Renderização dos campos reais do briefing
  return (
    <div className="animate-in fade-in-50 duration-300">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">Briefing</h2>
          <p className="text-muted-foreground">
            Configure todos os detalhes do evento
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Seletor de evento pode ser mantido se necessário */}
          <Button 
            onClick={handleSaveBriefing} 
            disabled={isSaving || !effectiveEventId}
            className="transition-all"
          >
            <Save className={cn("h-4 w-4 mr-2", isSaving && "animate-spin")} />
            {isSaving ? "Salvando..." : "Salvar Briefing"}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do Evento</label>
          <input
            className="input input-bordered w-full"
            value={eventName}
            onChange={e => setEventName(e.target.value)}
            placeholder="Nome do evento"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Data do Evento</label>
          <input
            className="input input-bordered w-full"
            type="date"
            value={eventDate}
            onChange={e => setEventDate(e.target.value)}
            placeholder="Data do evento"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Local do Evento</label>
          <input
            className="input input-bordered w-full"
            value={eventLocation}
            onChange={e => setEventLocation(e.target.value)}
            placeholder="Local do evento"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={eventDescription}
            onChange={e => setEventDescription(e.target.value)}
            placeholder="Descrição do evento"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Público-alvo</label>
          <input
            className="input input-bordered w-full"
            value={targetAudience}
            onChange={e => setTargetAudience(e.target.value)}
            placeholder="Público-alvo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estimativa de Participantes</label>
          <input
            className="input input-bordered w-full"
            type="number"
            value={estimatedAttendees}
            onChange={e => setEstimatedAttendees(Number(e.target.value))}
            placeholder="Número estimado"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Orçamento</label>
          <input
            className="input input-bordered w-full"
            type="number"
            value={budget}
            onChange={e => setBudget(Number(e.target.value))}
            placeholder="Orçamento"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Objetivos</label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={objectives.join('\n')}
            onChange={e => setObjectives(e.target.value.split('\n'))}
            placeholder="Um objetivo por linha"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Requisitos</label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={requirements.join('\n')}
            onChange={e => setRequirements(e.target.value.split('\n'))}
            placeholder="Um requisito por linha"
          />
        </div>
      </div>
    </div>
  )
}