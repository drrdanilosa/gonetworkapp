'use client'

import { useEffect, useState } from 'react'

interface ElectronAPI {
  isElectron: () => boolean
  platform: string
  getAppVersion: () => Promise<string>
  getAppPath: (name: string) => Promise<string>
  showSaveDialog: (options: any) => Promise<any>
  showOpenDialog: (options: any) => Promise<any>
  onMenuAction: (callback: (action: string) => void) => void
  removeMenuActionListener: () => void
  saveSignature: (dataURL: string, filename?: string) => Promise<string | null>
  saveDocument: (blob: Blob, filename?: string) => Promise<string | null>
  openFile: (filters?: any[]) => Promise<string | null>
  openDirectory: () => Promise<string | null>
  showNotification: (
    title: string,
    body: string,
    options?: any
  ) => Notification | null
  requestNotificationPermission: () => Promise<NotificationPermission>
  log: (...args: any[]) => void
  isOnline: () => boolean
  onOnline: (callback: () => void) => void
  onOffline: (callback: () => void) => void
  removeOnlineListener: (callback: () => void) => void
  removeOfflineListener: (callback: () => void) => void
}

interface ElectronInfo {
  isElectron: boolean
  platform: string
  arch: string
  versions: {
    electron: string
    chrome: string
    node: string
  }
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
    electronInfo?: ElectronInfo
  }
}

export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false)
  const [electronAPI, setElectronAPI] = useState<ElectronAPI | null>(null)
  const [electronInfo, setElectronInfo] = useState<ElectronInfo | null>(null)

  useEffect(() => {
    // Verificar se está no ambiente Electron
    const checkElectron = () => {
      if (typeof window !== 'undefined') {
        const hasElectronAPI = !!window.electronAPI
        const hasElectronInfo = !!window.electronInfo
        const isElectronEnv = hasElectronAPI && hasElectronInfo

        setIsElectron(isElectronEnv)

        if (isElectronEnv) {
          setElectronAPI(window.electronAPI!)
          setElectronInfo(window.electronInfo!)
        }
      }
    }

    checkElectron()
  }, [])

  // Métodos auxiliares
  const saveFile = async (
    data: string | Blob,
    filename: string,
    type: 'signature' | 'document' = 'document'
  ): Promise<string | null> => {
    if (!electronAPI) {
      console.warn('Electron API não disponível')
      return null
    }

    try {
      if (type === 'signature' && typeof data === 'string') {
        return await electronAPI.saveSignature(data, filename)
      } else if (type === 'document' && data instanceof Blob) {
        return await electronAPI.saveDocument(data, filename)
      }
      return null
    } catch (error) {
      console.error('Erro ao salvar arquivo:', error)
      return null
    }
  }

  const openFile = async (
    filters?: { name: string; extensions: string[] }[]
  ): Promise<string | null> => {
    if (!electronAPI) {
      console.warn('Electron API não disponível')
      return null
    }

    try {
      return await electronAPI.openFile(filters)
    } catch (error) {
      console.error('Erro ao abrir arquivo:', error)
      return null
    }
  }

  const openDirectory = async (): Promise<string | null> => {
    if (!electronAPI) {
      console.warn('Electron API não disponível')
      return null
    }

    try {
      return await electronAPI.openDirectory()
    } catch (error) {
      console.error('Erro ao abrir diretório:', error)
      return null
    }
  }

  const showNotification = (
    title: string,
    body: string,
    options?: any
  ): Notification | null => {
    if (!electronAPI) {
      // Fallback para web notification
      if ('Notification' in window && Notification.permission === 'granted') {
        return new Notification(title, { body, ...options })
      }
      return null
    }

    return electronAPI.showNotification(title, body, options)
  }

  const requestNotificationPermission =
    async (): Promise<NotificationPermission> => {
      if (!electronAPI) {
        // Fallback para web notification
        if ('Notification' in window) {
          return await Notification.requestPermission()
        }
        return 'denied'
      }

      return await electronAPI.requestNotificationPermission()
    }

  const getAppInfo = async () => {
    if (!electronAPI) {
      return null
    }

    try {
      const [version, userDataPath, documentsPath] = await Promise.all([
        electronAPI.getAppVersion(),
        electronAPI.getAppPath('userData'),
        electronAPI.getAppPath('documents'),
      ])

      return {
        version,
        userDataPath,
        documentsPath,
        platform: electronInfo?.platform || 'unknown',
        arch: electronInfo?.arch || 'unknown',
        versions: electronInfo?.versions || {},
      }
    } catch (error) {
      console.error('Erro ao obter informações do app:', error)
      return null
    }
  }

  // Hook para ações do menu
  const useMenuAction = (callback: (action: string) => void) => {
    useEffect(() => {
      if (electronAPI) {
        electronAPI.onMenuAction(callback)
        return () => electronAPI.removeMenuActionListener()
      }
    }, [callback, electronAPI])
  }

  // Hook para status de conectividade
  const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(
      electronAPI?.isOnline() ?? navigator.onLine
    )

    useEffect(() => {
      const handleOnline = () => setIsOnline(true)
      const handleOffline = () => setIsOnline(false)

      if (electronAPI) {
        electronAPI.onOnline(handleOnline)
        electronAPI.onOffline(handleOffline)

        return () => {
          electronAPI.removeOnlineListener(handleOnline)
          electronAPI.removeOfflineListener(handleOffline)
        }
      } else {
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
          window.removeEventListener('online', handleOnline)
          window.removeEventListener('offline', handleOffline)
        }
      }
    }, [electronAPI])

    return isOnline
  }

  return {
    isElectron,
    electronAPI,
    electronInfo,
    saveFile,
    openFile,
    openDirectory,
    showNotification,
    requestNotificationPermission,
    getAppInfo,
    useMenuAction,
    useOnlineStatus,

    // Métodos diretos da API (quando disponível)
    ...(electronAPI && {
      log: electronAPI.log,
      platform: electronAPI.platform,
    }),
  }
}

export default useElectron
