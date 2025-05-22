import { NextRequest, NextResponse } from 'next/server'
import { useProjectsStore } from '@/store/useProjectsStore'
import { v4 as uuidv4 } from 'uuid'

/**
 * GET - Obter a equipe associada a um evento
 */
export async function GET(
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

    // Retornar a equipe do projeto
    return NextResponse.json(
      {
        success: true,
        projectId: eventId,
        team: project.team || [],
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao buscar equipe:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao buscar equipe',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * POST - Adicionar membros à equipe de um evento
 */
export async function POST(
  req: Request,
  context: { params: { eventId: string } }
) {
  try {
    const { eventId } = context.params
    const data = await req.json()

    // Validar os dados recebidos
    if (!Array.isArray(data.members) && !data.member) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Dados inválidos. Forneça "members" (array) ou "member" (objeto)',
        },
        { status: 400 }
      )
    }

    // Preparar membros para adicionar (seja array ou objeto único)
    const membersToAdd = Array.isArray(data.members)
      ? data.members
      : [data.member]

    // Validar cada membro
    for (const member of membersToAdd) {
      if (!member.name || !member.role) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cada membro deve ter pelo menos "name" e "role"',
          },
          { status: 400 }
        )
      }

      // Adicionar ID se não fornecido
      if (!member.id) {
        member.id = uuidv4()
      }

      // Garantir campos padrão
      member.addedAt = member.addedAt || new Date().toISOString()
      member.status = member.status || 'active'
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

    // Preparar a equipe atual (se existir) ou iniciar um array vazio
    const currentTeam = project.team || []

    // Adicionar novos membros sem duplicar (verificando por ID)
    const updatedTeam = [...currentTeam]

    membersToAdd.forEach(newMember => {
      const existingIndex = updatedTeam.findIndex(m => m.id === newMember.id)

      if (existingIndex >= 0) {
        // Atualizar membro existente
        updatedTeam[existingIndex] = {
          ...updatedTeam[existingIndex],
          ...newMember,
          updatedAt: new Date().toISOString(),
        }
      } else {
        // Adicionar novo membro
        updatedTeam.push(newMember)
      }
    })

    // Atualizar o projeto com a nova equipe
    store.updateProject(eventId, {
      team: updatedTeam,
      updatedAt: new Date().toISOString(),
    })

    // Log de auditoria
    console.log(
      `[POST /api/events/${eventId}/team] Equipe atualizada: +${membersToAdd.length} membros`
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Membros adicionados com sucesso',
        projectId: eventId,
        team: updatedTeam,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao adicionar membros:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao adicionar membros à equipe',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remover membro da equipe
 */
export async function DELETE(
  req: NextRequest,
  context: { params: { eventId: string } }
) {
  try {
    const { eventId } = context.params
    const memberId = req.nextUrl.searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID do membro não fornecido (use ?memberId=xxx)',
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

    // Verificar se a equipe existe
    if (!project.team || !Array.isArray(project.team)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Equipe não encontrada para este projeto',
        },
        { status: 404 }
      )
    }

    // Verificar se o membro existe
    const memberIndex = project.team.findIndex(m => m.id === memberId)
    if (memberIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Membro não encontrado na equipe',
        },
        { status: 404 }
      )
    }

    // Remover o membro da equipe
    const updatedTeam = [...project.team]
    updatedTeam.splice(memberIndex, 1)

    // Atualizar o projeto
    store.updateProject(eventId, {
      team: updatedTeam,
      updatedAt: new Date().toISOString(),
    })

    // Log de auditoria
    console.log(
      `[DELETE /api/events/${eventId}/team] Membro removido: ${memberId}`
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Membro removido com sucesso',
        projectId: eventId,
        team: updatedTeam,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao remover membro:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao remover membro da equipe',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Atualizar informações de um membro da equipe
 */
export async function PATCH(
  req: Request,
  context: { params: { eventId: string } }
) {
  try {
    const { eventId } = context.params
    const data = await req.json()

    if (!data.memberId || !data.updates) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos. Forneça "memberId" e "updates"',
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

    // Verificar se a equipe existe
    if (!project.team || !Array.isArray(project.team)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Equipe não encontrada para este projeto',
        },
        { status: 404 }
      )
    }

    // Encontrar o membro
    const memberIndex = project.team.findIndex(m => m.id === data.memberId)
    if (memberIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Membro não encontrado na equipe',
        },
        { status: 404 }
      )
    }

    // Atualizar o membro
    const updatedTeam = [...project.team]
    updatedTeam[memberIndex] = {
      ...updatedTeam[memberIndex],
      ...data.updates,
      updatedAt: new Date().toISOString(),
    }

    // Atualizar o projeto
    store.updateProject(eventId, {
      team: updatedTeam,
      updatedAt: new Date().toISOString(),
    })

    // Log de auditoria
    console.log(
      `[PATCH /api/events/${eventId}/team] Membro atualizado: ${data.memberId}`
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Membro atualizado com sucesso',
        projectId: eventId,
        updatedMember: updatedTeam[memberIndex],
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao atualizar membro:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao atualizar membro da equipe',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
