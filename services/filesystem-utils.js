// Utilitário para verificação de sistema de arquivos
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const logService = require('./log-service')

class FileSystemUtils {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../')
    this.exportDir = path.join(this.rootDir, 'public/exports')
    this.logDir = path.join(this.rootDir, 'logs')
  }

  // Verificar se um diretório existe, criá-lo se não existir
  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true })
        logService.info(`Diretório criado: ${dir}`, 'FileSystem')
        return true
      } catch (error) {
        logService.error(`Erro ao criar diretório ${dir}:`, error, 'FileSystem')
        return false
      }
    }
    return true
  }

  // Verificar estrutura necessária para o watcher
  checkWatcherStructure() {
    const results = {
      success: true,
      exportDir: false,
      projeto1Dir: false,
      projeto2Dir: false,
      issues: [],
    }

    // Verificar diretório principal de exportações
    results.exportDir = this.ensureDirectoryExists(this.exportDir)
    if (!results.exportDir) {
      results.success = false
      results.issues.push('Diretório de exportações não pôde ser criado')
    }

    // Verificar diretórios de projetos
    const projeto1Dir = path.join(this.exportDir, 'projeto-1')
    const projeto2Dir = path.join(this.exportDir, 'projeto-2')

    results.projeto1Dir = this.ensureDirectoryExists(projeto1Dir)
    results.projeto2Dir = this.ensureDirectoryExists(projeto2Dir)

    if (!results.projeto1Dir || !results.projeto2Dir) {
      results.success = false
      results.issues.push(
        'Um ou mais diretórios de projeto não puderam ser criados'
      )
    }

    return results
  }

  // Obter informações de arquivos em um diretório
  getDirectoryContents(dir, filter = null) {
    if (!fs.existsSync(dir)) {
      return { exists: false, files: [] }
    }

    try {
      let files = fs.readdirSync(dir)

      // Aplicar filtro se fornecido
      if (filter && typeof filter === 'function') {
        files = files.filter(filter)
      }

      const fileDetails = files.map(file => {
        const filePath = path.join(dir, file)
        try {
          const stats = fs.statSync(filePath)
          return {
            name: file,
            path: filePath,
            size: stats.size,
            isDirectory: stats.isDirectory(),
            created: stats.birthtime,
            modified: stats.mtime,
          }
        } catch (error) {
          return {
            name: file,
            path: filePath,
            error: error.message,
          }
        }
      })

      return {
        exists: true,
        files: fileDetails,
      }
    } catch (error) {
      logService.error(`Erro ao ler diretório ${dir}:`, error, 'FileSystem')
      return {
        exists: true,
        error: error.message,
        files: [],
      }
    }
  }

  // Verificar espaço em disco
  checkDiskSpace(callback) {
    if (process.platform === 'win32') {
      // Comando para Windows
      exec(
        'wmic logicaldisk get deviceid,freespace,size',
        (error, stdout, stderr) => {
          if (error) {
            logService.error(
              'Erro ao verificar espaço em disco:',
              error,
              'FileSystem'
            )
            callback({ error: error.message })
            return
          }

          const lines = stdout.trim().split('\n')
          const disks = []

          // Pular a linha de cabeçalho
          for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].trim().split(/\s+/)
            if (parts.length >= 3) {
              disks.push({
                drive: parts[0],
                freeSpace: Math.round(
                  parseInt(parts[1]) / (1024 * 1024 * 1024)
                ),
                totalSize: Math.round(
                  parseInt(parts[2]) / (1024 * 1024 * 1024)
                ),
                unit: 'GB',
              })
            }
          }

          callback({ disks })
        }
      )
    } else {
      // Comando para Unix/Linux/Mac
      exec('df -h', (error, stdout, stderr) => {
        if (error) {
          logService.error(
            'Erro ao verificar espaço em disco:',
            error,
            'FileSystem'
          )
          callback({ error: error.message })
          return
        }

        const lines = stdout.trim().split('\n')
        const disks = []

        // Pular a linha de cabeçalho
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].trim().split(/\s+/)
          if (parts.length >= 6) {
            disks.push({
              filesystem: parts[0],
              size: parts[1],
              used: parts[2],
              available: parts[3],
              usePercentage: parts[4],
              mountedOn: parts[5],
            })
          }
        }

        callback({ disks })
      })
    }
  }

  // Verificar e limpar arquivos de log antigos
  cleanupOldLogs(maxAgeDays = 7) {
    if (!fs.existsSync(this.logDir)) {
      return { cleaned: 0, errors: 0 }
    }

    const now = new Date()
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000
    let cleaned = 0
    let errors = 0

    try {
      const files = fs.readdirSync(this.logDir)

      files.forEach(file => {
        if (file.endsWith('.bak') || file.includes('.log.')) {
          const filePath = path.join(this.logDir, file)

          try {
            const stats = fs.statSync(filePath)
            const fileAge = now - stats.mtime

            if (fileAge > maxAgeMs) {
              fs.unlinkSync(filePath)
              cleaned++
              logService.info(`Log antigo removido: ${file}`, 'FileSystem')
            }
          } catch (error) {
            errors++
            logService.error(
              `Erro ao processar arquivo de log ${file}:`,
              error,
              'FileSystem'
            )
          }
        }
      })

      return { cleaned, errors }
    } catch (error) {
      logService.error('Erro ao limpar logs antigos:', error, 'FileSystem')
      return { cleaned, errors: errors + 1, error: error.message }
    }
  }
}

module.exports = new FileSystemUtils()
