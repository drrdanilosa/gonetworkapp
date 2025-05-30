// lib/tauri.ts
import { invoke } from '@tauri-apps/api/tauri'
import { appWindow } from '@tauri-apps/api/window'

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
      return await invoke('greet', { name })
    } catch (error) {
      console.error('Erro ao executar comando greet:', error)
      return `Hello ${name}! (Erro no Tauri)`
    }
  },

  async getPlatform(): Promise<string> {
    if (!isTauri()) return 'web'
    try {
      return await invoke('get_platform')
    } catch (error) {
      console.error('Erro ao obter plataforma:', error)
      return 'unknown'
    }
  },

  async getArch(): Promise<string> {
    if (!isTauri()) return 'web'
    try {
      return await invoke('get_arch')
    } catch (error) {
      console.error('Erro ao obter arquitetura:', error)
      return 'unknown'
    }
  }
}

// Wrapper para janela do Tauri
export const tauriWindow = {
  async minimize() {
    if (!isTauri()) return
    await appWindow.minimize()
  },

  async maximize() {
    if (!isTauri()) return
    await appWindow.toggleMaximize()
  },

  async close() {
    if (!isTauri()) return
    await appWindow.close()
  }
}
    await window.close()
  },

  async setTitle(title: string) {
    if (!isTauri()) return
    const window = getCurrentWindow()
    await window.setTitle(title)
  }
}

// Informações do sistema
export const tauriSystem = {
  async getOS(): Promise<string> {
    if (!isTauri()) return 'web'
    try {
      return await type()
    } catch (error) {
      console.error('Erro ao obter informações do sistema:', error)
      return 'unknown'
    }
  }
}

// Hook para verificar se está no Tauri
export const useTauri = () => {
  return {
    isTauri: isTauri(),
    commands: tauriCommands,
    window: tauriWindow,
    system: tauriSystem
  }
}
