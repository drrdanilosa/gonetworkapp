import { NextResponse } from 'next/server'
import {
  findEventById,
  readEventsData,
  saveEventsData,
} from '@/lib/dataManager'
import { UpdateEventRequest } from '@/types/api'

interface Event {
  id: string
  title: string
  [key: string]: any
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await context.params
    console.log(`🔍 [GET /api/events/${eventId}] Buscando evento...`)

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento inválido' },
        { status: 400 }
      )
    }

    const event = (await findEventById(eventId)) as Event | null

    if (!event) {
      console.log(`❌ [GET /api/events/${eventId}] Evento não encontrado`)
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    console.log(
      `✅ [GET /api/events/${eventId}] Evento encontrado: ${event.title}`
    )
    return NextResponse.json(event, { status: 200 })
  } catch (error) {
    console.error(`❌ [GET /api/events] Erro:`, error)
    return NextResponse.json(
      { error: 'Erro ao buscar evento' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await context.params
    const updateData: UpdateEventRequest = await req.json()

    console.log(`🔄 [PUT /api/events/${eventId}] Atualizando evento...`)

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento inválido' },
        { status: 400 }
      )
    }

    const events = (await readEventsData()) as Event[]
    const eventIndex = events.findIndex(e => e.id === eventId)

    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    const currentEvent = events[eventIndex]
    if (typeof currentEvent !== 'object' || currentEvent === null) {
      return NextResponse.json(
        { error: 'Evento inválido para atualização' },
        { status: 400 }
      )
    }

    events[eventIndex] = {
      ...currentEvent,
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    await saveEventsData(events)

    console.log(`✅ [PUT /api/events/${eventId}] Evento atualizado com sucesso`)
    return NextResponse.json(events[eventIndex], { status: 200 })
  } catch (error) {
    console.error(`❌ [PUT /api/events] Erro:`, error)
    return NextResponse.json(
      { error: 'Erro ao atualizar evento' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await context.params
    console.log(`🗑️ [DELETE /api/events/${eventId}] Deletando evento...`)

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento inválido' },
        { status: 400 }
      )
    }

    const events = (await readEventsData()) as Event[]
    const eventIndex = events.findIndex(e => e.id === eventId)

    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    const deleted = events.splice(eventIndex, 1)[0]
    await saveEventsData(events)

    console.log(
      `✅ [DELETE /api/events/${eventId}] Evento deletado com sucesso`
    )
    return NextResponse.json(
      { message: 'Evento deletado com sucesso', deleted },
      { status: 200 }
    )
  } catch (error) {
    console.error(`❌ [DELETE /api/events] Erro:`, error)
    return NextResponse.json(
      { error: 'Erro ao deletar evento' },
      { status: 500 }
    )
  }
}
