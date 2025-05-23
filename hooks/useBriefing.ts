// hooks/useBriefing.ts
import { useState, useEffect, useCallback } from 'react'
import { BriefingData, UseBriefingReturn, createEmptyBriefing, validateBriefingData } from '../types/briefing'

export function useBriefing(eventId: string): UseBriefingReturn {
  const [briefing, setBriefing] = useState<BriefingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const resetError = useCallback(() => {
    setError(null)
  }, [])

  const fetchBriefing = useCallback(async () => {
    if (!eventId) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/briefings/${eventId}`)
      
      if (response.status === 404) {
        // Briefing não existe ainda, isso é normal
        setBriefing(null)
        return
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setBriefing(data)
    } catch (err) {
      console.error('Erro ao buscar briefing:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setBriefing(null)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  const saveBriefing = useCallback(async (data: Partial<BriefingData>): Promise<void> => {
    if (!eventId) {
      throw new Error('ID do evento é obrigatório')
    }

    // Validar dados antes de salvar
    const errors = validateBriefingData(data)
    if (errors.length > 0) {
      throw new Error(errors.join(', '))
    }

    try {
      setError(null)
      
      const payload = {
        ...data,
        eventId,
        updatedAt: new Date().toISOString()
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
        throw new Error(errorData.error || 'Erro ao salvar briefing')
      }
      
      const result = await response.json()
      setBriefing(result.briefing)
    } catch (err) {
      console.error('Erro ao salvar briefing:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [eventId])

  const updateField = useCallback(async <K extends keyof BriefingData>(
    field: K, 
    value: BriefingData[K]
  ): Promise<void> => {
    if (!eventId) {
      throw new Error('ID do evento é obrigatório')
    }

    try {
      setError(null)
      
      const updates = { [field]: value }
      await saveBriefing(updates)
    } catch (err) {
      console.error(`Erro ao atualizar campo ${String(field)}:`, err)
      throw err
    }
  }, [eventId, saveBriefing])

  useEffect(() => {
    fetchBriefing()
  }, [fetchBriefing])

  return { 
    briefing, 
    loading, 
    error,
    fetchBriefing,
    saveBriefing,
    updateField,
    resetError
  }
}