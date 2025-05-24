// components/diagnostics/socket-test.tsx
'use client'

'use client'

'use client'

import { useEffect, useState } from 'react'
import useSocket from '@/hooks/use-socket'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

export default function SocketConnectionTest() {
  // Estado para armazenar os resultados do teste
  const [testResults, setTestResults] = useState<{
    proxyTest: boolean | null
    directTest: boolean | null
    error: string | null
  }>({
    proxyTest: null,
    directTest: null,
    error: null,
  })

  const [testing, setTesting] = useState(false)
  const { socket, connected, error } = useSocket()

  // Função para testar a conexão
  const runSocketTest = async () => {
    setTesting(true)
    setTestResults({
      proxyTest: null,
      directTest: null,
      error: null,
    })

    try {
      // 1. Teste usando o proxy do Next.js
      console.log('Testando conexão via proxy Next.js...')
      const testResult = connected || socket?.connected
      setTestResults(prev => ({ ...prev, proxyTest: !!testResult }))

      // 2. Se o teste falhou com o proxy, tenta conexão direta (apenas para diagnóstico)
      if (!testResult) {
        console.log('Testando conexão direta...')
        try {
          const socketService = new (
            await import('@/lib/socket-service')
          ).default()
          const directSocket = socketService.connect('http://localhost:3001')

          // Espera um pouco para ver se conecta
          await new Promise(resolve => setTimeout(resolve, 3000))

          const directConnected = directSocket?.connected
          setTestResults(prev => ({ ...prev, directTest: !!directConnected }))

          // Limpa a conexão de teste
          socketService.disconnect()
        } catch (directErr) {
          console.error('Erro na conexão direta:', directErr)
          setTestResults(prev => ({ ...prev, directTest: false }))
        }
      }
    } catch (err: any) {
      console.error('Erro durante o teste:', err)
      setTestResults(prev => ({
        ...prev,
        error: err?.message || 'Erro desconhecido',
      }))
    } finally {
      setTesting(false)
    }
  }

  // Renderiza diagnóstico e sugestões com base nos resultados
  const renderDiagnosis = () => {
    if (testResults.proxyTest === null) return null

    if (testResults.proxyTest) {
      return (
        <Alert className="mt-4 border-green-500 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CheckCircle2 className="size-5 text-green-500" />
          <AlertTitle>Conexão bem-sucedida</AlertTitle>
          <AlertDescription>
            A conexão com o servidor Socket.io está funcionando corretamente
            através do proxy Next.js.
          </AlertDescription>
        </Alert>
      )
    } else {
      return (
        <Alert className="mt-4 border-yellow-500 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <AlertTriangle className="size-5 text-yellow-500" />
          <AlertTitle>Problemas na conexão</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              A conexão com o servidor Socket.io não está funcionando através do
              proxy Next.js.
            </p>
            {testResults.directTest === false && (
              <p>
                Também não foi possível conectar diretamente ao servidor.
                Verifique se o servidor Socket.io está rodando em
                http://localhost:3001.
              </p>
            )}
            {testResults.directTest === true && (
              <p>
                No entanto, a conexão direta foi bem-sucedida. Isso sugere um
                problema na configuração do proxy no Next.js.
              </p>
            )}
            <div className="mt-2 text-sm">
              <h4 className="font-bold">Sugestões:</h4>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>
                  Verifique se o servidor Socket.io está em execução na porta
                  3001
                </li>
                <li>
                  Confirme se a configuração do proxy no next.config.mjs está
                  correta
                </li>
                <li>
                  Confira se o servidor Socket.io tem CORS configurado
                  adequadamente
                </li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )
    }
  }

  return (
    <div className="rounded-md border p-4">
      <h3 className="mb-4 text-lg font-medium">
        Diagnóstico de Conexão Socket.io
      </h3>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span>Status atual da conexão:</span>
          {connected ? (
            <span className="flex items-center text-green-600">
              <CheckCircle2 className="mr-1 size-4" /> Conectado
            </span>
          ) : (
            <span className="flex items-center text-red-600">
              <XCircle className="mr-1 size-4" /> Desconectado
            </span>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erro de conexão</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <Button onClick={runSocketTest} disabled={testing}>
          {testing ? 'Testando...' : 'Testar Conexão Socket.io'}
        </Button>

        {renderDiagnosis()}
      </div>
    </div>
  )
}
