/**
 * @fileoverview API de manipulação de eventos: buscar, atualizar e deletar eventos por ID.
 * @module app/api/events/[eventId]/route.ts
 *
 * Considerações:
 * - Os parâmetros de rota são resolvidos com `await context.params`.
 * - Utiliza manipulação de arquivos JSON simulando um banco de dados.
 * - Adota tipagem forte e tratamento de erros consistente.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  findEventById,
  readEventsData,
  saveEventsData,
} from '@/lib/dataManager'
import { Event, UpdateEventRequest } from '@/types'

interface Evento {
  id: string
  title: string
  [key: string]: unknown
}

/**
 * Handler GET - Busca evento pelo ID.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    // Await params before using its properties
    const { eventId } = await params
    const event = await getEventById(eventId)

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * Handler PATCH - Atualiza os dados de um evento existente.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    const body = (await request.json()) as UpdateEventRequest

    const existingEvent = await getEventById(eventId)
    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Aplicar atualizações apenas nos campos fornecidos
    const updatedEvent: Event = {
      ...existingEvent,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    await updateEventInDatabase(params.eventId, updatedEvent)

    return NextResponse.json(updatedEvent)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

/**
 * Handler DELETE - Remove um evento existente.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    console.log(`🗑️ [DELETE /api/events/${eventId}] Deletando evento...`)

    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json(
        { error: 'ID de evento inválido' },
        { status: 400 }
      )
    }

    const events = await readEventsData()
    const index = events.findIndex((e: Evento) => e.id === eventId)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    events.splice(index, 1)
    await saveEventsData(events)

    console.log(`✅ [DELETE] Evento ${eventId} deletado com sucesso`)
    return NextResponse.json(
      { message: 'Evento deletado com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ [DELETE] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar evento' },
      { status: 500 }
    )
  }
}

/**
 * Handler POST - Cria um novo evento.
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    const newEvent = {
      ...data,
      description: data.description || '',
      tags: data.tags || [],
      deliverySettings: data.deliverySettings || {
        allowRevisions: true,
        maxRevisions: 3,
      },
    }

    await saveEventsData(newEvent)

    return NextResponse.json(newEvent, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}

// Funções auxiliares (implementar conforme seu banco de dados)
async function getEventById(id: string): Promise<Event | null> {
  // Implementar busca no banco de dados
  // Por enquanto, usa o dataManager
  const event = (await findEventById(id)) as Event | null
  return event
}

async function updateEventInDatabase(id: string, event: Event): Promise<void> {
  // Implementar atualização no banco de dados
  // Por enquanto, usa o dataManager
  const events = await readEventsData()
  const eventIndex = events.findIndex((e: Event) => e.id === id)

  if (eventIndex !== -1) {
    events[eventIndex] = event
    await saveEventsData(events)
  }
}
