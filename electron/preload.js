const { contextBridge, ipcRenderer } = require('electron')

// API segura exposta para o renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Informações do app
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: name => ipcRenderer.invoke('get-app-path', name),

  // Diálogos de arquivo
  showSaveDialog: options => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: options => ipcRenderer.invoke('show-open-dialog', options),

  // Comunicação com menu
  onMenuAction: callback => {
    ipcRenderer.on('menu-action', (event, action) => callback(action))
  },
  removeMenuActionListener: () => {
    ipcRenderer.removeAllListeners('menu-action')
  },

  // Detecção de ambiente
  isElectron: () => true,
  platform: process.platform,

  // Métodos para captação
  saveSignature: async (dataURL, filename) => {
    const options = {
      title: 'Salvar Assinatura Digital',
      defaultPath: filename || 'assinatura.png',
      filters: [
        { name: 'Imagens', extensions: ['png', 'jpg', 'jpeg'] },
        { name: 'Todos os arquivos', extensions: ['*'] },
      ],
    }

    const result = await ipcRenderer.invoke('show-save-dialog', options)
    if (!result.canceled) {
      return result.filePath
    }
    return null
  },

  saveDocument: async (blob, filename) => {
    const options = {
      title: 'Salvar Documento',
      defaultPath: filename || 'documento.pdf',
      filters: [
        { name: 'PDF', extensions: ['pdf'] },
        { name: 'Todos os arquivos', extensions: ['*'] },
      ],
    }

    const result = await ipcRenderer.invoke('show-save-dialog', options)
    if (!result.canceled) {
      return result.filePath
    }
    return null
  },

  openFile: async filters => {
    const options = {
      title: 'Abrir Arquivo',
      filters: filters || [{ name: 'Todos os arquivos', extensions: ['*'] }],
      properties: ['openFile'],
    }

    const result = await ipcRenderer.invoke('show-open-dialog', options)
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  },

  openDirectory: async () => {
    const options = {
      title: 'Selecionar Pasta',
      properties: ['openDirectory'],
    }

    const result = await ipcRenderer.invoke('show-open-dialog', options)
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  },

  // Notificações do sistema
  showNotification: (title, body, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, { body, ...options })
    }
    return null
  },

  // Solicitação de permissão para notificações
  requestNotificationPermission: async () => {
    if ('Notification' in window) {
      return await Notification.requestPermission()
    }
    return 'denied'
  },

  // Métodos utilitários para desenvolvimento
  log: (...args) => {
    console.log('[Electron Preload]', ...args)
  },

  // Verificar se está online
  isOnline: () => navigator.onLine,

  // Listeners para mudanças de conectividade
  onOnline: callback => {
    window.addEventListener('online', callback)
  },
  onOffline: callback => {
    window.addEventListener('offline', callback)
  },

  // Remover listeners
  removeOnlineListener: callback => {
    window.removeEventListener('online', callback)
  },
  removeOfflineListener: callback => {
    window.removeEventListener('offline', callback)
  },
})

// Exposer informações sobre o ambiente Electron
contextBridge.exposeInMainWorld('electronInfo', {
  isElectron: true,
  platform: process.platform,
  arch: process.arch,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
})

// Log para desenvolvimento
console.log('Preload script carregado com sucesso')
console.log('Plataforma:', process.platform)
console.log('Versões:', {
  electron: process.versions.electron,
  chrome: process.versions.chrome,
  node: process.versions.node,
})
