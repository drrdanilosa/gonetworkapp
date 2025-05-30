// lib/tauri.ts

// Verifica se está rodando dentro do Tauri
export const isTauri = () => {
  if (typeof window === 'undefined') return false
  return !!(window as any).__TAURI__
}

// Wrapper para comandos do Tauri
export const tauriCommands = {
  async greet(name: string): Promise<string> {
    if (!isTauri()) return `Hello ${name}! (Web version)`
    try {
      const { invoke } = await import('@tauri-apps/api/tauri')
      return await invoke('greet', { name })
    } catch (error) {
      console.error('Erro ao executar comando greet:', error)
      return `Hello ${name}! (Erro no Tauri)`
    }
  },

  async getPlatform(): Promise<string> {
    if (!isTauri()) return 'web'
    try {
      const { invoke } = await import('@tauri-apps/api/tauri')
      return await invoke('get_platform')
    } catch (error) {
      console.error('Erro ao obter plataforma:', error)
      return 'unknown'
    }
  },

  async getArch(): Promise<string> {
    if (!isTauri()) return 'web'
    try {
      const { invoke } = await import('@tauri-apps/api/tauri')
      return await invoke('get_arch')
    } catch (error) {
      console.error('Erro ao obter arquitetura:', error)
      return 'unknown'
    }
  },

  async getSystemInfo(): Promise<{
    os: string
    arch: string
    version: string
    hostname: string
  }> {
    if (!isTauri()) {
      return {
        os: 'web',
        arch: 'web',
        version: 'web',
        hostname: 'localhost'
      }
    }
    try {
      const { invoke } = await import('@tauri-apps/api/tauri')
      return await invoke('get_system_info')
    } catch (error) {
      console.error('Erro ao obter informações do sistema:', error)
      return {
        os: 'unknown',
        arch: 'unknown',
        version: 'unknown',
        hostname: 'unknown'
      }
    }
  }
}

// Wrapper para janela do Tauri
export const tauriWindow = {
  async minimize() {
    if (!isTauri()) return
    const { appWindow } = await import('@tauri-apps/api/window')
    await appWindow.minimize()
  },

  async maximize() {
    if (!isTauri()) return
    const { appWindow } = await import('@tauri-apps/api/window')
    await appWindow.toggleMaximize()
  },

  async close() {
    if (!isTauri()) return
    const { appWindow } = await import('@tauri-apps/api/window')
    await appWindow.close()
  },

  async setTitle(title: string) {
    if (!isTauri()) return
    const { appWindow } = await import('@tauri-apps/api/window')
    await appWindow.setTitle(title)
  }
}

// Informações do sistema
export const tauriSystem = {
  async getOS(): Promise<string> {
    if (!isTauri()) return 'web'
    try {
      const { invoke } = await import('@tauri-apps/api/tauri')
      return await invoke('get_platform')
    } catch (error) {
      console.error('Erro ao obter informações do sistema:', error)
      return 'unknown'
    }
  },

  async getArch(): Promise<string> {
    if (!isTauri()) return 'web'
    try {
      const { invoke } = await import('@tauri-apps/api/tauri')
      return await invoke('get_arch')
    } catch (error) {
      console.error('Erro ao obter arquitetura:', error)
      return 'unknown'
    }
  }
}

// Sistema de arquivos
export const tauriFS = {
  async fileExists(path: string): Promise<boolean> {
    if (!isTauri()) return false
    try {
      const { invoke } = await import('@tauri-apps/api/tauri')
      return await invoke('file_exists', { path })
    } catch (error) {
      console.error('Erro ao verificar arquivo:', error)
      return false
    }
  },

  async readTextFile(path: string): Promise<string> {
    if (!isTauri()) {
      throw new Error('Funcionalidade disponível apenas no desktop')
    }
    try {
      const { invoke } = await import('@tauri-apps/api/tauri')
      return await invoke('read_text_file', { path })
    } catch (error) {
      console.error('Erro ao ler arquivo:', error)
      throw error
    }
  },

  async writeTextFile(path: string, content: string): Promise<void> {
    if (!isTauri()) {
      throw new Error('Funcionalidade disponível apenas no desktop')
    }
    try {
      const { invoke } = await import('@tauri-apps/api/tauri')
      await invoke('write_text_file', { path, content })
    } catch (error) {
      console.error('Erro ao escrever arquivo:', error)
      throw error
    }
  },

  async createDirectory(path: string): Promise<void> {
    if (!isTauri()) {
      throw new Error('Funcionalidade disponível apenas no desktop')
    }
    try {
      const { invoke } = await import('@tauri-apps/api/tauri')
      await invoke('create_directory', { path })
    } catch (error) {
      console.error('Erro ao criar diretório:', error)
      throw error
    }
  },

  async listDirectory(path: string): Promise<string[]> {
    if (!isTauri()) {
      throw new Error('Funcionalidade disponível apenas no desktop')
    }
    try {
      const { invoke } = await import('@tauri-apps/api/tauri')
      return await invoke('list_directory', { path })
    } catch (error) {
      console.error('Erro ao listar diretório:', error)
      throw error
    }
  },

  async getFileInfo(path: string): Promise<{
    name: string
    size: number
    is_file: boolean
    is_dir: boolean
    modified?: string
  }> {
    if (!isTauri()) {
      throw new Error('Funcionalidade disponível apenas no desktop')
    }
    try {
      const { invoke } = await import('@tauri-apps/api/tauri')
      return await invoke('get_file_info', { path })
    } catch (error) {
      console.error('Erro ao obter informações do arquivo:', error)
      throw error
    }
  }
}

// Hook para verificar se está no Tauri
export const useTauri = () => {
  return {
    isTauri: isTauri(),
    commands: tauriCommands,
    window: tauriWindow,
    system: tauriSystem,
    fs: tauriFS
  }
}
