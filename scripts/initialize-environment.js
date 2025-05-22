// Script de inicialização do ambiente MelhorApp
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')

// Utilitários
const fsUtils = require('../services/filesystem-utils')
const logService = require('../services/log-service')

// Função para inicializar o ambiente
async function initializeEnvironment() {
  try {
    logService.info('Iniciando configuração do ambiente MelhorApp...', 'INIT')

    // 1. Verificar estrutura de diretórios
    logService.info('Verificando estrutura de diretórios...', 'INIT')
    const dirCheck = fsUtils.checkWatcherStructure()

    if (!dirCheck.success) {
      logService.error(
        'Problemas na estrutura de diretórios:',
        dirCheck.issues,
        'INIT'
      )
    } else {
      logService.info('Estrutura de diretórios OK', 'INIT')
    }

    // 2. Limpar logs antigos
    logService.info('Limpando logs antigos...', 'INIT')
    const cleanupResult = fsUtils.cleanupOldLogs(7) // 7 dias

    if (cleanupResult.cleaned > 0) {
      logService.info(`${cleanupResult.cleaned} logs antigos removidos`, 'INIT')
    }

    if (cleanupResult.errors > 0) {
      logService.warn(
        `${cleanupResult.errors} erros durante a limpeza de logs`,
        'INIT'
      )
    }

    // 3. Verificar espaço em disco
    fsUtils.checkDiskSpace(diskInfo => {
      if (diskInfo.error) {
        logService.warn(
          `Não foi possível verificar o espaço em disco: ${diskInfo.error}`,
          'INIT'
        )
      } else {
        const disks = diskInfo.disks || []
        if (disks.length > 0) {
          disks.forEach(disk => {
            if (disk.drive && disk.freeSpace !== undefined) {
              logService.info(
                `Disco ${disk.drive}: ${disk.freeSpace} GB livres de ${disk.totalSize} GB`,
                'INIT'
              )

              // Alertar se tiver pouco espaço
              if (disk.freeSpace < 5) {
                // Menos de 5GB
                logService.warn(
                  `Pouco espaço disponível no disco ${disk.drive}: apenas ${disk.freeSpace} GB`,
                  'INIT'
                )
              }
            } else if (disk.filesystem && disk.available) {
              logService.info(
                `${disk.filesystem}: ${disk.available} disponíveis (${disk.usePercentage} usado)`,
                'INIT'
              )

              // Alertar se o uso for alto (maior que 90%)
              if (disk.usePercentage && parseInt(disk.usePercentage) > 90) {
                logService.warn(
                  `Uso alto de disco em ${disk.filesystem}: ${disk.usePercentage}`,
                  'INIT'
                )
              }
            }
          })
        }
      }

      // 4. Iniciar watcher ou serviços necessários
      startRequiredServices()
    })
  } catch (error) {
    logService.error('Erro na inicialização do ambiente:', error, 'INIT')
  }
}

// Iniciar serviços necessários
function startRequiredServices() {
  try {
    // Verificar se o watcher já está em execução
    const watcherServicePath = path.resolve(
      __dirname,
      '../services/video-watcher-service.js'
    )
    logService.info('Iniciando o serviço de watcher...', 'INIT')

    if (fs.existsSync(watcherServicePath)) {
      const watcherProcess = spawn('node', [watcherServicePath], {
        detached: true,
        stdio: 'ignore',
      })

      watcherProcess.unref()
      logService.info('Serviço de watcher iniciado com sucesso', 'INIT')
    } else {
      logService.error('Arquivo do serviço de watcher não encontrado', 'INIT')
    }

    logService.info('Inicialização do ambiente concluída', 'INIT')
  } catch (error) {
    logService.error('Erro ao iniciar serviços necessários:', error, 'INIT')
  }
}

// Exportar a função para uso em outros scripts
module.exports = initializeEnvironment

// Se executado diretamente
if (require.main === module) {
  initializeEnvironment()
}
