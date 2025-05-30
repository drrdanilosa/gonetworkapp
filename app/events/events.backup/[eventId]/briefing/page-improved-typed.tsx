import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Event, Video } from '@/types'
import EventWidget from '@/components/widgets/event-widget-typed'

interface BriefingPageProps {
  params: { eventId: string }
}

const BriefingPage: React.FC<BriefingPageProps> = ({ params }) => {
  const [event, setEvent] = useState<Event | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEventData()
  }, [params.eventId])

  const fetchEventData = async () => {
    try {
      setLoading(true)

      // Buscar dados do evento
      const eventResponse = await fetch(`/api/events/${params.eventId}`)
      if (!eventResponse.ok) {
        throw new Error('Evento não encontrado')
      }
      const eventData: Event = await eventResponse.json()
      setEvent(eventData)

      // Buscar vídeos do evento
      const videosResponse = await fetch(`/api/events/${params.eventId}/videos`)
      if (videosResponse.ok) {
        const videosData: Video[] = await videosResponse.json()
        setVideos(videosData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleEventUpdate = async (updatedEvent: Event) => {
    try {
      const response = await fetch(`/api/events/${params.eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      })

      if (response.ok) {
        const newEvent: Event = await response.json()
        setEvent(newEvent)
      }
    } catch (err) {
      console.error('Erro ao atualizar evento:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Erro</h1>
          <p className="text-gray-600">{error || 'Evento não encontrado'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Briefing do Evento</h1>
        <p className="text-gray-600">Detalhes e progresso do evento</p>
      </div>

      <EventWidget
        event={event}
        videos={videos}
        onEventUpdate={handleEventUpdate}
      />
    </div>
  )
}

export default BriefingPage
