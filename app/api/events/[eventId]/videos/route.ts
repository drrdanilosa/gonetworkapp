// app/api/events/[eventId]/videos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { useProjectsStore } from '@/store/useProjectsStore'
import path from 'path'
import fs from 'fs'

// Função de log para auditoria
function logAudit(action: string, data: Record<string, any>) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${action}: ${JSON.stringify(data)}`
  console.log(logMessage)

  // Em um ambiente de produção, você pode adicionar logs persistentes
  try {
    const logsDir = path.join(process.cwd(), 'logs')
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }
    fs.appendFileSync(path.join(logsDir, 'video-api.log'), logMessage + '\n')
  } catch (err) {
    console.error('Erro ao escrever log:', err)
  }
}

// Enum para status do vídeo
enum VideoStatus {
  PENDENTE = 'pendente',
  AGUARDANDO_APROVACAO = 'aguardando aprovação',
  EM_ALTERACAO = 'em alteração',
  APROVADO = 'aprovado',
  ATRASADO = 'atrasado',
}

// Validar o formato do arquivo
function isValidVideoFile(filename: string): boolean {
  const allowedExtensions = ['.mp4', '.mov', '.avi', '.webm']
  const ext = path.extname(filename).toLowerCase()
  return allowedExtensions.includes(ext)
}

export async function POST(
  req: Request,
  context: { params: { eventId: string } }
) {
  try {
    const { eventId } = context.params
    console.log(
      `Recebida requisição POST para adicionar vídeo ao evento ${eventId}`
    )

    // Extrair dados da requisição
    const data = await req.json()
    const {
      fileName,
      filePath,
      status = VideoStatus.AGUARDANDO_APROVACAO,
    } = data

    console.log('Dados recebidos:', { eventId, fileName, filePath, status })

    // Validar dados recebidos
    if (!fileName || !filePath) {
      console.error('Dados incompletos:', { fileName, filePath })
      return NextResponse.json(
        {
          success: false,
          error: 'Dados incompletos. Necessário: fileName e filePath',
        },
        { status: 400 }
      )
    }

    // Validar formato do arquivo
    if (!isValidVideoFile(fileName)) {
      console.error('Formato de arquivo inválido:', fileName)
      return NextResponse.json(
        {
          success: false,
          error:
            'Formato de arquivo inválido. Apenas arquivos de vídeo são permitidos.',
        },
        { status: 400 }
      )
    }

    // Verificar se o arquivo existe no sistema de arquivos
    const fullPath = path.join(process.cwd(), 'public', filePath)
    if (!fs.existsSync(fullPath)) {
      console.error('Arquivo não encontrado:', fullPath)
      return NextResponse.json(
        {
          success: false,
          error: `Arquivo não encontrado: ${fileName}`,
        },
        { status: 404 }
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
          eventId,
        },
        { status: 404 }
      )
    }

    // URL relativa para o vídeo (acessível pelo navegador)
    const videoUrl = `/${filePath.replace(/\\/g, '/')}`

    // Identificar o deliverable alvo (usamos o primeiro vídeo ou criamos um novo)
    let deliverable = project.videos?.[0]

    if (!deliverable) {
      deliverable = {
        id: `${eventId}-vid1`,
        title: 'Vídeo Principal',
        versions: [],
        status: 'editing',
        comments: [],
      }

      // Adicionar o novo deliverable ao projeto
      project.videos = [deliverable]
    }

    // Criar nova versão de vídeo com informações mais completas
    const newVersionNumber = deliverable.versions.length + 1
    const newVersion = {
      id: `${deliverable.id}-v${newVersionNumber}`,
      name: `${fileName.split('.')[0] || `v${newVersionNumber}`}`,
      url: videoUrl,
      uploadedAt: new Date(),
      detectedAt: new Date(),
      fileSize: fs.statSync(fullPath).size,
      status,
      metadata: {
        sourceType: 'localWatcher',
        fileName,
        originalPath: filePath,
        eventId,
      },
    }

    // Registrar na auditoria
    logAudit('VIDEO_UPLOADED', {
      projectId: eventId,
      deliverableId: deliverable.id,
      versionId: newVersion.id,
      fileName,
      url: videoUrl,
    })

    // Adicionar a versão ao deliverable
    deliverable.versions.push(newVersion)
    deliverable.lastUpdated = new Date().toISOString()

    // Atualizar o projeto no store
    store.updateProject(project.id, {
      ...project,
      videos: project.videos?.length
        ? [
            ...project.videos.map(vid =>
              vid.id === deliverable.id ? deliverable : vid
            ),
          ]
        : [deliverable],
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Vídeo adicionado com sucesso ao evento',
        projectId: project.id,
        deliverableId: deliverable.id,
        versionId: newVersion.id,
        url: videoUrl,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao processar o vídeo:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao processar o vídeo',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

// GET para listar todos os vídeos de um evento
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

    // Retornar todos os vídeos do projeto
    return NextResponse.json(
      {
        success: true,
        projectId: eventId,
        videos: project.videos || [],
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao buscar vídeos',
      },
      { status: 500 }
    )
  }
}
