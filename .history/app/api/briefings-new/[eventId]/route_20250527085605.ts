import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'briefings.json')

async function readBriefingData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // Se o arquivo não existir, retornar um objeto vazio
    return {}
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    // ✅ CORREÇÃO: Aguardar os parâmetros antes de usar
    const resolvedParams = await params
    const { eventId } = resolvedParams

    // Ler dados existentes
    const briefingData = await readBriefingData()

    // Buscar o briefing específico
    const briefing = briefingData[eventId]

    if (briefing) {
      return NextResponse.json(briefing, { status: 200 })
    } else {
      return NextResponse.json(
        { error: 'Briefing não encontrado' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Erro ao buscar briefing:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar briefing' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    // ✅ CORREÇÃO: Aguardar os parâmetros antes de usar
    const resolvedParams = await params
    const { eventId } = resolvedParams
    const briefingData = await request.json() as Record<string, unknown>

    // Ler dados existentes
    const existingData = await readBriefingData()

    // Adicionar novo briefing
    existingData[eventId] = {
      ...briefingData,
      eventId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Salvar dados atualizados
    await fs.writeFile(DATA_FILE, JSON.stringify(existingData, null, 2))

    return NextResponse.json(existingData[eventId], { status: 201 })
  } catch (error) {
    console.error('Erro ao criar briefing:', error)
    return NextResponse.json(
      { error: 'Erro ao criar briefing' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    // ✅ CORREÇÃO: Aguardar os parâmetros antes de usar
    const resolvedParams = await params
    const { eventId } = resolvedParams
    const updates = await request.json() as Record<string, unknown>

    // Ler dados existentes
    const briefingData = await readBriefingData()

    // Verificar se o briefing existe
    if (!briefingData[eventId]) {
      return NextResponse.json(
        { error: 'Briefing não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar o briefing
    briefingData[eventId] = {
      ...briefingData[eventId],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    // Salvar dados atualizados
    await fs.writeFile(DATA_FILE, JSON.stringify(briefingData, null, 2))

    return NextResponse.json(briefingData[eventId], { status: 200 })
  } catch (error) {
    console.error('Erro ao atualizar briefing:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar briefing' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    // ✅ CORREÇÃO: Aguardar os parâmetros antes de usar
    const resolvedParams = await params
    const { eventId } = resolvedParams

    // Ler dados existentes
    const briefingData = await readBriefingData()

    // Verificar se o briefing existe
    if (!briefingData[eventId]) {
      return NextResponse.json(
        { error: 'Briefing não encontrado' },
        { status: 404 }
      )
    }

    // Remover o briefing
    delete briefingData[eventId]

    // Salvar dados atualizados
    await fs.writeFile(DATA_FILE, JSON.stringify(briefingData, null, 2))

    return NextResponse.json(
      { success: true, message: 'Briefing removido com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao remover briefing:', error)
    return NextResponse.json(
      { error: 'Erro ao remover briefing' },
      { status: 500 }
    )
  }
}
