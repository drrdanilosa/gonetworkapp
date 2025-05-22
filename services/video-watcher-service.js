const chokidar = require('chokidar')
const path = require('path')
const axios = require('axios')
const fs = require('fs')
const { spawn } = require('child_process')
const logService = require('./log-service')

const EXPORTS_DIR = path.join(process.cwd(), 'public', 'exports')
const SERVER_API = 'http://localhost:3001/api/events/upload-from-watcher'
const RETRY_DELAY = 3000 // 3 segundos para retry
const MAX_RETRIES = 5
const ACCEPTED_VIDEO_FORMATS = ['.mp4', '.mov', '.avi', '.webm']

// Inicializa o watcher com opções de estabilidade
const watcher = chokidar.watch(EXPORTS_DIR, {
  persistent: true,
  ignoreInitial: false, // Verifica arquivos existentes
  depth: 3,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100,
  },
  ignored: /(^|[\/\\])\../, // Ignorar arquivos ocultos
})

// Função para registrar via API com retries
async function registerVideoWithAPI(data, retryCount = 0) {
  try {
    const response = await axios.post(SERVER_API, data)
    logService.watcher.logApiCall(data, response.data)
    return response.data
  } catch (err) {
    logService.watcher.logApiError(data, err, retryCount + 1)

    // Implementar retry com backoff exponencial
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount)
      logService.info(
        `Tentando novamente em ${delay / 1000} segundos...`,
        'WATCHER'
      )

      return new Promise(resolve => {
        setTimeout(() => {
          resolve(registerVideoWithAPI(data, retryCount + 1))
        }, delay)
      })
    } else {
      logService.error(
        'Máximo de tentativas atingido. Falha ao registrar o vídeo.',
        err,
        'WATCHER'
      )
      throw err
    }
  }
}

// Função para validar e processar vídeos
async function processVideoFile(filePath) {
  const fileExt = path.extname(filePath).toLowerCase()
  if (!ACCEPTED_VIDEO_FORMATS.includes(fileExt)) return

  // Verificar se o arquivo existe e está acessível
  try {
    const stats = fs.statSync(filePath)
    if (!stats.isFile() || stats.size === 0) {
      logService.warn(`Arquivo inválido ou vazio: ${filePath}`, 'WATCHER')
      return
    }
  } catch (err) {
    logService.error(`Erro ao acessar arquivo: ${filePath}`, err, 'WATCHER')
    return
  }

  // Extrair informações do caminho
  const relativePath = path.relative(EXPORTS_DIR, filePath)
  const pathParts = relativePath.split(path.sep)

  // Garantir formato correto da estrutura de pastas
  if (pathParts.length < 2) {
    logService.warn(
      'Formato de pasta inválido. Use a estrutura: exports/[eventId]/[filename].mp4',
      'WATCHER'
    )
    return
  }

  const eventFolder = pathParts[0]
  const file = pathParts[pathParts.length - 1]
  const videoPath = `/exports/${relativePath.replace(/\\/g, '/')}`

  logService.watcher.logVideoDetected(file, eventFolder)

  // Registrar o vídeo com o sistema de retry
  try {
    const result = await registerVideoWithAPI({
      eventId: eventFolder,
      filename: file,
      url: videoPath,
      detectedAt: new Date().toISOString(),
      fileSize: fs.statSync(filePath).size,
    })

    logService.info('Detalhes do registro:', 'WATCHER')
    logService.info(
      `Projeto: ${result.project || 'N/A'}, Entregável: ${result.deliverable || 'N/A'}, Versão: ${result.version?.id || 'N/A'}`,
      'WATCHER'
    )
  } catch (err) {
    // Erro já foi logado na função registerVideoWithAPI
  }
}

// Monitorar arquivos de vídeo
watcher
  .on('add', processVideoFile)
  .on('change', filePath => {
    logService.info(`Arquivo modificado: ${filePath}`, 'WATCHER')
    processVideoFile(filePath)
  })
  .on('error', error => {
    logService.error('Erro no watcher:', error, 'WATCHER')
  })
  .on('ready', () => {
    logService.info('Watcher inicializado e pronto!', 'WATCHER')
    logService.info(
      `Monitorando ${Object.keys(watcher.getWatched()).length} diretórios`,
      'WATCHER'
    )
  })

// Tratamento de erros não capturados
process.on('uncaughtException', error => {
  logService.fatal('Erro não capturado no processo:', error, 'WATCHER')
})

process.on('unhandledRejection', (reason, promise) => {
  logService.fatal('Rejeição não tratada em promise:', reason, 'WATCHER')
})

logService.info(`Monitorando ${EXPORTS_DIR} por novos vídeos...`, 'WATCHER')

// Função para iniciar o watcher como um processo independente
function startWatcher() {
  try {
    const watcherProcess = spawn('node', [__filename], {
      detached: true,
      stdio: 'ignore',
    })
    watcherProcess.unref()
    logService.info(
      'Serviço de Watcher iniciado como processo independente.',
      'WATCHER'
    )
    return true
  } catch (error) {
    logService.error(
      'Falha ao iniciar watcher como processo independente:',
      error,
      'WATCHER'
    )
    return false
  }
}

// API para diagnóstico do watcher
function getWatcherStatus() {
  return {
    running: true,
    watchedDirectories: Object.keys(watcher.getWatched()),
    timestamp: new Date().toISOString(),
  }
}

if (require.main === module) {
  startWatcher()
}

module.exports = { startWatcher, getWatcherStatus }
