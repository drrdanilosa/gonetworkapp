import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { readEventsData, saveEventsData } from '@/lib/dataManager'
import {
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

    // Simulação de busca no banco de dados
    const rawEvents = await fetchEventsFromDatabase(params)

    // Transformar dados do banco para o formato da API
    const events: Event[] = rawEvents

    const response: EventListResponse = {
      events,
      total: events.length,
      page: params.page,
      limit: params.limit
    }

    console.log(`📊 [GET /api/events] Retornando ${events.length} eventos`)

    return NextResponse.json(response)

    console.log('✅ [GET /api/events] Resposta enviada com sucesso')
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
    const body = await request.json() as CreateEventRequest

    // Validação básica
    if (!body.title || !body.client || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, client, date' },
        { status: 400 }
      )
    }

    const newEvent: Event = {
      id: generateId(),
      title: body.title,
      client: body.client,
      status: body.status || 'pendente',
      date: body.date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: body.description,
      location: body.location,
    }

    // Salvar no banco de dados
    await saveEventToDatabase(newEvent)

    return NextResponse.json(newEvent, { status: 201 })
      description: description || '',
      tags: tags || [],
      deliverySettings: data.deliverySettings || {
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

    // Ler eventos existentes
    const events = await readEventsData()

    // Verificar se já existe
    const existingIndex = events.findIndex(e => e.id === newId)
    if (existingIndex >= 0) {
      // Atualizar existente
      events[existingIndex] = {
        ...events[existingIndex],
        ...newEvent,
        updatedAt: now,
      }
      console.log('🔄 [POST /api/events] Evento atualizado:', newId)
    } else {
      // Adicionar novo
      events.push(newEvent)
      console.log('✅ [POST /api/events] Novo evento adicionado:', newId)
    }

    // Salvar
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

// Funções auxiliares (implementar conforme seu banco de dados)
async function fetchEventsFromDatabase(_params: SearchParams): Promise<Event[]> {
  // Implementar busca no seu banco de dados
  // Por enquanto, retorna dados do dataManager
  const events = await readEventsData()
  return events as Event[]
}

async function saveEventToDatabase(event: Event): Promise<void> {
  // Implementar salvamento no seu banco de dados
  // Por enquanto, usa o dataManager
  const events = await readEventsData()
  events.push(event)
  await saveEventsData(events)
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}
