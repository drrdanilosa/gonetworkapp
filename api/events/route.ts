import { NextRequest, NextResponse } from 'next/server'

// Configuração para export estático
export const dynamic = "force-static"

import { v4 as uuidv4 } from 'uuid'

// Configuração para export estático
export const dynamic = "force-static"

import { readEventsData, saveEventsData } from '@/lib/dataManager'

// Configuração para export estático
export const dynamic = "force-static"

import {

// Configuração para export estático
export const dynamic = "force-static"

  Event,
  CreateEventRequest,
  EventListResponse,
  SearchParams,
} from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params: SearchParams = {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 10,
      status: searchParams.get('status') || undefined,
      client: searchParams.get('client') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    }

    console.log('🔍 [GET /api/events] Buscando eventos...')

    const rawEvents = await fetchEventsFromDatabase(params)

    const events: Event[] = rawEvents

    const response: EventListResponse = {
      events,
      total: events.length,
      page: params.page,
      limit: params.limit,
    }

    console.log(`📊 [GET /api/events] Retornando ${events.length} eventos`)

    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ [GET /api/events] Erro:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao processar eventos',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateEventRequest

    if (!body.title || !body.client || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, client, date' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    const newEvent: Event = {
      id: uuidv4(),
      title: body.title,
      client: body.client,
      status: body.status || 'pendente',
      date: body.date,
      createdAt: now,
      updatedAt: now,
      description: body.description || '',
      location: body.location || '',
      tags: body.tags || [],
      deliverySettings: body.deliverySettings || {
        allowRevisions: true,
        maxRevisions: 3,
        autoApprove: false,
        notifyOnUpload: true,
      },
    }

    console.log(
      '🆕 [POST /api/events] Criando evento:',
      newEvent.id,
      '-',
      newEvent.title
    )

    const events = await readEventsData()
    events.push(newEvent)
    await saveEventsData(events)

    return NextResponse.json(
      {
        success: true,
        message: 'Evento criado com sucesso',
        event: newEvent,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ [POST /api/events] Erro ao criar evento:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao criar evento',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

async function fetchEventsFromDatabase(
  _params: SearchParams
): Promise<Event[]> {
  const events = await readEventsData()
  return events as Event[]
}
