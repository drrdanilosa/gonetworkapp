import { NextRequest, NextResponse } from 'next/server'
import {
  findEventById,
  readEventsData,
  saveEventsData,
} from '@/lib/dataManager'

export async function GET(
  req: Request,
  context: { params: { eventId: string } }
) {
  try {
    const eventId = context.params?.eventId
    console.log(`🔍 [GET /api/events/${eventId}] Buscando evento...`)

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento inválido' },
        { status: 400 }
      )
    }

    const event = await findEventById(eventId)

    if (!event) {
      console.log(`❌ [GET /api/events/${eventId}] Evento não encontrado`)
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    console.log(
      `✅ [GET /api/events/${eventId}] Evento encontrado:`,
      event.title
    )
    return NextResponse.json(event, { status: 200 })
  } catch (error) {
    console.error(
      `❌ [GET /api/events/${context.params?.eventId}] Erro:`,
      error
    )
    return NextResponse.json(
      { error: 'Erro ao buscar evento' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  context: { params: { eventId: string } }
) {
  try {
    const eventId = context.params?.eventId
    const updateData = await req.json()

    console.log(`🔄 [PUT /api/events/${eventId}] Atualizando evento...`)

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento inválido' },
        { status: 400 }
      )
    }

    const events = await readEventsData()
    const eventIndex = events.findIndex(e => e.id === eventId)

    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar evento
    events[eventIndex] = {
      ...events[eventIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    await saveEventsData(events)

    console.log(`✅ [PUT /api/events/${eventId}] Evento atualizado com sucesso`)
    return NextResponse.json(events[eventIndex], { status: 200 })
  } catch (error) {
    console.error(`❌ [PUT /api/events/${eventId}] Erro:`, error)
    return NextResponse.json(
      { error: 'Erro ao atualizar evento' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  context: { params: { eventId: string } }
) {
  try {
    const eventId = context.params?.eventId
    console.log(`🗑️ [DELETE /api/events/${eventId}] Deletando evento...`)

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento inválido' },
        { status: 400 }
      )
    }

    const events = await readEventsData()
    const eventIndex = events.findIndex(e => e.id === eventId)

    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Remover evento
    events.splice(eventIndex, 1)
    await saveEventsData(events)

    console.log(
      `✅ [DELETE /api/events/${eventId}] Evento deletado com sucesso`
    )
    return NextResponse.json(
      { message: 'Evento deletado com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error(`❌ [DELETE /api/events/${eventId}] Erro:`, error)
    return NextResponse.json(
      { error: 'Erro ao deletar evento' },
      { status: 500 }
    )
  }
}
