// Tipos TypeScript para o sistema de briefing
export interface BriefingData {
  eventId: string
  eventName: string
  eventDate: string
  eventLocation: string
  eventDescription: string
  targetAudience: string
  estimatedAttendees: number
  budget: number
  objectives: string[]
  requirements: string[]
  timeline: TimelineItem[]
  team: TeamMember[]
  deliverables: Deliverable[]
  createdAt: string
  updatedAt: string
}

export interface TimelineItem {
  id: string
  name: string
  description: string
  start: string
  end: string
  duration: number
  completed: boolean
  assignedTo?: string[]
  dependencies?: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  phone?: string
  skills: string[]
  availability: AvailabilityPeriod[]
  hourlyRate?: number
}

export interface AvailabilityPeriod {
  startDate: string
  endDate: string
  hoursPerDay: number
}

export interface Deliverable {
  id: string
  name: string
  description: string
  type: 'document' | 'video' | 'audio' | 'image' | 'presentation' | 'other'
  status: 'pending' | 'in-progress' | 'review' | 'completed' | 'cancelled'
  dueDate: string
  assignedTo: string[]
  dependencies?: string[]
  files?: DeliverableFile[]
}

export interface DeliverableFile {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
  uploadedBy: string
}

// Estados de carregamento e erro
export interface UseBriefingReturn {
  briefing: BriefingData | null
  loading: boolean
  error: string | null
  fetchBriefing: () => Promise<void>
  saveBriefing: (data: Partial<BriefingData>) => Promise<void>
  updateField: <K extends keyof BriefingData>(
    field: K,
    value: BriefingData[K]
  ) => Promise<void>
  resetError: () => void
}

// Dados iniciais para novo briefing
export const createEmptyBriefing = (eventId: string): BriefingData => ({
  eventId,
  eventName: '',
  eventDate: '',
  eventLocation: '',
  eventDescription: '',
  targetAudience: '',
  estimatedAttendees: 0,
  budget: 0,
  objectives: [],
  requirements: [],
  timeline: [],
  team: [],
  deliverables: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

// Validação de dados
export const validateBriefingData = (data: Partial<BriefingData>): string[] => {
  const errors: string[] = []

  if (!data.eventName?.trim()) {
    errors.push('Nome do evento é obrigatório')
  }

  if (!data.eventDate) {
    errors.push('Data do evento é obrigatória')
  }

  if (!data.eventLocation?.trim()) {
    errors.push('Local do evento é obrigatório')
  }

  if (!data.targetAudience?.trim()) {
    errors.push('Público-alvo é obrigatório')
  }

  if (data.estimatedAttendees !== undefined && data.estimatedAttendees <= 0) {
    errors.push('Número estimado de participantes deve ser maior que zero')
  }

  if (data.budget !== undefined && data.budget < 0) {
    errors.push('Orçamento não pode ser negativo')
  }

  return errors
}
