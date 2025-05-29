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

// Tipagem explícita do contexto
interface RouteParams {
  params: Promise<{ eventId: string }>
}

interface Evento {
  id: string
  title: string
  [key: string]: unknown
}

/**
 * Handler GET - Busca evento pelo ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const event = await getEventById(params.eventId)

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

/**
 * Handler PUT - Atualiza os dados de um evento existente.
 */
export async function PUT(req: Request, context: RouteParams) {
  try {
    const { eventId } = await context.params
    const updateData: UpdateEventRequest = await req.json()
    console.log(`🔄 [PUT /api/events/${eventId}] Atualizando evento...`)

    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json(
        { error: 'ID de evento inválido' },
        { status: 400 }
      )
    }

    const events = await readEventsData()
    const eventIndex = events.findIndex((e: Evento) => e.id === eventId)

    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    events[eventIndex] = {
      ...events[eventIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    await saveEventsData(events)

    console.log(`✅ [PUT] Evento ${eventId} atualizado com sucesso`)
    return NextResponse.json(events[eventIndex], { status: 200 })
  } catch (error) {
    console.error('❌ [PUT] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar evento' },
      { status: 500 }
    )
  }
}

/**
 * Handler DELETE - Remove um evento existente.
 */
export async function DELETE(req: Request, context: RouteParams) {
  try {
    const { eventId } = await context.params
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
