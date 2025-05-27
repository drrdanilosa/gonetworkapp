import React, { useEffect, useState } from 'react'
import { useElectron } from '@/hooks/useElectron'
import { Button } from '@/components/ui/button'
import { Download, Folder } from 'lucide-react'
import { toast } from 'sonner'

interface ElectronIntegrationProps {
  children: React.ReactNode
}

export const ElectronIntegration: React.FC<ElectronIntegrationProps> = ({
  children,
}) => {
  const { isElectron, useMenuAction } = useElectron()
  const [isOnline, setIsOnline] = useState(true)

  // Hook para ações do menu
  useMenuAction(action => {
    switch (action) {
      case 'new-project':
        toast.info('Nova funcionalidade: Criar novo projeto')
        break
      case 'open-project':
        toast.info('Nova funcionalidade: Abrir projeto')
        break
      case 'save':
        toast.info('Salvando projeto...')
        break
      case 'new-signature':
        // Navegar para aba de assinatura digital
        window.location.hash = '#captacao'
        toast.success('Navegando para Assinatura Digital')
        break
      case 'image-authorization':
        // Navegar para aba de autorização de uso de imagem
        window.location.hash = '#captacao'
        toast.success('Navegando para Autorização de Uso de Imagem')
        break
      case 'new-meeting':
        // Navegar para aba de reunião online
        window.location.hash = '#captacao'
        toast.success('Navegando para Reunião Online')
        break
      default:
        console.log('Ação de menu não reconhecida:', action)
    }
  })

  // Monitor de conectividade
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Conexão restabelecida')
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.warning('Conexão perdida - funcionando offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isElectron) {
    return <>{children}</>
  }

  return (
    <div className="p-4 bg-gray-100 rounded-md shadow-md">
      {/* Indicador de status para Electron */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <div
          className={`size-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
        />
        <span className="text-xs text-muted-foreground">
          {isOnline ? 'Online' : 'Offline'}
        </span>
        <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded">
          Desktop
        </span>
      </div>

      {children}
    </div>
  )
}

// Componente para salvar arquivos no Electron
interface ElectronSaveButtonProps {
  data: string | Blob
  filename: string
  type?: 'signature' | 'document'
  children: React.ReactNode
  onSaved?: (filePath: string) => void
}

export const ElectronSaveButton: React.FC<ElectronSaveButtonProps> = ({
  data,
  filename,
  type = 'document',
  children,
  onSaved,
}) => {
  const { isElectron, saveFile } = useElectron()

  const handleSave = async () => {
    if (!isElectron) {
      toast.error('Funcionalidade disponível apenas na versão desktop')
      return
    }

    try {
      const filePath = await saveFile(data, filename, type)
      if (filePath) {
        toast.success(`Arquivo salvo em: ${filePath}`)
        onSaved?.(filePath)
      }
    } catch (error) {
      console.error('Erro ao salvar arquivo:', error)
      toast.error('Erro ao salvar arquivo')
    }
  }

  if (!isElectron) {
    return <>{children}</>
  }

  return (
    <Button onClick={handleSave} className="gap-2">
      <Download className="size-4" />
      {children}
    </Button>
  )
}

// Componente para abrir arquivos no Electron
interface ElectronOpenButtonProps {
  filters?: { name: string; extensions: string[] }[]
  onFileSelected?: (filePath: string) => void
  children: React.ReactNode
}

export const ElectronOpenButton: React.FC<ElectronOpenButtonProps> = ({
  filters,
  onFileSelected,
  children,
}) => {
  const { isElectron, openFile } = useElectron()

  const handleOpen = async () => {
    if (!isElectron) {
      toast.error('Funcionalidade disponível apenas na versão desktop')
      return
    }

    try {
      const filePath = await openFile(filters)
      if (filePath) {
        toast.success(`Arquivo selecionado: ${filePath}`)
        onFileSelected?.(filePath)
      }
    } catch (error) {
      console.error('Erro ao abrir arquivo:', error)
      toast.error('Erro ao abrir arquivo')
    }
  }

  if (!isElectron) {
    return <>{children}</>
  }

  return (
    <Button onClick={handleOpen} variant="outline" className="gap-2">
      <Folder className="size-4" />
      {children}
    </Button>
  )
}

// Componente para mostrar informações do app Electron
export const ElectronAppInfo: React.FC = () => {
  const { isElectron, getAppInfo } = useElectron()
  const [appInfo, setAppInfo] = useState<{
    version: string
    platform: string
    arch: string
  } | null>(null)

  useEffect(() => {
    if (isElectron && getAppInfo) {
      getAppInfo().then(setAppInfo)
    }
  }, [isElectron, getAppInfo])

  if (!isElectron || !appInfo) {
    return null
  }

  return (
    <div className="border-t p-4 text-xs text-muted-foreground">
      <div className="flex items-center justify-between">
        <span>{appInfo.version}</span>
        <span>
          {appInfo.platform} ({appInfo.arch})
        </span>
      </div>
    </div>
  )
}

export default ElectronIntegration
