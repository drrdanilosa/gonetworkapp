import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { readEventsData, saveEventsData } from '@/lib/dataManager'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status')
    const client = searchParams.get('client')
    const sort = searchParams.get('sort') || 'desc'
    
    console.log('🔍 [GET /api/events] Buscando eventos...')
    
    let events = await readEventsData()
    console.log(`📊 [GET /api/events] Encontrados ${events.length} eventos`)
    
    // Aplicar filtros
    if (status) {
      events = events.filter(p => p.status === status)
      console.log(`🔍 Filtro status "${status}": ${events.length} eventos`)
    }
    
    if (client) {
      events = events.filter(p => 
        p.client?.toLowerCase().includes(client.toLowerCase())
      )
      console.log(`🔍 Filtro cliente "${client}": ${events.length} eventos`)
    }
    
    // Ordenação
    events.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0).getTime()
      const dateB = new Date(b.createdAt || b.date || 0).getTime()
      return sort === 'desc' ? dateB - dateA : dateA - dateB
    })
    
    const responseData = {
      success: true,
      count: events.length,
      events: events.map(p => ({
        id: p.id,
        title: p.title,
        client: p.client,
        status: p.status,
        date: p.date,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        thumbnail: p.thumbnail,
        videoCount: p.videos?.length || 0,
        deadlines: p.deadlines,
        description: p.description,
        tags: p.tags,
        team: p.team,
        briefing: p.briefing
      })),
    }
    
    console.log('✅ [GET /api/events] Resposta enviada com sucesso')
    return NextResponse.json(responseData)
    
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

export async function POST(req: Request) {
  try {
    const data = await req.json()
    console.log('📝 [POST /api/events] Dados recebidos:', data)
    
    const { title, client, date, team, briefing, description, tags } = data
    
    if (!title) {
      return NextResponse.json({
        success: false,
        error: 'O título do evento é obrigatório'
      }, { status: 400 })
    }
    
    const newId = data.id || uuidv4()
    const now = new Date().toISOString()
    
    const newEvent = {
      id: newId,
      title,
      client: client || 'Cliente não especificado',
      date: date || now,
      createdAt: now,
      updatedAt: now,
      status: 'active',
      team: team || [],
      briefing: briefing || null,
      videos: [],
      assets: [],
      tasks: [],
      deadline: data.deadline || null,
      thumbnail: data.thumbnail || '/placeholder-event.jpg',
      description: description || '',
      tags: tags || [],
      deliverySettings: data.deliverySettings || {
        allowRevisions: true,
        maxRevisions: 3,
        autoApprove: false,
        notifyOnUpload: true,
      },
    }
    
    console.log('🆕 [POST /api/events] Criando evento:', newEvent.id, '-', newEvent.title)
    
    // Ler eventos existentes
    const events = await readEventsData()
    
    // Verificar se já existe
    const existingIndex = events.findIndex(e => e.id === newId)
    if (existingIndex >= 0) {
      // Atualizar existente
      events[existingIndex] = { ...events[existingIndex], ...newEvent, updatedAt: now }
      console.log('🔄 [POST /api/events] Evento atualizado:', newId)
    } else {
      // Adicionar novo
      events.push(newEvent)
      console.log('✅ [POST /api/events] Novo evento adicionado:', newId)
    }
    
    // Salvar
    await saveEventsData(events)
    
    return NextResponse.json({
      success: true,
      message: 'Evento criado com sucesso',
      event: newEvent
    }, { status: 201 })
    
  } catch (error) {
    console.error('❌ [POST /api/events] Erro ao criar evento:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno ao criar evento',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
