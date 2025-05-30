// components/TauriDemo.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTauri } from '@/lib/tauri'

export default function TauriDemo() {
  const { isTauri, commands, window: tauriWindow, system } = useTauri()
  const [greeting, setGreeting] = useState('')
  const [osInfo, setOsInfo] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    if (isTauri) {
      system.getOS().then(os => {
        setOsInfo(`Sistema Operacional: ${os}`)
      })
    }
  }, [isTauri, system])

  const handleGreet = async () => {
    if (name.trim()) {
      const result = await commands.greet(name.trim())
      setGreeting(result)
    }
  }

  const handleMinimize = () => tauriWindow.minimize()
  const handleMaximize = () => tauriWindow.maximize()
  const handleClose = () => tauriWindow.close()

  if (!isTauri) {
    return (
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Modo Web
        </h3>
        <p className="text-blue-700">
          Este aplicativo está rodando no navegador. Para acessar as funcionalidades nativas,
          execute o comando <code className="bg-blue-100 px-2 py-1 rounded">npm run tauri:dev</code>
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-green-50 rounded-lg border border-green-200">
      <h3 className="text-lg font-semibold text-green-900 mb-4">
        🚀 Aplicativo Nativo Tauri
      </h3>
      
      {osInfo && (
        <p className="text-green-700 mb-4">{osInfo}</p>
      )}

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome"
            className="px-3 py-2 border border-green-300 rounded-md flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleGreet()}
          />
          <button
            onClick={handleGreet}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Saudar
          </button>
        </div>

        {greeting && (
          <div className="p-3 bg-green-100 rounded border border-green-300">
            <p className="text-green-800">{greeting}</p>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-green-200">
          <button
            onClick={handleMinimize}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Minimizar
          </button>
          <button
            onClick={handleMaximize}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Maximizar
          </button>
          <button
            onClick={handleClose}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
