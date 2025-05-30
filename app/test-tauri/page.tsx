'use client'

import { useState, useEffect } from 'react'
import { isTauri, tauriCommands, tauriWindow } from '@/lib/tauri'

export default function TestTauriPage() {
  const [platform, setPlatform] = useState<string>('')
  const [arch, setArch] = useState<string>('')
  const [greeting, setGreeting] = useState<string>('')
  const [name, setName] = useState<string>('Mundo')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const testApis = async () => {
      try {
        const platformResult = await tauriCommands.getPlatform()
        const archResult = await tauriCommands.getArch()
        setPlatform(platformResult)
        setArch(archResult)
      } catch (error) {
        console.error('Erro ao testar APIs:', error)
      }
    }
    testApis()
  }, [])

  const handleGreet = async () => {
    setIsLoading(true)
    try {
      const result = await tauriCommands.greet(name)
      setGreeting(result)
    } catch (error) {
      console.error('Erro ao cumprimentar:', error)
      setGreeting('Erro ao cumprimentar')
    }
    setIsLoading(false)
  }

  const handleMinimize = async () => {
    try {
      await tauriWindow.minimize()
    } catch (error) {
      console.error('Erro ao minimizar:', error)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Teste de Integração Tauri</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Status do Ambiente</h2>
        <p className="mb-1">
          <strong>Está no Tauri:</strong> {isTauri() ? 'Sim ✅' : 'Não (Navegador Web) 🌐'}
        </p>
        <p className="mb-1">
          <strong>Plataforma:</strong> {platform || 'Carregando...'}
        </p>
        <p>
          <strong>Arquitetura:</strong> {arch || 'Carregando...'}
        </p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Teste de Comando</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded"
            placeholder="Digite um nome"
          />
          <button
            onClick={handleGreet}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Cumprimentando...' : 'Cumprimentar'}
          </button>
        </div>
        {greeting && (
          <p className="bg-green-100 p-2 rounded mt-2">
            <strong>Resposta:</strong> {greeting}
          </p>
        )}
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Controles de Janela</h2>
        <button
          onClick={handleMinimize}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Minimizar Janela
        </button>
        <p className="text-sm text-gray-600 mt-2">
          (Funciona apenas quando executado no desktop Tauri)
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Informações</h2>
        <p className="text-sm text-gray-700">
          Esta página testa a integração entre Next.js e Tauri. Quando executada no navegador,
          mostra versões web das funcionalidades. Quando executada no app desktop Tauri,
          utiliza as APIs nativas do sistema.
        </p>
      </div>
    </div>
  )
}
