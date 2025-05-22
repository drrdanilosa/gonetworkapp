'use client'

'use client'

"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import initTestProjects from '@/scripts/init-test-projects'
import { useProjectsStoreUnified } from '@/store/useProjectsStoreUnified'

export default function TestProjectsInitPage() {
  const [initialized, setInitialized] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [watcherStatus, setWatcherStatus] = useState('Verificando...')
  const [apiStatus, setApiStatus] = useState<any>(null)
  const [directoryStatus, setDirectoryStatus] = useState<{
    [key: string]: boolean
  }>({})
  const router = useRouter()
  const projectsStore = useProjectsStoreUnified()
  useEffect(() => {
    // Executa apenas uma vez ao montar o componente
    const initialize = async () => {
      try {
        // Inicializa os projetos de teste
        const success = initTestProjects()
        setInitialized(success)
        // Obtém a lista atualizada de projetos
        const storeState = useProjectsStoreUnified.getState()
        setProjects(storeState.projects || [])

        // Verifica status do watcher fazendo uma requisição de teste
        try {
          const response = await fetch('/api/events/check-watcher', {
            method: 'GET',
            cache: 'no-store',
          })

          if (response.ok) {
            const data = await response.json()
            setApiStatus(data)
            setWatcherStatus(data.success ? 'Online' : 'Offline')

            // Atualiza o status dos diretórios
            if (data.diagnostico && data.diagnostico.diretorios) {
              setDirectoryStatus(data.diagnostico.diretorios)
            }
          } else {
            setWatcherStatus('API indisponível')
          }
        } catch (error) {
          console.error('Erro ao verificar status do watcher:', error)
          setWatcherStatus('Erro de conexão')
        }
      } catch (error) {
        console.error('Erro ao inicializar projetos:', error)
      }
    }

    initialize()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Inicialização de Projetos de Teste
      </h1>
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
        <p className="font-bold">
          Status:{' '}
          {initialized
            ? 'Projetos inicializados com sucesso!'
            : 'Inicializando...'}
        </p>
        <p className="text-sm mt-1">
          Esta página cria os projetos de teste necessários para o funcionamento
          do watcher de vídeos.
        </p>
      </div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Projetos Disponíveis</h2>
        {projects.length === 0 ? (
          <p className="text-gray-500">Nenhum projeto encontrado.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map(project => (
              <li key={project.id} className="border-b pb-2">
                <div className="font-medium">{project.title}</div>
                <div className="text-sm text-gray-600">ID: {project.id}</div>
                <div className="text-sm text-gray-600">
                  {project.description}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>{' '}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Status do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <span
                className={`inline-block w-3 h-3 rounded-full mr-2 ${watcherStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}
              ></span>
              Watcher de Vídeos
            </h3>
            <p className="text-sm text-gray-600">Status: {watcherStatus}</p>
            {apiStatus && (
              <div className="mt-2 text-xs text-gray-500">
                <p>
                  Última verificação:{' '}
                  {new Date(apiStatus.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <div className="border rounded p-4">
            <h3 className="font-medium mb-2">Diretórios de Vídeo</h3>
            <ul className="text-sm space-y-1">
              <li className="flex items-center">
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${directoryStatus.projeto1Dir ? 'bg-green-500' : 'bg-red-500'}`}
                ></span>
                <code>public/exports/projeto-1</code>
                {directoryStatus.projeto1Dir &&
                  apiStatus?.diagnostico?.projetos?.projeto1Registrado && (
                    <span className="ml-2 text-xs text-green-500">
                      (Registrado)
                    </span>
                  )}
              </li>
              <li className="flex items-center">
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${directoryStatus.projeto2Dir ? 'bg-green-500' : 'bg-red-500'}`}
                ></span>
                <code>public/exports/projeto-2</code>
                {directoryStatus.projeto2Dir &&
                  apiStatus?.diagnostico?.projetos?.projeto2Registrado && (
                    <span className="ml-2 text-xs text-green-500">
                      (Registrado)
                    </span>
                  )}
              </li>
            </ul>
            <div className="mt-2">
              <button
                onClick={() =>
                  window.open('/api/events/check-watcher', '_blank')
                }
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                Verificar detalhes técnicos
              </button>
            </div>
          </div>
        </div>

        {apiStatus?.diagnostico?.arquivos && (
          <div className="mt-4 border rounded p-4">
            <h3 className="font-medium mb-2">Arquivos Detectados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium">Projeto 1:</h4>
                {apiStatus.diagnostico.arquivos.projeto1?.length > 0 ? (
                  <ul className="text-xs text-gray-600 list-disc pl-5">
                    {apiStatus.diagnostico.arquivos.projeto1.map(
                      (file: string, index: number) => (
                        <li key={index}>{file}</li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">
                    Nenhum arquivo encontrado
                  </p>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium">Projeto 2:</h4>
                {apiStatus.diagnostico.arquivos.projeto2?.length > 0 ? (
                  <ul className="text-xs text-gray-600 list-disc pl-5">
                    {apiStatus.diagnostico.arquivos.projeto2.map(
                      (file: string, index: number) => (
                        <li key={index}>{file}</li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">
                    Nenhum arquivo encontrado
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>{' '}
      <div className="flex space-x-4">
        <button
          onClick={() => router.push('/')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Voltar para a página inicial
        </button>
        <button
          onClick={async () => {
            const success = initTestProjects()
            setInitialized(success)
            const updatedProjects =
              useProjectsStoreUnified.getState().projects || []
            setProjects(updatedProjects)

            // Atualiza o status após a inicialização
            try {
              const response = await fetch('/api/events/check-watcher', {
                method: 'GET',
                cache: 'no-store',
              })

              if (response.ok) {
                const data = await response.json()
                setApiStatus(data)
                setWatcherStatus(data.success ? 'Online' : 'Offline')

                // Atualiza o status dos diretórios
                if (data.diagnostico && data.diagnostico.diretorios) {
                  setDirectoryStatus(data.diagnostico.diretorios)
                }
              }
            } catch (error) {
              console.error('Erro ao atualizar status:', error)
            }
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Reinicializar projetos
        </button>
        <button
          onClick={async () => {
            try {
              const response = await fetch('/api/events/check-watcher', {
                method: 'GET',
                cache: 'no-store',
              })

              if (response.ok) {
                const data = await response.json()
                setApiStatus(data)
                setWatcherStatus(data.success ? 'Online' : 'Offline')

                // Atualiza o status dos diretórios
                if (data.diagnostico && data.diagnostico.diretorios) {
                  setDirectoryStatus(data.diagnostico.diretorios)
                }
              }
            } catch (error) {
              console.error('Erro ao atualizar status:', error)
            }
          }}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          Atualizar status
        </button>
      </div>
    </div>
  )
}
