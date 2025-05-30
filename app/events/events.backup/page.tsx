'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Event = {
  id: string
  name: string
  date: string
  status: string
  client: string
  type: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events')
        if (!response.ok) {
          throw new Error('Erro ao buscar eventos')
        }
        const { success, events, message } = await response.json()
        if (!success) {
          console.error('Erro na resposta da API:', message)
          return
        }
        setEvents(events || [])
      } catch (error) {
        console.error('Erro ao carregar eventos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Filtra eventos com base no termo de pesquisa
  const filteredEvents = events.filter(
    event =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#282A36] text-[#F8F8F2]">
        <div className="text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-y-2 border-[#8BE9FD]"></div>
          <p className="mt-4 text-lg">Carregando eventos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[#282A36] p-4 text-[#F8F8F2] md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#8BE9FD]">Eventos</h1>
        <p className="text-lg text-[#6272A4]">
          Gerencie todos os seus eventos em um só lugar
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="w-full max-w-md">
          <Input
            placeholder="Buscar eventos..."
            className="border border-[#44475A] bg-[#21222C] text-[#F8F8F2]"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />{' '}
        </div>
        <Link href="/events/new">
          <Button className="bg-[#50FA7B] text-[#282A36] hover:bg-[#43D669]">
            Novo Evento
          </Button>
        </Link>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-xl text-[#6272A4]">
            {searchTerm
              ? 'Nenhum evento encontrado com esse termo'
              : 'Nenhum evento disponível'}
          </p>
          {searchTerm && (
            <Button
              variant="ghost"
              className="mt-4 text-[#BD93F9]"
              onClick={() => setSearchTerm('')}
            >
              Limpar filtro
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map(event => (
            <Link href={`/events/${event.id}`} key={event.id} className="block">
              <Card className="h-full border-[#44475A] bg-[#21222C] text-[#F8F8F2] transition-all duration-200 hover:border-[#BD93F9]">
                <CardHeader>
                  <CardTitle className="text-[#F8F8F2]">{event.name}</CardTitle>
                  <CardDescription className="text-[#6272A4]">
                    {event.client}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-[#6272A4]">
                      Data:{' '}
                      <span className="text-[#F8F8F2]">
                        {new Date(event.date).toLocaleDateString('pt-BR')}
                      </span>
                    </p>
                    <div
                      className={`rounded-md px-2 py-1 text-xs ${
                        event.status === 'confirmado'
                          ? 'bg-green-900 text-green-100'
                          : 'bg-yellow-900 text-yellow-100'
                      }`}
                    >
                      {event.status}
                    </div>
                  </div>
                  <p className="text-sm text-[#6272A4]">
                    Tipo:{' '}
                    <span className="capitalize text-[#F8F8F2]">
                      {event.type}
                    </span>
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="w-full border border-[#BD93F9] text-[#BD93F9]"
                  >
                    Ver Detalhes
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
