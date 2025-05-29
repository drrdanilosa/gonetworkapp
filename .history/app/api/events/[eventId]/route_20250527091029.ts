import { NextRequest, NextResponse } from 'next/server'
import { readEventsData, writeEventsData } from '@/lib/dataManager'

/**
 * GET /api/events/[eventId]
 * Retorna os dados de um evento específico pelo ID.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const events = (await readEventsData()) as Array<{ id: string; [key: string]: any }>

    const event = events.find(e => e.id === eventId)

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('[GET EVENT ERROR]', error)
    return NextResponse.json({ error: 'Erro interno ao buscar evento' }, { status: 500 })
  }
}

/**
 * PUT /api/events/[eventId]
 * Atualiza os dados de um evento específico.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const updateData = (await request.json()) as Record<string, any>

    const events = (await readEventsData()) as Array<{ id: string; [key: string]: any }>
    const eventIndex = events.findIndex(e => e.id === eventId)

    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const currentEvent = events[eventIndex]

    if (typeof currentEvent !== 'object' || currentEvent === null) {
      return NextResponse.json({ error: 'Dados do evento inválidos' }, { status: 400 })
    }

    events[eventIndex] = {
      ...currentEvent,
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    await writeEventsData(events)

    return NextResponse.json(events[eventIndex])
  } catch (error) {
    console.error('[PUT EVENT ERROR]', error)
    return NextResponse.json({ error: 'Erro interno ao atualizar evento' }, { status: 500 })
  }
}

/**
 * DELETE /api/events/[eventId]
 * Remove um evento específico pelo ID.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const events = (await readEventsData()) as Array<{ id: string; [key: string]: any }>
    const eventIndex = events.findIndex(e => e.id === eventId)

    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const deletedEvent = events.splice(eventIndex, 1)[0]
    await writeEventsData(events)

    return NextResponse.json({ success: true, deleted: deletedEvent })
  } catch (error) {
    console.error('[DELETE EVENT ERROR]', error)
    return NextResponse.json({ error: 'Erro interno ao deletar evento' }, { status: 500 })
  }
}
