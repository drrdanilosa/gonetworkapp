import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { sanitizeObject, normalizeId } from '@/utils/sanitize'
import { acquireLock, releaseLock } from '@/utils/file-lock'

const EVENTS_FILE = path.join(process.cwd(), 'data', 'events.json')
const BRIEFINGS_FILE = path.join(process.cwd(), 'data', 'briefings.json')
const TIMELINES_FILE = path.join(process.cwd(), 'data', 'timelines.json')

// Função auxiliar para ler dados de eventos
async function readEventsData() {
  try {
    const dir = path.dirname(EVENTS_FILE)
    await fs.mkdir(dir, { recursive: true })

    try {
      const data = await fs.readFile(EVENTS_FILE, 'utf-8')
      const events = JSON.parse(data)
      return Array.isArray(events) ? events : []
    } catch (error) {
      // Se o arquivo não existir, retorna array vazio
      return []
    }
  } catch (error) {
    console.error('Erro ao ler dados de eventos:', error)
    return []
  }
}

// Função auxiliar para ler dados de briefing
async function readBriefingData() {
  try {
    const dir = path.dirname(BRIEFINGS_FILE)
    await fs.mkdir(dir, { recursive: true })

    try {
      const data = await fs.readFile(BRIEFINGS_FILE, 'utf-8')
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

// Função auxiliar para ler dados de timelines
async function readTimelineData() {
  try {
    const dir = path.dirname(TIMELINES_FILE)
    await fs.mkdir(dir, { recursive: true })

    try {
      const data = await fs.readFile(TIMELINES_FILE, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      // Se o arquivo não existir, retorna objeto vazio
      return {}
    }
  } catch (error) {
    console.error('Erro ao ler dados de timeline:', error)
    return {}
  }
}

// Função auxiliar para salvar dados de timeline
async function saveTimelineData(data: Record<string, any>) {
  const dir = path.dirname(TIMELINES_FILE)
  await fs.mkdir(dir, { recursive: true })
  // Usar lock para concorrência
  const locked = await acquireLock(TIMELINES_FILE)
  if (!locked)
    throw new Error('Timeout ao adquirir lock do arquivo de timeline')
  try {
    await fs.writeFile(TIMELINES_FILE, JSON.stringify(data, null, 2))
  } finally {
    await releaseLock(TIMELINES_FILE)
  }
}

// Função para validar se o evento existe
async function validateEventExists(eventId: string): Promise<boolean> {
  try {
    const events = await readEventsData()
    return events.some((event: any) => event.id === eventId)
  } catch (error) {
    console.error('Erro ao validar evento:', error)
    return false
  }
}

/**
 * Valida os dados da timeline
 * @param data Dados da timeline
 * @returns Array de erros ou array vazio se validação passar
 */
function validateTimelineData(data: any[]): string[] {
  const errors: string[] = []

  if (!Array.isArray(data)) {
    return ['Os dados da timeline devem ser um array']
  }

  data.forEach((phase, index) => {
    if (!phase.id) {
      errors.push(`Fase #${index + 1}: ID é obrigatório`)
    }

    if (!phase.name) {
      errors.push(`Fase #${index + 1}: Nome é obrigatório`)
    }

    if (!phase.startDate) {
      errors.push(`Fase #${index + 1}: Data de início é obrigatória`)
    }

    if (!phase.endDate) {
      errors.push(`Fase #${index + 1}: Data de término é obrigatória`)
    }

    if (phase.tasks && Array.isArray(phase.tasks)) {
      phase.tasks.forEach((task: any, taskIndex: number) => {
        if (!task.id) {
          errors.push(
            `Fase #${index + 1}, Tarefa #${taskIndex + 1}: ID é obrigatório`
          )
        }

        if (!task.name) {
          errors.push(
            `Fase #${index + 1}, Tarefa #${taskIndex + 1}: Nome é obrigatório`
          )
        }

        if (!task.dueDate) {
          errors.push(
            `Fase #${index + 1}, Tarefa #${taskIndex + 1}: Data de vencimento é obrigatória`
          )
        }
      })
    }
  })

  return errors
}

/**
 * Gera automaticamente uma timeline baseada no briefing
 */
function generateTimelineFromBriefing(briefing: any, event: any): any[] {
  if (!briefing || !event) {
    return []
  }

  const eventDate = briefing.eventDate || event.date || new Date().toISOString()
  const timeline = []
  const eventDateObj = new Date(eventDate)

  // 1. Fase de Pré-produção (30 dias antes do evento)
  const preProductionDate = new Date(eventDateObj)
  preProductionDate.setDate(eventDateObj.getDate() - 30)

  timeline.push({
    id: uuidv4(),
    name: 'Pré-produção',
    description: 'Fase de planejamento e preparação',
    startDate: preProductionDate.toISOString(),
    endDate: new Date(
      preProductionDate.getTime() + 15 * 24 * 60 * 60 * 1000
    ).toISOString(),
    status: 'pending',
    type: 'planning',
    tasks: [
      {
        id: uuidv4(),
        name: 'Reunião inicial',
        description: 'Alinhamento de expectativas',
        status: 'pending',
        dueDate: new Date(
          preProductionDate.getTime() + 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: uuidv4(),
        name: 'Elaboração de roteiro',
        description: 'Desenvolvimento do conteúdo base',
        status: 'pending',
        dueDate: new Date(
          preProductionDate.getTime() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ],
  })

  // 2. Fase de Produção (15 dias antes do evento)
  const productionDate = new Date(eventDateObj)
  productionDate.setDate(eventDateObj.getDate() - 15)

  timeline.push({
    id: uuidv4(),
    name: 'Produção',
    description: 'Fase de captação e criação de conteúdo',
    startDate: productionDate.toISOString(),
    endDate: new Date(
      productionDate.getTime() + 10 * 24 * 60 * 60 * 1000
    ).toISOString(),
    status: 'pending',
    type: 'production',
    tasks: [
      {
        id: uuidv4(),
        name: 'Captação de vídeo',
        description: 'Filmagem do conteúdo',
        status: 'pending',
        dueDate: new Date(
          productionDate.getTime() + 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: uuidv4(),
        name: 'Backup de material',
        description: 'Organização e backup de todo o material',
        status: 'pending',
        dueDate: new Date(
          productionDate.getTime() + 4 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ],
  })

  // 3. Fase de Pós-produção (5 dias antes do evento)
  const postProductionDate = new Date(eventDateObj)
  postProductionDate.setDate(eventDateObj.getDate() - 5)

  timeline.push({
    id: uuidv4(),
    name: 'Pós-produção',
    description: 'Fase de edição e finalização',
    startDate: postProductionDate.toISOString(),
    endDate: new Date(
      postProductionDate.getTime() + 3 * 24 * 60 * 60 * 1000
    ).toISOString(),
    status: 'pending',
    type: 'post-production',
    tasks: [
      {
        id: uuidv4(),
        name: 'Edição preliminar',
        description: 'Primeiro corte do vídeo',
        status: 'pending',
        dueDate: new Date(
          postProductionDate.getTime() + 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: uuidv4(),
        name: 'Revisão e aprovação',
        description: 'Revisão pelo cliente',
        status: 'pending',
        dueDate: new Date(
          postProductionDate.getTime() + 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: uuidv4(),
        name: 'Finalização',
        description: 'Ajustes finais e entrega',
        status: 'pending',
        dueDate: new Date(
          postProductionDate.getTime() + 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ],
  })

  // 4. Fase de Entrega (dia do evento)
  timeline.push({
    id: uuidv4(),
    name: 'Entrega',
    description: 'Entrega final do material',
    startDate: eventDateObj.toISOString(),
    endDate: eventDateObj.toISOString(),
    status: 'pending',
    type: 'delivery',
    tasks: [
      {
        id: uuidv4(),
        name: 'Entrega do material final',
        description: 'Envio de todos os arquivos ao cliente',
        status: 'pending',
        dueDate: eventDateObj.toISOString(),
      },
    ],
  })

  return timeline
}

/**
 * GET - Obter timeline de um evento
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const sanitizedEventId = normalizeId(eventId)

    if (!sanitizedEventId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID do evento é obrigatório',
        },
        { status: 400 }
      )
    }

    // Validar se o evento existe
    const eventExists = await validateEventExists(sanitizedEventId)
    if (!eventExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Evento não encontrado',
          eventId: sanitizedEventId,
        },
        { status: 404 }
      )
    }

    // Buscar timeline existente
    const timelineData = await readTimelineData()
    const timeline = timelineData[sanitizedEventId]

    // Se a timeline não existir, gera uma nova baseada no briefing
    if (!timeline) {
      // Obter dados do evento
      const events = await readEventsData()
      const event = events.find((e: any) => e.id === sanitizedEventId)

      // Obter dados do briefing
      const briefingData = await readBriefingData()
      const briefing = briefingData[sanitizedEventId]

      // Gerar timeline baseada nos dados
      const generatedTimeline = generateTimelineFromBriefing(briefing, event)

      return NextResponse.json(
        {
          success: true,
          message: 'Timeline gerada automaticamente',
          timeline: generatedTimeline,
          isGenerated: true,
        },
        { status: 200 }
      )
    }

    console.log(`[GET /api/timeline/${sanitizedEventId}] Timeline encontrada`)
    return NextResponse.json(
      {
        success: true,
        timeline,
        isGenerated: false,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao buscar timeline:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar requisição',
        details: error instanceof Error ? error.message : String(error),
        timeline: [],
      },
      { status: 500 }
    )
  }
}

/**
 * POST - Criar ou atualizar timeline
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const sanitizedEventId = normalizeId(eventId)
    const requestData = await request.json()
    const data = sanitizeObject(requestData)

    if (!sanitizedEventId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID do evento é obrigatório',
        },
        { status: 400 }
      )
    }

    // Validar se o evento existe
    const eventExists = await validateEventExists(sanitizedEventId)
    if (!eventExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Evento não encontrado',
          eventId: sanitizedEventId,
        },
        { status: 404 }
      )
    }

    // Gerar timeline automaticamente se solicitado ou baseada em briefing
    if (data.generateAuto === true || data.generateFromBriefing === true) {
      // Obter dados do evento
      const events = await readEventsData()
      const event = events.find((e: any) => e.id === sanitizedEventId)

      // Obter dados do briefing
      const briefingData = await readBriefingData()
      let briefing = briefingData[sanitizedEventId]

      // Se briefingData foi enviado na requisição, usar esses dados
      if (data.briefingData) {
        briefing = data.briefingData
      }

      // Gerar timeline baseada nos dados
      const generatedTimeline = generateTimelineFromBriefing(briefing, event)

      // Salvar a timeline gerada
      const timelineData = await readTimelineData()
      timelineData[sanitizedEventId] = generatedTimeline
      await saveTimelineData(timelineData)

      return NextResponse.json(
        {
          success: true,
          message:
            'Timeline gerada e salva automaticamente a partir do briefing',
          timeline: generatedTimeline,
        },
        { status: 201 }
      )
    }

    // Validar dados mínimos para timeline manual
    if (!data.timeline || !Array.isArray(data.timeline)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados de timeline inválidos ou não fornecidos',
        },
        { status: 400 }
      )
    }

    // Validar a estrutura dos dados
    const validationErrors = validateTimelineData(data.timeline)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados de timeline inválidos',
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    // Ler dados existentes
    const timelineData = await readTimelineData()
    const existingTimeline = timelineData[sanitizedEventId]

    // Salvar timeline atualizada
    timelineData[sanitizedEventId] = data.timeline
    await saveTimelineData(timelineData)

    console.log(
      `[POST /api/timeline/${sanitizedEventId}] Timeline ${existingTimeline ? 'atualizada' : 'criada'}`
    )

    return NextResponse.json(
      {
        success: true,
        message: `Timeline ${existingTimeline ? 'atualizada' : 'criada'} com sucesso`,
        eventId: sanitizedEventId,
        timeline: data.timeline,
      },
      { status: existingTimeline ? 200 : 201 }
    )
  } catch (error) {
    console.error('Erro ao salvar timeline:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao salvar timeline',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Atualizar parcialmente uma timeline
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const sanitizedEventId = normalizeId(eventId)
    const requestData = await request.json()
    const data = sanitizeObject(requestData)

    if (!sanitizedEventId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID do evento é obrigatório',
        },
        { status: 400 }
      )
    }

    // Validar se o evento existe
    const eventExists = await validateEventExists(sanitizedEventId)
    if (!eventExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Evento não encontrado',
          eventId: sanitizedEventId,
        },
        { status: 404 }
      )
    }

    // Ler dados existentes
    const timelineData = await readTimelineData()
    const existingTimeline = timelineData[sanitizedEventId]

    // Verificar se a timeline existe
    if (!existingTimeline) {
      return NextResponse.json(
        {
          success: false,
          error: 'Timeline não encontrada para este evento',
          eventId: sanitizedEventId,
        },
        { status: 404 }
      )
    }

    // Realizar a atualização parcial da timeline
    if (data.updateType === 'phase' && data.phaseId && data.phaseData) {
      // Atualização de uma fase específica
      const phaseIndex = existingTimeline.findIndex(
        (p: any) => p.id === data.phaseId
      )
      if (phaseIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Fase não encontrada',
            phaseId: data.phaseId,
          },
          { status: 404 }
        )
      }

      // Mesclar dados da fase
      existingTimeline[phaseIndex] = {
        ...existingTimeline[phaseIndex],
        ...data.phaseData,
      }
    } else if (
      data.updateType === 'task' &&
      data.phaseId &&
      data.taskId &&
      data.taskData
    ) {
      // Atualização de uma tarefa específica
      const phaseIndex = existingTimeline.findIndex(
        (p: any) => p.id === data.phaseId
      )
      if (phaseIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Fase não encontrada',
            phaseId: data.phaseId,
          },
          { status: 404 }
        )
      }

      const phase = existingTimeline[phaseIndex]
      if (!phase.tasks || !Array.isArray(phase.tasks)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Esta fase não contém tarefas',
            phaseId: data.phaseId,
          },
          { status: 400 }
        )
      }

      const taskIndex = phase.tasks.findIndex((t: any) => t.id === data.taskId)
      if (taskIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Tarefa não encontrada',
            taskId: data.taskId,
          },
          { status: 404 }
        )
      }

      // Mesclar dados da tarefa
      phase.tasks[taskIndex] = {
        ...phase.tasks[taskIndex],
        ...data.taskData,
      }
    } else if (data.updateType === 'addTask' && data.phaseId && data.taskData) {
      // Adicionar uma nova tarefa a uma fase
      const phaseIndex = existingTimeline.findIndex(
        (p: any) => p.id === data.phaseId
      )
      if (phaseIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Fase não encontrada',
            phaseId: data.phaseId,
          },
          { status: 404 }
        )
      }

      const phase = existingTimeline[phaseIndex]
      if (!phase.tasks) {
        phase.tasks = []
      }

      // Garantir que a tarefa tenha um ID único
      const newTask = {
        id: data.taskData.id || uuidv4(),
        ...data.taskData,
      }

      phase.tasks.push(newTask)
    } else if (data.updateType === 'addPhase' && data.phaseData) {
      // Adicionar uma nova fase à timeline
      const newPhase = {
        id: data.phaseData.id || uuidv4(),
        ...data.phaseData,
      }

      existingTimeline.push(newPhase)
    } else if (data.updateType === 'removePhase' && data.phaseId) {
      // Remover uma fase da timeline
      const phaseIndex = existingTimeline.findIndex(
        (p: any) => p.id === data.phaseId
      )
      if (phaseIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Fase não encontrada',
            phaseId: data.phaseId,
          },
          { status: 404 }
        )
      }

      existingTimeline.splice(phaseIndex, 1)
    } else if (
      data.updateType === 'removeTask' &&
      data.phaseId &&
      data.taskId
    ) {
      // Remover uma tarefa de uma fase
      const phaseIndex = existingTimeline.findIndex(
        (p: any) => p.id === data.phaseId
      )
      if (phaseIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Fase não encontrada',
            phaseId: data.phaseId,
          },
          { status: 404 }
        )
      }

      const phase = existingTimeline[phaseIndex]
      if (!phase.tasks || !Array.isArray(phase.tasks)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Esta fase não contém tarefas',
            phaseId: data.phaseId,
          },
          { status: 400 }
        )
      }

      const taskIndex = phase.tasks.findIndex((t: any) => t.id === data.taskId)
      if (taskIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Tarefa não encontrada',
            taskId: data.taskId,
          },
          { status: 404 }
        )
      }

      phase.tasks.splice(taskIndex, 1)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Tipo de atualização inválido ou dados incompletos',
          updateType: data.updateType,
        },
        { status: 400 }
      )
    }

    // Salvar timeline atualizada
    timelineData[sanitizedEventId] = existingTimeline
    await saveTimelineData(timelineData)

    return NextResponse.json(
      {
        success: true,
        message: 'Timeline atualizada com sucesso',
        eventId: sanitizedEventId,
        timeline: existingTimeline,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao atualizar timeline:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao atualizar timeline',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
