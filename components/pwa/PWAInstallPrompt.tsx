'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      // Para Chrome/Edge
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        return
      }
      
      // Para Safari iOS
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true)
        return
      }
      
      // Para outros navegadores
      if (document.referrer.includes('android-app://')) {
        setIsInstalled(true)
        return
      }
    }

    checkIfInstalled()

    const handleBeforeInstallPrompt = (e: Event) => {
      // Previne o prompt automático do Chrome 67 e anteriores
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Mostrar prompt customizado após 3 segundos
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true)
        }
      }, 3000)
    }

    const handleAppInstalled = () => {
      console.log('PWA foi instalado!')
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      // Mostrar prompt de instalação
      await deferredPrompt.prompt()
      
      // Aguardar escolha do usuário
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('Usuário aceitou instalar o PWA')
      } else {
        console.log('Usuário rejeitou instalar o PWA')
      }
      
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('Erro ao mostrar prompt de instalação:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Guardar a decisão do usuário para não mostrar novamente por um tempo
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    }
  }

  // Não mostrar se já estiver instalado
  if (isInstalled) return null

  // Verificar se foi dispensado recentemente (últimas 24 horas)
  if (typeof window !== 'undefined' && window.localStorage) {
    const dismissedTime = localStorage.getItem('pwa-install-dismissed')
    if (dismissedTime) {
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
      if (parseInt(dismissedTime) > oneDayAgo) {
        return null
      }
    }
  }

  if (!showInstallPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">
              Instalar GoNetwork AI
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Instale o app para acesso rápido e experiência completa offline.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                Instalar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
              >
                Agora não
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Hook para verificar se é PWA
export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const checkPWAStatus = () => {
      // Verificar se está rodando como PWA instalado
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              (window.navigator as any).standalone === true ||
                              document.referrer.includes('android-app://')

      setIsStandalone(isStandaloneMode)
      setIsInstalled(isStandaloneMode)
    }

    checkPWAStatus()
    
    // Listener para mudanças no display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addListener(checkPWAStatus)

    return () => {
      mediaQuery.removeListener(checkPWAStatus)
    }
  }, [])

  return { isInstalled, isStandalone }
}
