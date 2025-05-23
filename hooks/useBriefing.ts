// hooks/useBriefing.ts
import { useState, useEffect, useCallback } from 'react'

interface BriefingData {
  id: string
  eventId: string
  projectName?: string
  client?: string
  briefingDate?: string
  eventDate?: string
  location?: string
  description?: string
  objectives?: string[]
  targetAudience?: string
  budget?: number
  specialRequirements?: string
  team?: any[]
  editorialInfo?: any
  deliveries?: any[]
  createdAt: string
  updatedAt: string
  [key: string]: any
}

interface UseBriefingReturn {
  briefing: BriefingData | null
  loading: boolean
  error: string | null
  exists: boolean
  refetch: () => Promise<void>
  createBriefing: (data: Partial<BriefingData>) => Promise<boolean>
  updateBriefing: (data: Partial<BriefingData>) => Promise<boolean>
  updatePartial: (updates: Partial<BriefingData>) => Promise<boolean>
  replaceBriefing: (data: Partial<BriefingData>) => Promise<boolean>
  deleteBriefing: () => Promise<boolean>
  clearError: () => void
}

export function useBriefing(eventId: string): UseBriefingReturn {
  const [briefing, setBriefing] = useState<BriefingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exists, setExists] = useState(false)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchBriefing = useCallback(async () => {
    if (!eventId) {
      setLoading(false)
      setExists(false)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/briefings/${eventId}`)
      
      if (response.status === 404) {
        // Briefing não existe ainda, isso é normal
        setBriefing(null)
        setExists(false)
        return
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setBriefing(data)
      setExists(true)
    } catch (err) {
      console.error('Erro ao buscar briefing:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setBriefing(null)
      setExists(false)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  const createBriefing = useCallback(async (data: Partial<BriefingData>): Promise<boolean> => {
    if (!eventId) {
      setError('ID do evento é obrigatório')
      return false
    }

    if (exists) {
      setError('Briefing já existe. Use updateBriefing para atualizar.')
      return false
    }

    try {
      setError(null)
      
      const payload = {
        ...data,
        eventId
      }
      
      const response = await fetch(`/api/briefings/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar briefing')
      }
      
      const result = await response.json()
      setBriefing(result.briefing)
      setExists(true)
      return true
    } catch (err) {
      console.error('Erro ao criar briefing:', err)
      setError(err instanceof Error ? err.message : 'Erro ao criar')
      return false
    }
  }, [eventId, exists])

  const updateBriefing = useCallback(async (data: Partial<BriefingData>): Promise<boolean> => {
    if (!eventId) {
      setError('ID do evento é obrigatório')
      return false
    }

    try {
      setError(null)
      
      const payload = {
        ...data,
        eventId
      }
      
      // Se não existe, criar. Se existe, atualizar.
      const response = await fetch(`/api/briefings/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar briefing')
      }
      
      const result = await response.json()
      setBriefing(result.briefing)
      setExists(true)
      return true
    } catch (err) {
      console.error('Erro ao atualizar briefing:', err)
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      return false
    }
  }, [eventId])

  const updatePartial = useCallback(async (updates: Partial<BriefingData>): Promise<boolean> => {
    if (!eventId) {
      setError('ID do evento é obrigatório')
      return false
    }

    if (!exists) {
      setError('Briefing não existe. Use createBriefing primeiro.')
      return false
    }

    try {
      setError(null)
      
      const response = await fetch(`/api/briefings/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar briefing')
      }
      
      const result = await response.json()
      setBriefing(result.briefing)
      return true
    } catch (err) {
      console.error('Erro ao atualizar briefing parcialmente:', err)
      setError(err instanceof Error ? err.message : 'Erro ao atualizar')
      return false
    }
  }, [eventId, exists])

  const replaceBriefing = useCallback(async (data: Partial<BriefingData>): Promise<boolean> => {
    if (!eventId) {
      setError('ID do evento é obrigatório')
      return false
    }

    if (!exists) {
      setError('Briefing não existe. Use createBriefing primeiro.')
      return false
    }

    try {
      setError(null)
      
      const response = await fetch(`/api/briefings/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao substituir briefing')
      }
      
      const result = await response.json()
      setBriefing(result.briefing)
      return true
    } catch (err) {
      console.error('Erro ao substituir briefing:', err)
      setError(err instanceof Error ? err.message : 'Erro ao substituir')
      return false
    }
  }, [eventId, exists])

  const deleteBriefing = useCallback(async (): Promise<boolean> => {
    if (!eventId) {
      setError('ID do evento é obrigatório')
      return false
    }

    if (!exists) {
      setError('Briefing não existe.')
      return false
    }

    try {
      setError(null)
      
      const response = await fetch(`/api/briefings/${eventId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao remover briefing')
      }
      
      setBriefing(null)
      setExists(false)
      return true
    } catch (err) {
      console.error('Erro ao remover briefing:', err)
      setError(err instanceof Error ? err.message : 'Erro ao remover')
      return false
    }
  }, [eventId, exists])

  useEffect(() => {
    fetchBriefing()
  }, [fetchBriefing])

  return { 
    briefing, 
    loading, 
    error,
    exists,
    refetch: fetchBriefing,
    createBriefing,
    updateBriefing,
    updatePartial,
    replaceBriefing,
    deleteBriefing,
    clearError
  }
}