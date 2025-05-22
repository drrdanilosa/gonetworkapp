import { NextRequest, NextResponse } from 'next/server'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { v4 as uuidv4 } from 'uuid'
import type { VideoDeliverable } from '@/types/project'

export async function GET(
  req: Request,
  context: { params: { eventId: string } }
) {
  try {
    // Verifica e valida o eventId
    const eventId = context.params?.eventId
    if (!eventId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de evento inválido',
        },
        { status: 400 }
      )
    }

    // Acessar o estado global do Zustand
    const store = useProjectsStore.getState()

    // Buscar o projeto pelo ID
    const project = store.projects.find(p => p.id === eventId)
    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Projeto não encontrado',
        },
        { status: 404 }
      )
    }

    // Verificar se o projeto tem briefing
    if (!project.briefing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Briefing não encontrado para este projeto',
        },
        { status: 404 }
      )
    }

    // Retornar o briefing do projeto
    return NextResponse.json(
      {
        success: true,
        projectId: eventId,
        briefing: project.briefing,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao buscar briefing:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao buscar briefing',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * POST - Criar ou atualizar o briefing de um evento
 */
export async function POST(
  req: Request,
  context: { params: { eventId: string } }
) {
  try {
    const { eventId } = context.params
    const data = await req.json()

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

    // Acessar o estado global do Zustand
    const store = useProjectsStore.getState()

    // Buscar o projeto pelo ID
    const project = store.projects.find(p => p.id === eventId)
    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Projeto não encontrado',
        },
        { status: 404 }
      )
    }

    // Preparar objeto do briefing
    const briefingData = {
      id: data.id || uuidv4(),
      ...data,
      updatedAt: new Date().toISOString(),
      createdAt: project.briefing?.createdAt || new Date().toISOString(),
    }

    // Atualizar o projeto com o novo briefing
    store.updateProject(eventId, {
      briefing: briefingData,
      updatedAt: new Date().toISOString(),
    })

    // Log de auditoria
    console.log(
      `[POST /api/briefings/${eventId}] Briefing atualizado para o projeto ${eventId}`
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Briefing salvo com sucesso',
        projectId: eventId,
        briefing: briefingData,
      },
      { status: 200 }
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
 * DELETE - Remover o briefing de um evento
 */
export async function DELETE(
  req: Request,
  context: { params: { eventId: string } }
) {
  try {
    const { eventId } = context.params

    // Acessar o estado global do Zustand
    const store = useProjectsStore.getState()

    // Buscar o projeto pelo ID
    const project = store.projects.find(p => p.id === eventId)
    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Projeto não encontrado',
        },
        { status: 404 }
      )
    }

    // Verificar se o projeto tem briefing
    if (!project.briefing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Briefing não encontrado para este projeto',
        },
        { status: 404 }
      )
    }

    // Remover o briefing
    store.updateProject(eventId, {
      briefing: null,
      updatedAt: new Date().toISOString(),
    })

    // Log de auditoria
    console.log(
      `[DELETE /api/briefings/${eventId}] Briefing removido do projeto ${eventId}`
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Briefing removido com sucesso',
        projectId: eventId,
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

// Adicionando a propriedade briefing ao tipo Project
interface Project {
  id: string
  name: string
  description?: string
  clientId?: string
  eventDate?: string
  finalDueDate?: string
  createdAt: string
  updatedAt?: string
  status: 'draft' | 'in_progress' | 'review' | 'completed' | 'archived'
  videos: VideoDeliverable[]
  briefing?: {
    createdAt: string
    content: string
  } | null
}
