import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { useProjectsStore } from '@/store/useProjectsStore'
import { sanitizeInput, sanitizeObject } from '@/utils/sanitize'

// Usar a abordagem com Store para manter consistência com o resto da aplicação
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    
    if (!eventId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'ID do evento é obrigatório' 
        },
        { status: 400 }
      )
    }
    
    // Buscar o evento no estado global através do Zustand
    const store = useProjectsStore.getState()
    const project = store.projects.find(p => p.id === eventId)
    
    if (!project) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Evento não encontrado',
          eventId 
        },
        { status: 404 }
      )
    }
    
    console.log(`[GET /api/events/${eventId}] Evento encontrado`)
    return NextResponse.json(
      { 
        success: true,
        event: project
      }, 
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao buscar evento:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao processar requisição',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Atualizar parcialmente um evento
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
        { 
          success: false,
          error: 'ID do evento é obrigatório' 
        },
        { status: 400 }
      )
    }
    
    // Validar dados
    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Nenhum dado fornecido para atualização' 
        },
        { status: 400 }
      )
    }
    
    // Sanitizar dados
    const sanitizedUpdates = sanitizeObject(updates)
    
    // Obter o estado atual do store
    const store = useProjectsStore.getState()
    const projectIndex = store.projects.findIndex(p => p.id === eventId)
    
    if (projectIndex === -1) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Evento não encontrado',
          eventId 
        },
        { status: 404 }
      )
    }
    
    // Atualizar o projeto
    const updatedProject = {
      ...store.projects[projectIndex],
      ...sanitizedUpdates,
      id: eventId, // Garantir que o ID não mude
      updatedAt: new Date().toISOString()
    }
    
    // Atualizar o estado global
    store.updateProject(updatedProject)
    
    console.log(`[PATCH /api/events/${eventId}] Evento atualizado parcialmente`)
    return NextResponse.json(
      { 
        success: true,
        message: 'Evento atualizado parcialmente com sucesso',
        event: updatedProject,
        updatedFields: Object.keys(updates)
      }, 
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao atualizar evento parcialmente:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao processar requisição',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remover um evento
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    
    if (!eventId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'ID do evento é obrigatório' 
        },
        { status: 400 }
      )
    }
    
    // Obter o estado atual do store
    const store = useProjectsStore.getState()
    const projectIndex = store.projects.findIndex(p => p.id === eventId)
    
    if (projectIndex === -1) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Evento não encontrado',
          eventId 
        },
        { status: 404 }
      )
    }
    
    // Guardar o evento que será removido
    const deletedEvent = store.projects[projectIndex]
    
    // Remover o evento
    store.deleteProject(eventId)
    
    console.log(`[DELETE /api/events/${eventId}] Evento removido`)
    return NextResponse.json(
      { 
        success: true,
        message: 'Evento removido com sucesso',
        eventId,
        deletedEvent: {
          id: deletedEvent.id,
          name: deletedEvent.title || deletedEvent.name,
          createdAt: deletedEvent.createdAt,
          updatedAt: deletedEvent.updatedAt
        }
      }, 
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao remover evento:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao processar requisição',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
