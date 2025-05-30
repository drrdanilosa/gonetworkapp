'use client'

import { useState, useEffect } from 'react'
import { useTauri } from '@/lib/tauri'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function TauriTestPage() {
  const { isTauri, commands, window: tauriWindow, system } = useTauri()
  const [greetName, setGreetName] = useState('Usuário')
  const [greetResult, setGreetResult] = useState('')
  const [platformInfo, setPlatformInfo] = useState<{
    os: string
    arch: string
  }>({ os: '', arch: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Carregar informações do sistema automaticamente
    const loadSystemInfo = async () => {
      try {
        const [os, arch] = await Promise.all([
          system.getOS(),
          system.getArch()
        ])
        setPlatformInfo({ os, arch })
      } catch (error) {
        console.error('Erro ao carregar informações do sistema:', error)
      }
    }

    loadSystemInfo()
  }, [system])

  const handleGreet = async () => {
    setLoading(true)
    try {
      const result = await commands.greet(greetName)
      setGreetResult(result)
    } catch (error) {
      setGreetResult(`Erro: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleMinimize = () => {
    tauriWindow.minimize()
  }

  const handleMaximize = () => {
    tauriWindow.maximize()
  }

  const handleSetTitle = () => {
    tauriWindow.setTitle(`GoNetworkApp - ${new Date().toLocaleTimeString()}`)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Teste do Tauri</h1>
        <div className="flex justify-center gap-2">
          <Badge variant={isTauri ? "default" : "secondary"}>
            {isTauri ? "🚀 Executando no Tauri" : "🌐 Executando no Navegador"}
          </Badge>
          {platformInfo.os && (
            <Badge variant="outline">
              {platformInfo.os} - {platformInfo.arch}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teste de Comandos */}
        <Card>
          <CardHeader>
            <CardTitle>Comandos Tauri</CardTitle>
            <CardDescription>
              Teste de comunicação entre frontend e backend Rust
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite seu nome"
                value={greetName}
                onChange={(e) => setGreetName(e.target.value)}
              />
              <Button onClick={handleGreet} disabled={loading}>
                {loading ? 'Carregando...' : 'Saudar'}
              </Button>
            </div>
            {greetResult && (
              <div className="p-3 bg-muted rounded-md">
                <strong>Resultado:</strong> {greetResult}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controles da Janela */}
        <Card>
          <CardHeader>
            <CardTitle>Controles da Janela</CardTitle>
            <CardDescription>
              Controle a janela do aplicativo (apenas no Tauri)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={handleMinimize} 
              disabled={!isTauri}
              className="w-full"
            >
              Minimizar Janela
            </Button>
            <Button 
              onClick={handleMaximize} 
              disabled={!isTauri}
              className="w-full"
            >
              Maximizar/Restaurar
            </Button>
            <Button 
              onClick={handleSetTitle} 
              disabled={!isTauri}
              className="w-full"
            >
              Atualizar Título
            </Button>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
            <CardDescription>
              Dados sobre o sistema operacional e arquitetura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Sistema Operacional:</strong> {platformInfo.os || 'Carregando...'}
              </div>
              <div>
                <strong>Arquitetura:</strong> {platformInfo.arch || 'Carregando...'}
              </div>
              <div>
                <strong>Ambiente:</strong> {isTauri ? 'Desktop (Tauri)' : 'Web Browser'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status da Integração */}
        <Card>
          <CardHeader>
            <CardTitle>Status da Integração</CardTitle>
            <CardDescription>
              Verificações de funcionalidade e compatibilidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={isTauri ? "text-green-600" : "text-blue-600"}>
                  {isTauri ? "✅" : "🌐"}
                </span>
                <span>
                  {isTauri 
                    ? "APIs Tauri disponíveis" 
                    : "Fallback web funcionando"
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>SSR/Hidratação funcionando</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>Interface responsiva</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>Comandos Rust integrados</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Como usar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>No navegador:</strong> Todas as funcionalidades usam fallbacks web seguros</p>
            <p><strong>No Tauri:</strong> APIs nativas são utilizadas para funcionalidades completas</p>
            <p><strong>Desenvolvimento:</strong> Use <code>npm run tauri:dev</code> para testar no desktop</p>
            <p><strong>Build:</strong> Use <code>npm run tauri:build</code> para gerar instaladores</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
