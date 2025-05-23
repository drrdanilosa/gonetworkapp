// app/api/briefings/[eventId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const DATA_FILE = path.join(process.cwd(), 'data', 'briefings.json')

// Função auxiliar para ler dados de briefing
async function readBriefingData() {
  try {
    const dir = path.dirname(DATA_FILE)
    await fs.mkdir(dir, { recursive: true })
    
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      // Se o arquivo não existir, retorna objeto vazio
      return {}
    }
  } catch (error) {
    console.error('Erro ao ler dados de briefing:', error)
    return {}
  }
}

// Função auxiliar para salvar dados de briefing
async function saveBriefingData(data: Record<string, any>) {
  try {
    const dir = path.dirname(DATA_FILE)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Erro ao salvar dados de briefing:', error)
    throw error
  }
}

// Interface para o Briefing
interface BriefingData {
  id: string
  eventId: string
  projectName?: string
  client?: string
  briefingDate?: string
  eventDate?: string
  location?: string
  description?: string
  objectives?: string[]
  targetAudience?: string
  budget?: number
  specialRequirements?: string
  team?: any[]
  editorialInfo?: any
  deliveries?: any[]
  createdAt: string
  updatedAt: string
  [key: string]: any
}

/**
 * GET - Buscar briefing de um evento específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'ID do evento é obrigatório' },
        { status: 400 }
      )
    }
    
    const briefingData = await readBriefingData()
    const briefing = briefingData[eventId]
    
    if (!briefing) {
      return NextResponse.json(
        { 
          error: 'Briefing não encontrado para este evento',
          eventId 
        },
        { status: 404 }
      )
    }
    
    console.log(`[GET /api/briefings/${eventId}] Briefing encontrado`)
    return NextResponse.json(briefing, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar briefing:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao processar requisição',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * POST - Criar ou atualizar briefing de um evento
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const data = await request.json()

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID do evento é obrigatório' },
        { status: 400 }
      )
    }

    // Validar dados mínimos
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados do briefing não fornecidos',
        },
        { status: 400 }
      )
    }

    // Ler dados existentes
    const briefingData = await readBriefingData()
    const existingBriefing = briefingData[eventId]
    
    // Preparar objeto do briefing
    const now = new Date().toISOString()
    const briefingRecord: BriefingData = {
      id: existingBriefing?.id || data.id || uuidv4(),
      eventId,
      ...data,
      createdAt: existingBriefing?.createdAt || now,
      updatedAt: now,
    }

    // Salvar briefing atualizado
    briefingData[eventId] = briefingRecord
    await saveBriefingData(briefingData)

    console.log(`[POST /api/briefings/${eventId}] Briefing ${existingBriefing ? 'atualizado' : 'criado'}`)

    return NextResponse.json(
      {
        success: true,
        message: `Briefing ${existingBriefing ? 'atualizado' : 'criado'} com sucesso`,
        eventId,
        briefing: briefingRecord,
      },
      { status: existingBriefing ? 200 : 201 }
    )
  } catch (error) {
    console.error('Erro ao salvar briefing:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao salvar briefing',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * PUT - Atualizar briefing completo (substitui dados existentes)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const data = await request.json()

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID do evento é obrigatório' },
        { status: 400 }
      )
    }

    // Ler dados existentes
    const briefingData = await readBriefingData()
    const existingBriefing = briefingData[eventId]
    
    if (!existingBriefing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Briefing não encontrado para atualização',
        },
        { status: 404 }
      )
    }

    // Substituir dados completamente (manter apenas id, eventId, createdAt)
    const now = new Date().toISOString()
    const briefingRecord: BriefingData = {
      id: existingBriefing.id,
      eventId,
      ...data,
      createdAt: existingBriefing.createdAt,
      updatedAt: now,
    }

    briefingData[eventId] = briefingRecord
    await saveBriefingData(briefingData)

    console.log(`[PUT /api/briefings/${eventId}] Briefing substituído completamente`)

    return NextResponse.json(
      {
        success: true,
        message: 'Briefing atualizado completamente com sucesso',
        eventId,
        briefing: briefingRecord,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao atualizar briefing:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao atualizar briefing',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Atualizar parcialmente o briefing (merge com dados existentes)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const updates = await request.json()

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID do evento é obrigatório' },
        { status: 400 }
      )
    }

    // Ler dados existentes
    const briefingData = await readBriefingData()
    const existingBriefing = briefingData[eventId]
    
    if (!existingBriefing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Briefing não encontrado para atualização',
        },
        { status: 404 }
      )
    }

    // Fazer merge dos dados (preservar dados existentes)
    const now = new Date().toISOString()
    const briefingRecord: BriefingData = {
      ...existingBriefing,
      ...updates,
      id: existingBriefing.id, // Não permitir alterar ID
      eventId, // Garantir consistência
      createdAt: existingBriefing.createdAt, // Preservar data de criação
      updatedAt: now,
    }

    briefingData[eventId] = briefingRecord
    await saveBriefingData(briefingData)

    console.log(`[PATCH /api/briefings/${eventId}] Briefing atualizado parcialmente`)

    return NextResponse.json(
      {
        success: true,
        message: 'Briefing atualizado parcialmente com sucesso',
        eventId,
        briefing: briefingRecord,
        updatedFields: Object.keys(updates),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao atualizar briefing parcialmente:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao atualizar briefing',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remover briefing de um evento
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID do evento é obrigatório' },
        { status: 400 }
      )
    }

    // Ler dados existentes
    const briefingData = await readBriefingData()
    const existingBriefing = briefingData[eventId]
    
    if (!existingBriefing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Briefing não encontrado para remoção',
        },
        { status: 404 }
      )
    }

    // Remover o briefing
    delete briefingData[eventId]
    await saveBriefingData(briefingData)

    console.log(`[DELETE /api/briefings/${eventId}] Briefing removido`)

    return NextResponse.json(
      {
        success: true,
        message: 'Briefing removido com sucesso',
        eventId,
        deletedBriefing: {
          id: existingBriefing.id,
          createdAt: existingBriefing.createdAt,
          updatedAt: existingBriefing.updatedAt
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao remover briefing:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao remover briefing',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}