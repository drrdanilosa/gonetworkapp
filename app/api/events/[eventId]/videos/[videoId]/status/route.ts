// app/api/events/[eventId]/videos/[videoId]/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { useProjectsStore } from '@/store/useProjectsStore'

// Enum para status do vídeo
enum VideoStatus {
  PENDENTE = 'pendente',
  AGUARDANDO_APROVACAO = 'aguardando aprovação',
  EM_ALTERACAO = 'em alteração',
  APROVADO = 'aprovado',
  ATRASADO = 'atrasado',
}

// Função de log para auditoria
function logAudit(action: string, data: Record<string, any>) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${action}: ${JSON.stringify(data)}`
  console.log(logMessage)
}

// PATCH para atualizar o status de um vídeo (aprovação/rejeição)
export async function PATCH(
  req: NextRequest,
  context: { params: { eventId: string; videoId: string } }
) {
  try {
    const { eventId, videoId } = context.params
    console.log(
      `Recebida requisição PATCH para alterar status do vídeo ${videoId} do evento ${eventId}`
    )

    // Extrair dados da requisição
    const data = await req.json()
    const { status, comment, reviewer } = data

    console.log('Dados recebidos:', {
      eventId,
      videoId,
      status,
      comment,
      reviewer,
    })

    // Validar dados recebidos
    if (!status) {
      console.error('Status não fornecido')
      return NextResponse.json(
        {
          success: false,
          error: 'Status não fornecido',
        },
        { status: 400 }
      )
    }

    // Validar status permitidos
    const allowedStatus = ['aprovado', 'em alteração', 'aguardando aprovação']
    if (!allowedStatus.includes(status)) {
      console.error('Status inválido:', status)
      return NextResponse.json(
        {
          success: false,
          error: `Status inválido. Permitidos: ${allowedStatus.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Acessar o estado global do Zustand
    const store = useProjectsStore.getState()

    // Buscar o projeto pelo ID
    const project = store.projects.find(p => p.id === eventId)
    if (!project) {
      console.error('Projeto não encontrado:', eventId)
      return NextResponse.json(
        {
          success: false,
          error: 'Projeto não encontrado',
        },
        { status: 404 }
      )
    }

    // Encontrar o deliverable que contém o vídeo
    let targetDeliverable = null
    let targetVersion = null

    // Procurar em todos os deliverables/vídeos
    if (project.videos) {
      for (const deliverable of project.videos) {
        // Verificar se o deliverable tem o ID do vídeo diretamente
        if (deliverable.id === videoId) {
          targetDeliverable = deliverable
          break
        }

        // Verificar nas versões do deliverable
        if (deliverable.versions) {
          const version = deliverable.versions.find(v => v.id === videoId)
          if (version) {
            targetDeliverable = deliverable
            targetVersion = version
            break
          }
        }
      }
    }

    // Se não encontrar o vídeo
    if (!targetDeliverable) {
      console.error('Vídeo não encontrado:', videoId)
      return NextResponse.json(
        {
          success: false,
          error: 'Vídeo não encontrado',
        },
        { status: 404 }
      )
    }

    // Registrar na auditoria
    logAudit('VIDEO_STATUS_UPDATED', {
      projectId: eventId,
      deliverableId: targetDeliverable.id,
      versionId: targetVersion ? targetVersion.id : null,
      fromStatus: targetVersion
        ? targetVersion.status
        : targetDeliverable.status,
      toStatus: status,
      reviewer,
      comment,
    })

    // Atualizar o status do vídeo
    if (targetVersion) {
      // Atualizar versão específica
      targetVersion.status = status

      // Adicionar comentário se fornecido
      if (comment) {
        if (!targetDeliverable.comments) {
          targetDeliverable.comments = []
        }

        targetDeliverable.comments.push({
          id: `comment-${Date.now()}`,
          content: comment,
          author: reviewer || 'Sistema',
          createdAt: new Date().toISOString(),
          versionId: targetVersion.id,
        })
      }
    } else {
      // Atualizar deliverable inteiro
      targetDeliverable.status = status

      // Adicionar comentário se fornecido
      if (comment) {
        if (!targetDeliverable.comments) {
          targetDeliverable.comments = []
        }

        targetDeliverable.comments.push({
          id: `comment-${Date.now()}`,
          content: comment,
          author: reviewer || 'Sistema',
          createdAt: new Date().toISOString(),
        })
      }
    }

    // Atualizar timestamp
    targetDeliverable.lastUpdated = new Date().toISOString()

    // Atualizar o projeto no store
    store.updateProject(project.id, {
      ...project,
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: `Status do vídeo atualizado para ${status}`,
      projectId: eventId,
      deliverableId: targetDeliverable.id,
      versionId: targetVersion ? targetVersion.id : null,
      status,
    })
  } catch (error) {
    console.error('Erro ao atualizar status do vídeo:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao atualizar status do vídeo',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

// GET para obter o status atual do vídeo
export async function GET(
  req: NextRequest,
  context: { params: { eventId: string; videoId: string } }
) {
  try {
    const { eventId, videoId } = context.params

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

    // Encontrar o deliverable que contém o vídeo
    let targetDeliverable = null
    let targetVersion = null

    // Procurar em todos os deliverables/vídeos
    if (project.videos) {
      for (const deliverable of project.videos) {
        // Verificar se o deliverable tem o ID do vídeo diretamente
        if (deliverable.id === videoId) {
          targetDeliverable = deliverable
          break
        }

        // Verificar nas versões do deliverable
        if (deliverable.versions) {
          const version = deliverable.versions.find(v => v.id === videoId)
          if (version) {
            targetDeliverable = deliverable
            targetVersion = version
            break
          }
        }
      }
    }

    // Se não encontrar o vídeo
    if (!targetDeliverable) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vídeo não encontrado',
        },
        { status: 404 }
      )
    }

    // Retornar informações de status
    return NextResponse.json({
      success: true,
      projectId: eventId,
      deliverableId: targetDeliverable.id,
      versionId: targetVersion ? targetVersion.id : null,
      status: targetVersion ? targetVersion.status : targetDeliverable.status,
      lastUpdated: targetDeliverable.lastUpdated,
      comments: targetDeliverable.comments || [],
    })
  } catch (error) {
    console.error('Erro ao buscar status do vídeo:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao buscar status do vídeo',
      },
      { status: 500 }
    )
  }
}
