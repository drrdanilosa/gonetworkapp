import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import axios from 'axios'

interface TimelineContextType {
  timeline: any[]
  loading: boolean
  error: string | null
  fetchTimeline: (id: string) => Promise<void>
  generateTimeline: (id: string) => Promise<boolean>
  refreshTimeline: () => void
}

const TimelineContext = createContext<TimelineContextType | undefined>(
  undefined
)

export function TimelineProvider({ children }: { children: React.ReactNode }) {
  const [timeline, setTimeline] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [eventId, setEventId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchTimeline = useCallback(async (id: string) => {
    if (!id) return

    setEventId(id)
    setLoading(true)
    setError(null)

    try {
      console.log(`🔄 Fetching timeline for event: ${id}`)
      const response = await axios.get(`/api/timeline/${id}`)

      if (
        response.data &&
        response.data.success === true &&
        Array.isArray(response.data.timeline)
      ) {
        setTimeline(response.data.timeline)
        console.log(
          `✅ Timeline loaded with ${response.data.timeline.length} phases`
        )
      } else {
        console.error('❌ Invalid timeline data:', response.data)
        setTimeline([])
        setError('Formato de timeline inválido')
      }
    } catch (err: any) {
      console.error('❌ Error fetching timeline:', err)
      setTimeline([])
      setError(`Erro ao carregar timeline: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  const generateTimeline = useCallback(async (id: string): Promise<boolean> => {
    if (!id) return false

    setLoading(true)
    setError(null)

    try {
      // Get briefing data
      const briefingResponse = await axios.get(`/api/briefings/${id}`)

      if (!briefingResponse.data) {
        throw new Error('Briefing não encontrado')
      }

      // Generate timeline
      const timelineResponse = await axios.post(`/api/timeline/${id}`, {
        generateFromBriefing: true,
        briefingData: briefingResponse.data,
      })

      if (!timelineResponse.data.success) {
        throw new Error('Falha ao gerar timeline')
      }

      // Update timeline state
      if (Array.isArray(timelineResponse.data.timeline)) {
        setTimeline(timelineResponse.data.timeline)
      }

      setRefreshKey(prev => prev + 1)
      return true
    } catch (err: any) {
      console.error('❌ Error generating timeline:', err)
      setError(`Erro ao gerar timeline: ${err.message}`)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshTimeline = useCallback(() => {
    if (eventId) {
      setRefreshKey(prev => prev + 1)
      fetchTimeline(eventId)
    }
  }, [eventId, fetchTimeline])

  useEffect(() => {
    if (eventId) {
      fetchTimeline(eventId)
    }
  }, [eventId, refreshKey, fetchTimeline])

  return (
    <TimelineContext.Provider
      value={{
        timeline,
        loading,
        error,
        fetchTimeline,
        generateTimeline,
        refreshTimeline,
      }}
    >
      {children}
    </TimelineContext.Provider>
  )
}

export function useTimeline() {
  const context = useContext(TimelineContext)

  if (context === undefined) {
    throw new Error('useTimeline must be used within a TimelineProvider')
  }

  return context
}
