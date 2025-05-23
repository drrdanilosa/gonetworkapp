// Atualize o BriefingWidget para integrar com os eventos
// Encontre a seção na parte superior do componente BriefingWidget e ajuste:

"use client"

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
// ... outros imports ...

import { useUIStore } from '@/store/useUIStore'
import { useProjectsStore } from '@/store/projects-store'
import EventSelector from '@/components/project/EventSelector'
// ... restante dos imports ...

type BriefingWidgetProps = {
  projectId?: string
}

export function BriefingWidget({ projectId }: BriefingWidgetProps) {
  // ... estados existentes ...
  
  // Integração com o store de projetos
  const { projects, updateBriefing } = useProjectsStore()
  const { selectedEventId, setSelectedEventId } = useUIStore()
  
  // Usar o ID do evento selecionado do useUIStore
  const effectiveEventId = selectedEventId || projectId || ""
  
  // Efeito para carregar dados do evento selecionado
  useEffect(() => {
    if (!effectiveEventId) return
    
    const selectedProject = projects.find(p => p.id === effectiveEventId)
    if (!selectedProject) return
    
    // Preencher os campos básicos do briefing
    if (selectedProject.name) {
      // Aqui você preencheria os campos do briefing
      // Este é um exemplo, adapte conforme sua implementação real
      // reset({
      //   eventName: selectedProject.name,
      //   eventDate: new Date(selectedProject.startDate),
      //   eventLocation: selectedProject.location,
      //   // ... outros campos
      // })
      
      // Como exemplo, vamos simular preenchendo eventDate
      if (selectedProject.startDate) {
        setEventDate(selectedProject.startDate)
      }
    }
    
    // Se já existir um briefing para este projeto, carregar esses dados também
    if (selectedProject.briefing) {
      const { briefing } = selectedProject
      // Preencher os campos do briefing existente
      // Exemplo:
      // setVisualStyle(briefing.visualStyle || '')
      // setReferences(briefing.references || '')
      // ... e assim por diante
    }
    
  }, [effectiveEventId, projects])
  
  // Sobrescreva o handleSaveBriefing para salvar no store
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
      
      // Coletar todos os dados do briefing
      const briefingData = {
        visualStyle,
        references,
        // ... outros campos do briefing
        sponsors,
        stages,
        realTimeDeliveries,
        teaserTime,
        postEventDeadline,
        deadlineUnit,
        postEventOptions,
        postEventNotes,
        lastUpdated: new Date().toISOString(),
      }
      
      // Salvar no store
      updateBriefing(effectiveEventId, briefingData)
      
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
  
  // Modifique a seção de cabeçalho para incluir o seletor de eventos
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
          <EventSelector />
          
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
      
      {/* Resto do componente... */}
    </div>
  )
}