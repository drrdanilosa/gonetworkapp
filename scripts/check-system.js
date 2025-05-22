// scripts/video-watcher.js
const chokidar = require('chokidar')
const path = require('path')
const fs = require('fs-extra')
const axios = require('axios')

const EXPORTS_PATH = path.resolve(__dirname, '../public/exports')
const LOG_PATH = path.resolve(__dirname, '../logs')
const SERVER_ENDPOINT = 'http://localhost:3001/api/events/video-upload'

// Criar pasta de logs, se não existir
fs.ensureDirSync(LOG_PATH)

// Função de log
function log(message) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}`
  console.log(logMessage)
  fs.appendFileSync(path.join(LOG_PATH, 'video-watcher.log'), logMessage + '\n')
}

// Debounce para evitar múltiplos envios por arquivo
const debounceMap = new Map()
function shouldProcess(filePath) {
  const now = Date.now()
  if (debounceMap.has(filePath)) {
    const last = debounceMap.get(filePath)
    if (now - last < 5000) return false
  }
  debounceMap.set(filePath, now)
  return true
}

// Inicia watcher
log('🎬 Iniciando watcher para pasta de exportações...')

const watcher = chokidar.watch(`${EXPORTS_PATH}/**/*.mp4`, {
  persistent: true,
  ignoreInitial: true,
  depth: 2,
})

watcher
  .on('add', async filePath => {
    if (!shouldProcess(filePath)) return

    log(`📁 Novo vídeo detectado: ${filePath}`)

    try {
      const relativePath = path.relative(EXPORTS_PATH, filePath)
      const projectName = relativePath.split(path.sep)[0]
      const fileName = path.basename(filePath)

      // Exemplo de payload — ajuste conforme o esperado pela sua API
      const payload = {
        project: projectName,
        file: fileName,
        path: `/exports/${relativePath.replace(/\\/g, '/')}`,
        timestamp: new Date().toISOString(),
      }

      log(`📤 Enviando dados para o servidor: ${JSON.stringify(payload)}`)
      try {
        const response = await axios.post(SERVER_ENDPOINT, payload)
        log(`✅ Envio concluído: status ${response.status}`)
      } catch (err) {
        log(`❌ Erro ao enviar vídeo: ${err.message}`)
        log(
          `Detalhes do erro: ${JSON.stringify(err.response?.data || err.message)}`
        )
      }
    } catch (err) {
      log(`❌ Erro ao processar arquivo: ${err.message}`)
    }
  })
  .on('error', error => {
    log(`❌ Erro no watcher: ${error.message}`)
  })
