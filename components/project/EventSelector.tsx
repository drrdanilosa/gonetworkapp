"use client"

import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { useUIStore } from '@/store/useUIStore'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EventSelectorProps {
  label?: string
  className?: string
  onEventSelect?: (eventId: string) => void
}

export default function EventSelector({ 
  label = "Selecionar Evento",
  className = "",
  onEventSelect
}: EventSelectorProps) {
  const { projects } = useProjectsStore()
  const { selectedEventId, setSelectedEventId } = useUIStore()
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Se só houver um evento, selecione-o automaticamente
  useEffect(() => {
    if (!isInitialized && projects.length === 1 && !selectedEventId) {
      setSelectedEventId(projects[0].id)
      if (onEventSelect) {
        onEventSelect(projects[0].id)
      }
      setIsInitialized(true)
    }
  }, [projects, selectedEventId, setSelectedEventId, onEventSelect, isInitialized])

  const handleSelectEvent = (value: string) => {
    setSelectedEventId(value)
    if (onEventSelect) {
      onEventSelect(value)
    }
  }

  // Função para formatar data do evento para exibição
  const formatEventDate = (event: any) => {
    try {
      if (!event.startDate) return ""
      
      const startDate = parseISO(event.startDate)
      return format(startDate, "dd MMM yyyy", { locale: ptBR })
    } catch (error) {
      return ""
    }
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Label htmlFor="event-selector" className="whitespace-nowrap">{label}:</Label>
      <Select
        value={selectedEventId || ""}
        onValueChange={handleSelectEvent}
      >
        <SelectTrigger id="event-selector" className="w-[250px]">
          <SelectValue placeholder="Selecione um evento" />
        </SelectTrigger>
        <SelectContent>
          {projects.length > 0 ? (
            projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name} {formatEventDate(project) && `(${formatEventDate(project)})`}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="" disabled>
              Nenhum evento disponível
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}