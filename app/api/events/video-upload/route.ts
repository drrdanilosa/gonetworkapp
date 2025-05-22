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

// Validar o formato do arquivo
function isValidVideoFile(filename: string): boolean {
  const allowedExtensions = ['.mp4', '.mov', '.avi', '.webm']
  const ext = path.extname(filename).toLowerCase()
  return allowedExtensions.includes(ext)
}

export async function POST(req: NextRequest) {
  try {
    console.log('Recebida requisição em /api/events/video-upload')

    // Extrair dados da requisição
    const data = await req.json()
    const { project, file, path: filePath, timestamp } = data

    console.log('Dados recebidos:', { project, file, filePath, timestamp })

    // Validar dados recebidos
    if (!project || !file || !filePath) {
      console.error('Dados incompletos:', { project, file, filePath })
      return NextResponse.json(
        {
          success: false,
          error: 'Dados incompletos. Necessário: project, file e path',
        },
        { status: 400 }
      )
    }

    // Validar formato do arquivo
    if (!isValidVideoFile(file)) {
      console.error('Formato de arquivo inválido:', file)
      return NextResponse.json(
        {
          success: false,
          error:
            'Formato de arquivo inválido. Apenas arquivos de vídeo são permitidos.',
        },
        { status: 400 }
      )
    }

    // Acessar o estado global do Zustand
    const store = useProjectsStore.getState()

    // Buscar o projeto pelo nome (no watcher, estamos passando o nome da pasta como project)
    const projectId = project.replace('projeto-', '')

    // Encontrar projeto pelo ID ou criar um novo se não existir
    let targetProject = store.projects.find(p => p.id === projectId)

    if (!targetProject) {
      console.log('Projeto não encontrado, criando novo projeto:', projectId)
      // Se não encontrar um projeto com o ID correspondente ao nome da pasta, cria um novo
      store.createProject({
        title: `Projeto ${projectId}`,
        name: `Projeto ${projectId}`,
        description: `Projeto criado automaticamente a partir do watcher`,
        clientId: 'client-auto',
        editorId: 'editor-auto',
        status: 'draft',
        timeline: [],
        videos: [],
        tasks: [],
      })

      // Buscar novamente o projeto recém-criado
      targetProject =
        store.projects.find(p => p.id === projectId) || store.projects[0]
    }

    // URL completa para o vídeo
    const videoUrl = filePath // O path já deve vir formatado corretamente

    // Identificar o deliverable alvo (usamos o primeiro vídeo ou criamos um novo)
    let deliverable = targetProject.videos?.[0]

    if (!deliverable) {
      deliverable = {
        id: `${targetProject.id}-vid1`,
        title: 'Vídeo Principal',
        versions: [],
        status: 'editing',
        comments: [],
      }

      // Adicionar o novo deliverable ao projeto
      targetProject.videos = [deliverable]
    }

    // Criar nova versão de vídeo
    const newVersionNumber = deliverable.versions.length + 1
    const newVersion = {
      id: `${deliverable.id}-v${newVersionNumber}`,
      name: `${file.split('.')[0] || `v${newVersionNumber}`}`,
      url: videoUrl,
      uploadedAt: new Date(),
      detectedAt: timestamp ? new Date(timestamp) : new Date(),
      status: 'pendingReview',
      metadata: {
        sourceType: 'localWatcher',
        fileName: file,
        originalPath: videoUrl,
      },
    }

    // Registrar na auditoria
    logAudit('VIDEO_DETECTED', {
      projectId: targetProject.id,
      deliverableId: deliverable.id,
      versionId: newVersion.id,
      filename: file,
      url: videoUrl,
    })

    // Adicionar a versão ao deliverable
    deliverable.versions.push(newVersion)
    deliverable.lastUpdated = new Date().toISOString()

    // Atualizar o projeto no store
    store.updateProject(targetProject.id, targetProject)

    return NextResponse.json(
      {
        success: true,
        message: 'Vídeo processado com sucesso',
        projectId: targetProject.id,
        deliverableId: deliverable.id,
        versionId: newVersion.id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao processar o vídeo:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao processar o vídeo',
      },
      { status: 500 }
    )
  }
}
