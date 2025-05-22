import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { useProjectsStore } from '@/store/useProjectsStore'

export async function GET(req: NextRequest) {
  try {
    // Verificar diretórios do watcher
    const exportDir = path.resolve(process.cwd(), 'public/exports')
    const watcherPath = path.resolve(process.cwd(), 'video-watcher.js')
    const watcherServicePath = path.resolve(
      process.cwd(),
      'services/video-watcher-service.js'
    )
    const logServicePath = path.resolve(
      process.cwd(),
      'services/log-service.js'
    )

    const dirExists = fs.existsSync(exportDir)
    const watcherExists = fs.existsSync(watcherPath)
    const watcherServiceExists = fs.existsSync(watcherServicePath)
    const logServiceExists = fs.existsSync(logServicePath)

    // Verificar pastas de projetos
    const projeto1Dir = path.join(exportDir, 'projeto-1')
    const projeto2Dir = path.join(exportDir, 'projeto-2')

    const projeto1Exists = fs.existsSync(projeto1Dir)
    const projeto2Exists = fs.existsSync(projeto2Dir)

    // Verificar logs
    const logDir = path.resolve(process.cwd(), 'logs')
    const logsExist = fs.existsSync(logDir)
    let logFiles = []

    if (logsExist) {
      try {
        logFiles = fs.readdirSync(logDir)
      } catch (e) {
        console.error('Erro ao ler pasta de logs:', e)
      }
    }

    // Verificar se os projetos estão registrados no store
    const store = useProjectsStore.getState()
    const projects = store.projects || []
    const projeto1Registered = projects.some(p => p.id === 'projeto-1')
    const projeto2Registered = projects.some(p => p.id === 'projeto-2')

    // Verificar arquivos nas pastas
    let projeto1Files = []
    let projeto2Files = []

    if (projeto1Exists) {
      try {
        projeto1Files = fs
          .readdirSync(projeto1Dir)
          .filter(file => file.toLowerCase().endsWith('.mp4'))
      } catch (e) {
        console.error('Erro ao ler pasta projeto-1:', e)
      }
    }

    if (projeto2Exists) {
      try {
        projeto2Files = fs
          .readdirSync(projeto2Dir)
          .filter(file => file.toLowerCase().endsWith('.mp4'))
      } catch (e) {
        console.error('Erro ao ler pasta projeto-2:', e)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sistema de API do watcher está funcionando',
      timestamp: new Date().toISOString(),
      diagnostico: {
        diretorios: {
          exportDir: dirExists,
          projeto1Dir: projeto1Exists,
          projeto2Dir: projeto2Exists,
          watcherScript: watcherExists,
          watcherService: watcherServiceExists,
          logService: logServiceExists,
          logDir: logsExist,
        },
        projetos: {
          total: projects.length,
          projeto1Registrado: projeto1Registered,
          projeto2Registrado: projeto2Registered,
        },
        arquivos: {
          projeto1: projeto1Files,
          projeto2: projeto2Files,
          logs: logFiles,
        },
        ambiente: {
          nodeVersion: process.version,
          platform: process.platform,
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime(),
        },
      },
    })
  } catch (error) {
    console.error('Erro na verificação do watcher:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao verificar status do watcher',
        timestamp: new Date().toISOString(),
        errorDetails:
          error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
