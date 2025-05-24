'use client'

'use client'

'use client'

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
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Inicialização de Projetos de Teste
      </h1>
      <div className="mb-6 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
        <p className="font-bold">
          Status:{' '}
          {initialized
            ? 'Projetos inicializados com sucesso!'
            : 'Inicializando...'}
        </p>
        <p className="mt-1 text-sm">
          Esta página cria os projetos de teste necessários para o funcionamento
          do watcher de vídeos.
        </p>
      </div>
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Projetos Disponíveis</h2>
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
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Status do Sistema</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded border p-4">
            <h3 className="mb-2 flex items-center font-medium">
              <span
                className={`mr-2 inline-block size-3 rounded-full ${watcherStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}
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
          <div className="rounded border p-4">
            <h3 className="mb-2 font-medium">Diretórios de Vídeo</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center">
                <span
                  className={`mr-2 inline-block size-2 rounded-full ${directoryStatus.projeto1Dir ? 'bg-green-500' : 'bg-red-500'}`}
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
                  className={`mr-2 inline-block size-2 rounded-full ${directoryStatus.projeto2Dir ? 'bg-green-500' : 'bg-red-500'}`}
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
          <div className="mt-4 rounded border p-4">
            <h3 className="mb-2 font-medium">Arquivos Detectados</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium">Projeto 1:</h4>
                {apiStatus.diagnostico.arquivos.projeto1?.length > 0 ? (
                  <ul className="list-disc pl-5 text-xs text-gray-600">
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
                  <ul className="list-disc pl-5 text-xs text-gray-600">
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
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
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
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
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
          className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
        >
          Atualizar status
        </button>
      </div>
    </div>
  )
}
