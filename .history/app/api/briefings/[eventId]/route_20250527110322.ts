import { NextRequest, NextResponse } from 'next/server'
import {
  findEventById,
  readBriefingsData,
  saveBriefingsData,
} from '@/lib/dataManager'

async function getBriefingByEventId(eventId: string) {
  const briefings = await readBriefingsData()
  return briefings[eventId] || null
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    const briefing = await getBriefingByEventId(eventId)

    if (!briefing) {
      console.warn(
        `Briefing não encontrado, retornando template para ${eventId}`
      )
      return NextResponse.json({ template: true }, { status: 200 })
    }

    return NextResponse.json(briefing)
  } catch (error) {
    console.error('Error fetching briefing:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    // Aguarda os parâmetros antes de usá-los
    const { eventId } = await params
    const briefingData = (await req.json()) as Record<string, unknown>

    console.log(`💾 [PUT /api/briefings/${eventId}] Salvando briefing...`)

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento inválido' },
        { status: 400 }
      )
    }

    // Verificar se o evento existe
    const event = (await findEventById(eventId)) as {
      title: string
      client: string
    } | null
    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Preparar dados do briefing
    const updatedBriefing = {
      ...briefingData,
      eventId,
      eventTitle: event.title,
      client: event.client,
      updatedAt: new Date().toISOString(),
      createdAt:
        ((briefingData as Record<string, unknown>).createdAt as string) ||
        new Date().toISOString(),
    }

    // Salvar briefing
    const briefings = await readBriefingsData()
    briefings[eventId] = updatedBriefing
    await saveBriefingsData(briefings as Record<string, unknown>)

    console.log(`✅ [PUT /api/briefings/${eventId}] Briefing salvo com sucesso`)
    return NextResponse.json(updatedBriefing, { status: 200 })
  } catch (error) {
    console.error(`❌ [PUT /api/briefings] Erro:`, error)
    return NextResponse.json(
      { error: 'Erro ao salvar briefing' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  // Redirecionar POST para PUT para manter consistência
  return PUT(req, { params })
}
