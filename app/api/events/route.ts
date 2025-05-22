// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { useProjectsStore } from '@/store/useProjectsStore'
import { v4 as uuidv4 } from 'uuid'

/**
 * Handler GET para listar todos os eventos
 */
export async function GET(req: NextRequest) {
  try {
    // Parâmetros de filtro da URL
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status')
    const client = searchParams.get('client')
    const sort = searchParams.get('sort') || 'desc' // default: mais recente primeiro

    // Acessar o estado global através do Zustand
    const store = useProjectsStore.getState()
    let projects = [...store.projects]

    // Aplicar filtros se necessário
    if (status) {
      projects = projects.filter(p => p.status === status)
    }

    if (client) {
      projects = projects.filter(p =>
        p.client?.toLowerCase().includes(client.toLowerCase())
      )
    }

    // Aplicar ordenação
    projects.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0).getTime()
      const dateB = new Date(b.createdAt || b.date || 0).getTime()
      return sort === 'desc' ? dateB - dateA : dateA - dateB
    })

    // Log de auditoria
    console.log(`[GET /api/events] Listando ${projects.length} eventos`)

    return NextResponse.json({
      success: true,
      count: projects.length,
      events: projects.map(p => ({
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
      })),
    })
  } catch (error) {
    console.error('Erro ao listar eventos:', error)
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

/**
 * Handler POST para criar um novo evento/projeto
 */
export async function POST(req: Request) {
  try {
    // Extrair dados da requisição
    const data = await req.json()
    const { title, client, date, team, briefing } = data

    // Validar campos obrigatórios
    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error: 'O título do evento é obrigatório',
        },
        { status: 400 }
      )
    }

    // Criar um novo ID único
    const newId = data.id || uuidv4()

    // Preparar objeto do novo projeto com dados default
    const newProject = {
      id: newId,
      title,
      client: client || 'Cliente não especificado',
      date: date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      team: team || [],
      briefing: briefing || null,
      videos: [],
      assets: [],
      tasks: [],
      deadline: data.deadline || null,
      thumbnail: data.thumbnail || '/placeholder-event.jpg',
      // Dados opcionais se fornecidos
      description: data.description || '',
      tags: data.tags || [],
      deliverySettings: data.deliverySettings || {
        allowRevisions: true,
        maxRevisions: 3,
        autoApprove: false,
        notifyOnUpload: true,
      },
    }

    // Acessar o store e adicionar o novo projeto
    const store = useProjectsStore.getState()
    store.addProject(newProject)

    // Log de auditoria
    console.log(`[POST /api/events] Novo evento criado: ${newId} - ${title}`)

    return NextResponse.json(
      {
        success: true,
        message: 'Evento criado com sucesso',
        event: newProject,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar evento:', error)
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
