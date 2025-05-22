// Serviço de logs para o MelhorApp
const fs = require('fs')
const path = require('path')

// Configurações
const LOG_DIR = path.resolve(__dirname, '../logs')
const LOG_FILE = path.join(LOG_DIR, 'app.log')
const ERROR_LOG_FILE = path.join(LOG_DIR, 'error.log')
const WATCHER_LOG_FILE = path.join(LOG_DIR, 'watcher.log')
const MAX_LOG_SIZE = 5 * 1024 * 1024 // 5MB

// Cores para console
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

// Níveis de log
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
}

// Configuração atual
let currentLogLevel = LOG_LEVELS.INFO

// Configurar diretório de logs
function setupLogDirectory() {
  if (!fs.existsSync(LOG_DIR)) {
    try {
      fs.mkdirSync(LOG_DIR, { recursive: true })
      console.log(
        `${COLORS.green}✅ Diretório de logs criado: ${LOG_DIR}${COLORS.reset}`
      )
    } catch (err) {
      console.error(
        `${COLORS.red}❌ Erro ao criar diretório de logs: ${err.message}${COLORS.reset}`
      )
    }
  }
}

// Verificar tamanho do arquivo de log e rotacionar se necessário
function checkLogRotation(logFile) {
  try {
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile)
      if (stats.size > MAX_LOG_SIZE) {
        const backupFile = `${logFile}.${new Date().toISOString().replace(/:/g, '-')}.bak`
        fs.renameSync(logFile, backupFile)
        return true
      }
    }
  } catch (err) {
    console.error(
      `${COLORS.red}❌ Erro ao rotacionar logs: ${err.message}${COLORS.reset}`
    )
  }
  return false
}

// Escrever no arquivo de log
function writeToLogFile(logFile, message, level) {
  try {
    checkLogRotation(logFile)
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] [${level}] ${message}\n`
    fs.appendFileSync(logFile, logEntry)
  } catch (err) {
    console.error(
      `${COLORS.red}❌ Erro ao escrever log: ${err.message}${COLORS.reset}`
    )
  }
}

// Formatação de mensagem com timestamp
function formatLogMessage(level, message, module) {
  const timestamp = new Date().toISOString()
  const modulePrefix = module ? `[${module}] ` : ''
  return `[${timestamp}] [${level}] ${modulePrefix}${message}`
}

// API de logs
const logService = {
  // Configuração
  setLogLevel: level => {
    currentLogLevel = level
  },

  // Métodos de log
  debug: (message, module) => {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      const logMessage = formatLogMessage('DEBUG', message, module)
      console.log(`${COLORS.blue}🔍 ${logMessage}${COLORS.reset}`)
      writeToLogFile(LOG_FILE, logMessage, 'DEBUG')
    }
  },

  info: (message, module) => {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      const logMessage = formatLogMessage('INFO', message, module)
      console.log(`${COLORS.green}ℹ️ ${logMessage}${COLORS.reset}`)
      writeToLogFile(LOG_FILE, logMessage, 'INFO')
    }
  },

  warn: (message, module) => {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      const logMessage = formatLogMessage('WARN', message, module)
      console.warn(`${COLORS.yellow}⚠️ ${logMessage}${COLORS.reset}`)
      writeToLogFile(LOG_FILE, logMessage, 'WARN')
    }
  },

  error: (message, error, module) => {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      const errorDetails =
        error instanceof Error ? error.stack || error.message : error
      const logMessage = formatLogMessage(
        'ERROR',
        `${message} - ${errorDetails}`,
        module
      )
      console.error(`${COLORS.red}❌ ${logMessage}${COLORS.reset}`)
      writeToLogFile(LOG_FILE, logMessage, 'ERROR')
      writeToLogFile(ERROR_LOG_FILE, logMessage, 'ERROR')
    }
  },

  fatal: (message, error, module) => {
    if (currentLogLevel <= LOG_LEVELS.FATAL) {
      const errorDetails =
        error instanceof Error ? error.stack || error.message : error
      const logMessage = formatLogMessage(
        'FATAL',
        `${message} - ${errorDetails}`,
        module
      )
      console.error(`${COLORS.red}💀 ${logMessage}${COLORS.reset}`)
      writeToLogFile(LOG_FILE, logMessage, 'FATAL')
      writeToLogFile(ERROR_LOG_FILE, logMessage, 'FATAL')
    }
  },

  // Métodos específicos
  watcher: {
    logVideoDetected: (filePath, projectId) => {
      const logMessage = formatLogMessage(
        'INFO',
        `Vídeo detectado em ${projectId}: ${filePath}`,
        'WATCHER'
      )
      console.log(`${COLORS.cyan}📹 ${logMessage}${COLORS.reset}`)
      writeToLogFile(WATCHER_LOG_FILE, logMessage, 'INFO')
    },

    logApiCall: (data, result) => {
      const logMessage = formatLogMessage(
        'INFO',
        `API chamada com sucesso para ${data.filename}, resposta: ${JSON.stringify(result)}`,
        'WATCHER'
      )
      console.log(`${COLORS.green}✅ ${logMessage}${COLORS.reset}`)
      writeToLogFile(WATCHER_LOG_FILE, logMessage, 'INFO')
    },

    logApiError: (data, error, retryCount) => {
      const errorDetails = error instanceof Error ? error.message : error
      const logMessage = formatLogMessage(
        'ERROR',
        `Erro na API para ${data.filename} (tentativa ${retryCount}): ${errorDetails}`,
        'WATCHER'
      )
      console.error(`${COLORS.red}❌ ${logMessage}${COLORS.reset}`)
      writeToLogFile(WATCHER_LOG_FILE, logMessage, 'ERROR')
      writeToLogFile(ERROR_LOG_FILE, logMessage, 'ERROR')
    },
  },
}

// Inicializar diretório de logs
setupLogDirectory()

module.exports = logService
