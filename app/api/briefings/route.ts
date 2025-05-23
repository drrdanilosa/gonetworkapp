import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Caminho para armazenar os dados (em produção, usar banco de dados)
const DATA_FILE = path.join(process.cwd(), 'data', 'briefings.json')

// Função para ler os dados existentes
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

// Função para salvar os dados
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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { eventId } = data

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID do evento é obrigatório' },
        { status: 400 }
      )
    }

    // Ler dados existentes
    const briefingData = await readBriefingData()
    
    // Atualizar com os novos dados
    briefingData[eventId] = {
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    // Salvar dados atualizados
    await saveBriefingData(briefingData)

    return NextResponse.json(
      { success: true, message: 'Briefing salvo com sucesso', data: briefingData[eventId] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    
    // Ler todos os briefings
    const briefingData = await readBriefingData()
    
    // Se foi solicitado um eventId específico
    if (eventId) {
      const briefing = briefingData[eventId]
      if (!briefing) {
        return NextResponse.json(
          { error: 'Briefing não encontrado' },
          { status: 404 }
        )
      }
      return NextResponse.json(briefing, { status: 200 })
    }
    
    // Retorna todos os briefings
    return NextResponse.json(briefingData, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar briefings:', error)
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    )
  }
}
