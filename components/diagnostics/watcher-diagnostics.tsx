'use client'

'use client'

import { useState, useEffect } from 'react'
import { useProjectsStore } from '@/store/useProjectsStore'
import DiagnosticCard from './diagnostic-card'

interface WatcherDiagnosticsProps {
  onStatusChange?: (status: 'online' | 'offline' | 'error') => void
}

interface SystemInfo {
  diretorios: Record<string, boolean>
  projetos: Record<string, any>
  arquivos: Record<string, any>
  ambiente: Record<string, any>
}

const WatcherDiagnostics = ({ onStatusChange }: WatcherDiagnosticsProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [overallStatus, setOverallStatus] = useState<
    'online' | 'offline' | 'error'
  >('offline')
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)

  const store = useProjectsStore()

  const checkWatcherStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/events/check-watcher', {
        method: 'GET',
        cache: 'no-store',
      })

      if (response.ok) {
        const data = await response.json()
        setDiagnostics(data)
        setLastChecked(new Date())

        // Armazenar informações do sistema
        if (data.diagnostico) {
          setSystemInfo(data.diagnostico)
        }

        // Determinar status geral
        if (data.success) {
          const hasRegisteredProjects =
            data.diagnostico?.projetos?.projeto1Registrado ||
            data.diagnostico?.projetos?.projeto2Registrado

          const hasDirectories =
            data.diagnostico?.diretorios?.projeto1Dir ||
            data.diagnostico?.diretorios?.projeto2Dir

          if (hasRegisteredProjects && hasDirectories) {
            setOverallStatus('online')
          } else {
            setOverallStatus('offline')
          }
        } else {
          setOverallStatus('error')
        }
      } else {
        setDiagnostics({ success: false, error: 'API indisponível' })
        setOverallStatus('error')
      }
    } catch (error) {
      console.error('Erro ao verificar status do watcher:', error)
      setDiagnostics({ success: false, error: 'Erro de conexão' })
      setOverallStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkWatcherStatus()

    // Verificar a cada 15 segundos
    const interval = setInterval(() => {
      checkWatcherStatus()
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(overallStatus)
    }
  }, [overallStatus, onStatusChange])

  if (isLoading && !diagnostics) {
    return (
      <DiagnosticCard
        title="Verificando status do watcher"
        status="loading"
        message="Aguarde enquanto verificamos o status do sistema de monitoramento de vídeos..."
      />
    )
  }

  if (!diagnostics) {
    return (
      <DiagnosticCard
        title="Erro de diagnóstico"
        status="error"
        message="Não foi possível obter informações de diagnóstico."
        onRetry={checkWatcherStatus}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Diagnóstico do Sistema</h2>
        {lastChecked && (
          <div className="text-xs text-gray-500">
            Última verificação: {lastChecked.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Status API */}
      <DiagnosticCard
        title="API de Watcher"
        status={diagnostics.success ? 'success' : 'error'}
        message={
          diagnostics.success
            ? 'API respondendo normalmente.'
            : `Erro na API: ${diagnostics.error}`
        }
        onRetry={checkWatcherStatus}
      />

      {/* Status dos Diretórios */}
      {diagnostics.success && systemInfo && (
        <DiagnosticCard
          title="Diretórios de Vídeos"
          status={
            systemInfo.diretorios.projeto1Dir &&
            systemInfo.diretorios.projeto2Dir
              ? 'success'
              : 'warning'
          }
          message={
            systemInfo.diretorios.projeto1Dir &&
            systemInfo.diretorios.projeto2Dir
              ? 'Diretórios de projetos configurados corretamente.'
              : 'Alguns diretórios estão faltando.'
          }
          details={[
            `Pasta principal: ${systemInfo.diretorios.exportDir ? 'OK' : 'Não encontrada'}`,
            `Projeto 1: ${systemInfo.diretorios.projeto1Dir ? 'OK' : 'Não encontrada'}`,
            `Projeto 2: ${systemInfo.diretorios.projeto2Dir ? 'OK' : 'Não encontrada'}`,
            `Serviço de watcher: ${systemInfo.diretorios.watcherService ? 'OK' : 'Não encontrado'}`,
            `Serviço de logs: ${systemInfo.diretorios.logService ? 'OK' : 'Não encontrado'}`,
          ]}
        />
      )}

      {/* Status dos Projetos */}
      {diagnostics.success && systemInfo && (
        <DiagnosticCard
          title="Registro de Projetos"
          status={
            systemInfo.projetos.projeto1Registrado &&
            systemInfo.projetos.projeto2Registrado
              ? 'success'
              : 'warning'
          }
          message={
            systemInfo.projetos.projeto1Registrado &&
            systemInfo.projetos.projeto2Registrado
              ? 'Projetos registrados corretamente.'
              : 'Alguns projetos não estão registrados no sistema.'
          }
          details={[
            `Total de projetos: ${systemInfo.projetos.total}`,
            `Projeto 1: ${systemInfo.projetos.projeto1Registrado ? 'Registrado' : 'Não registrado'}`,
            `Projeto 2: ${systemInfo.projetos.projeto2Registrado ? 'Registrado' : 'Não registrado'}`,
          ]}
        />
      )}

      {/* Arquivos de vídeo */}
      {diagnostics.success && systemInfo && systemInfo.arquivos && (
        <DiagnosticCard
          title="Arquivos de Vídeo"
          status={
            systemInfo.arquivos.projeto1?.length > 0 ||
            systemInfo.arquivos.projeto2?.length > 0
              ? 'success'
              : 'info'
          }
          message={
            systemInfo.arquivos.projeto1?.length > 0 ||
            systemInfo.arquivos.projeto2?.length > 0
              ? 'Arquivos de vídeo detectados.'
              : 'Nenhum arquivo de vídeo encontrado.'
          }
          details={[
            `Vídeos no Projeto 1: ${systemInfo.arquivos.projeto1?.length || 0}`,
            `Vídeos no Projeto 2: ${systemInfo.arquivos.projeto2?.length || 0}`,
          ]}
        />
      )}

      {/* Logs */}
      {diagnostics.success &&
        systemInfo &&
        systemInfo.arquivos &&
        systemInfo.arquivos.logs && (
          <DiagnosticCard
            title="Registros de Log"
            status="info"
            message={`${systemInfo.arquivos.logs.length} arquivos de log encontrados.`}
            details={systemInfo.arquivos.logs
              .slice(0, 3)
              .map(log => `Log: ${log}`)
              .concat(
                systemInfo.arquivos.logs.length > 3
                  ? [
                      `...e mais ${systemInfo.arquivos.logs.length - 3} arquivos`,
                    ]
                  : []
              )}
          />
        )}

      {/* Ambiente */}
      {diagnostics.success && systemInfo && systemInfo.ambiente && (
        <DiagnosticCard
          title="Informações do Ambiente"
          status="info"
          message="Informações do ambiente de execução."
          details={[
            `Node.js: ${systemInfo.ambiente.nodeVersion}`,
            `Plataforma: ${systemInfo.ambiente.platform}`,
            `Memória (RSS): ${Math.round(systemInfo.ambiente.memoryUsage?.rss / (1024 * 1024))} MB`,
            `Tempo ativo: ${Math.round(systemInfo.ambiente.uptime / 60)} minutos`,
          ]}
        />
      )}

      <div className="flex justify-end">
        <button
          onClick={checkWatcherStatus}
          className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
        >
          Atualizar diagnóstico
        </button>
      </div>
    </div>
  )
}

export default WatcherDiagnostics
