import { NextResponse } from 'next/server'
import {
  findEventById,
  readBriefingsData,
  saveBriefingsData,
} from '@/lib/dataManager'

export async function GET(
  _req: Request,
  context: { params: { eventId: string } }
) {
  try {
    const { eventId } = context.params
    console.log(`🔍 [GET /api/briefings/${eventId}] Buscando briefing...`)

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento inválido' },
        { status: 400 }
      )
    }

    // Verificar se o evento existe
    const event = await findEventById(eventId)
    if (!event) {
      console.log(`❌ [GET /api/briefings/${eventId}] Evento não encontrado`)
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Buscar briefing
    const briefings = await readBriefingsData()
    const briefing = briefings[eventId]

    if (!briefing) {
      console.log(
        `⚠️ [GET /api/briefings/${eventId}] Briefing não encontrado, retornando template`
      )
      // Retornar template vazio se não existe
      const templateBriefing = {
        eventId,
        eventTitle: event.title,
        client: event.client,
        createdAt: new Date().toISOString(),
        sections: {
          overview: { title: 'Visão Geral', content: '', completed: false },
          objectives: { title: 'Objetivos', content: '', completed: false },
          target: { title: 'Público-Alvo', content: '', completed: false },
          timeline: { title: 'Cronograma', content: '', completed: false },
          deliverables: { title: 'Entregáveis', content: '', completed: false },
          requirements: {
            title: 'Requisitos Técnicos',
            content: '',
            completed: false,
          },
          notes: {
            title: 'Observações Adicionais',
            content: '',
            completed: false,
          },
        },
      }
      return NextResponse.json(templateBriefing, { status: 200 })
    }

    console.log(`✅ [GET /api/briefings/${eventId}] Briefing encontrado`)
    return NextResponse.json(briefing, { status: 200 })
  } catch (error) {
    console.error(
      `❌ [GET /api/briefings/${context.params.eventId}] Erro:`,
      error
    )
    return NextResponse.json(
      { error: 'Erro ao buscar briefing' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  context: { params: { eventId: string } }
) {
  try {
    const { eventId } = context.params
    const briefingData = await req.json()

    console.log(`💾 [PUT /api/briefings/${eventId}] Salvando briefing...`)

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de evento inválido' },
        { status: 400 }
      )
    }

    // Verificar se o evento existe
    const event = await findEventById(eventId)
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
      createdAt: briefingData.createdAt || new Date().toISOString(),
    }

    // Salvar briefing
    const briefings = await readBriefingsData()
    briefings[eventId] = updatedBriefing
    await saveBriefingsData(briefings)

    console.log(`✅ [PUT /api/briefings/${eventId}] Briefing salvo com sucesso`)
    return NextResponse.json(updatedBriefing, { status: 200 })
  } catch (error) {
    console.error(
      `❌ [PUT /api/briefings/${context.params.eventId}] Erro:`,
      error
    )
    return NextResponse.json(
      { error: 'Erro ao salvar briefing' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  context: { params: { eventId: string } }
) {
  // Redirecionar POST para PUT para manter consistência
  return PUT(req, context)
}
