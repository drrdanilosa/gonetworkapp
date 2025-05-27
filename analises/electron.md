Vou ajudá-lo a transformar seu projeto em um app Electron. Primeiro, deixe-me analisar seu projeto atual para entender sua estrutura e então criar um plano completo.Vou ajudá-lo a transformar seu projeto em um app Electron. Primeiro, preciso entender a estrutura atual do seu projeto para criar a configuração adequada.Perfeito! Agora entendo o seu projeto. É uma aplicação Next.js React com TypeScript para gerenciamento de produção audiovisual. Vou gerar todos os comandos e códigos necessários para transformar sua aplicação em um app Electron.

## 1. Comandos de Instalação

Primeiro, instale as dependências necessárias para o Electron:

```bash
# Instalar dependências do Electron
npm install --save-dev electron electron-builder
npm install --save-dev @electron-forge/cli @electron-forge/maker-deb @electron-forge/maker-rpm @electron-forge/maker-squirrel @electron-forge/maker-zip
npm install --save-dev cross-env wait-on concurrently
```

## 2. Arquivo de Configuração Principal do Electron

```javascript name=electron/main.js
const { app, BrowserWindow, Menu, shell, dialog } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'
const { spawn } = require('child_process')

let mainWindow
let nextProcess

function createWindow() {
  // Criar a janela principal do navegador
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../assets/icon.png'), // Adicione um ícone se quiser
    show: false,
    titleBarStyle: 'default',
  })

  // URL da aplicação
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../out/index.html')}`

  // Carregar a aplicação
  mainWindow.loadURL(startUrl)

  // Mostrar quando estiver pronto para evitar flicker visual
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Abrir DevTools apenas em desenvolvimento
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  // Interceptar links externos para abrir no navegador padrão
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Configurar menu da aplicação
function createMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Novo Projeto',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-project')
          },
        },
        { type: 'separator' },
        {
          label: 'Configurações',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('menu-settings')
          },
        },
        { type: 'separator' },
        {
          label: 'Sair',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          },
        },
      ],
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Recortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' },
        { role: 'selectall', label: 'Selecionar Tudo' },
      ],
    },
    {
      label: 'Visualizar',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { role: 'forceReload', label: 'Forçar Recarga' },
        { role: 'toggledevtools', label: 'Ferramentas do Desenvolvedor' },
        { type: 'separator' },
        { role: 'resetzoom', label: 'Zoom Real' },
        { role: 'zoomin', label: 'Aumentar Zoom' },
        { role: 'zoomout', label: 'Diminuir Zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tela Cheia' },
      ],
    },
    {
      label: 'Janela',
      submenu: [
        { role: 'minimize', label: 'Minimizar' },
        { role: 'close', label: 'Fechar' },
      ],
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre GoNetwork AI',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Sobre',
              message: 'GoNetwork AI',
              detail:
                'Plataforma de gerenciamento de produção audiovisual\nVersão 1.0.0',
            })
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// Iniciar servidor Next.js em desenvolvimento
function startNextServer() {
  if (isDev) {
    nextProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    })

    nextProcess.on('error', err => {
      console.error('Erro ao iniciar servidor Next.js:', err)
    })
  }
}

// Este método será chamado quando o Electron terminar a inicialização
app.whenReady().then(() => {
  if (isDev) {
    startNextServer()
    // Aguardar o servidor Next.js estar pronto
    setTimeout(createWindow, 3000)
  } else {
    createWindow()
  }

  createMenu()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Sair quando todas as janelas estiverem fechadas
app.on('window-all-closed', () => {
  if (nextProcess) {
    nextProcess.kill()
  }

  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  if (nextProcess) {
    nextProcess.kill()
  }
})

// Configurações de segurança
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationUrl) => {
    navigationEvent.preventDefault()
    shell.openExternal(navigationUrl)
  })
})
```

## 3. Arquivo Preload para Comunicação Segura

```javascript name=electron/preload.js
const { contextBridge, ipcRenderer } = require('electron')

// Expor APIs seguras para o renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Comunicação com o processo principal
  onMenuAction: callback => ipcRenderer.on('menu-new-project', callback),
  onSettingsAction: callback => ipcRenderer.on('menu-settings', callback),

  // Utilitários do sistema
  platform: process.platform,

  // Notificações
  showNotification: (title, body) => {
    new Notification(title, { body })
  },
})

// Remover listeners quando a página for recarregada
window.addEventListener('DOMContentLoaded', () => {
  console.log('GoNetwork AI - Electron App carregado')
})
```

## 4. Configuração Atualizada do Next.js

```javascript name=next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  // Configurações específicas para Electron
  trailingSlash: true,
  output: 'export',
  distDir: 'out',
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
}

export default nextConfig
```

## 5. Scripts Atualizados no package.json

Adicione estes scripts ao seu `package.json`:

```json name=package.json
{
  "main": "public/electron.js",
  "homepage": "./",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next build && next export",
    "electron": "wait-on http://localhost:3000 && electron .",
    "electron-dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\"",
    "electron-pack": "npm run export && electron-builder",
    "electron-dist": "npm run export && electron-builder --publish=never",
    "build-electron": "npm run export && electron-builder build --win --mac --linux",
    "dist": "npm run build && electron-builder",
    "postinstall": "electron-builder install-app-deps",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "socket-server": "node scripts/socket-server-teste.js",
    "dev:all": "concurrently \"npm run dev\" \"npm run socket-server\"",
    "check-socket": "node scripts/check-socket-connection.js",
    "start:all": "concurrently \"npm run start\" \"npm run socket-server\"",
    "build:all": "npm run build && echo Build concluído!",
    "audit": "tsx scripts/run-audit.ts",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "vitest"
  }
}
```

## 6. Configuração do Electron Builder

```json name=electron-builder.json
{
  "appId": "com.gonetwork.ai",
  "productName": "GoNetwork AI",
  "directories": {
    "output": "dist"
  },
  "files": ["out/**/*", "electron/**/*", "node_modules/**/*", "package.json"],
  "extraMetadata": {
    "main": "electron/main.js"
  },
  "win": {
    "target": "nsis",
    "icon": "assets/icon.ico"
  },
  "mac": {
    "target": "dmg",
    "icon": "assets/icon.icns",
    "category": "public.app-category.productivity"
  },
  "linux": {
    "target": "AppImage",
    "icon": "assets/icon.png",
    "category": "Office"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  }
}
```

## 7. Variáveis de Ambiente para Electron

```bash name=.env.electron
# Configurações específicas para Electron
NEXT_PUBLIC_PLATFORM=electron
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_AUTH_SECRET=electron-app-secret
NEXT_PUBLIC_ANEXO_PATH=./exports
ELECTRON_IS_DEV=true
```

## 8. Hook React para Detecção do Electron

```typescript name=hooks/use-electron.ts
import { useEffect, useState } from 'react'

export function useElectron() {
  const [isElectron, setIsElectron] = useState(false)
  const [electronAPI, setElectronAPI] = useState<any>(null)

  useEffect(() => {
    // Verificar se está rodando no Electron
    const isElectronApp = typeof window !== 'undefined' && window.electronAPI
    setIsElectron(!!isElectronApp)

    if (isElectronApp) {
      setElectronAPI(window.electronAPI)
    }
  }, [])

  return {
    isElectron,
    electronAPI,
    platform: electronAPI?.platform || 'web',
  }
}

// Tipos para TypeScript
declare global {
  interface Window {
    electronAPI?: {
      onMenuAction: (callback: () => void) => void
      onSettingsAction: (callback: () => void) => void
      platform: string
      showNotification: (title: string, body: string) => void
    }
  }
}
```

## 9. Componente de Barra de Título Personalizada

```tsx name=components/electron/title-bar.tsx
'use client'

import { useElectron } from '@/hooks/use-electron'
import { Minimize2, Maximize2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ElectronTitleBar() {
  const { isElectron } = useElectron()

  if (!isElectron) return null

  return (
    <div className="h-8 bg-background border-b flex items-center justify-between px-4 drag">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">GoNetwork AI</span>
      </div>

      <div className="flex items-center space-x-1 no-drag">
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Minimize2 className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Maximize2 className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-red-500"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
```

## 10. Atualização do Layout Principal

```tsx name=app/layout.tsx
import type React from 'react'
import { Inter, Fira_Code } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ReactQueryProvider } from '@/components/providers/query-provider'
import { NotificationsProvider } from '@/components/providers/notifications-provider'
import { EventSyncProvider } from '@/components/providers/event-sync-provider'
import { ElectronTitleBar } from '@/components/electron/title-bar'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
})

export const metadata = {
  title: 'GoNetwork AI',
  description: 'Plataforma de gerenciamento de produção audiovisual',
  generator: 'Next.js 15',
  applicationName: 'GoNetwork AI',
  keywords: ['produção audiovisual', 'gestão de projetos', 'AI'],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${firaCode.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ElectronTitleBar />
          <ReactQueryProvider>
            <NotificationsProvider>
              <EventSyncProvider>{children}</EventSyncProvider>
            </NotificationsProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## 11. CSS para Electron

```css name=app/electron.css
/* Estilos específicos para Electron */
.drag {
  -webkit-app-region: drag;
}

.no-drag {
  -webkit-app-region: no-drag;
}

/* Remover seleção de texto na barra de título */
.drag * {
  user-select: none;
  -webkit-user-select: none;
}
```

## 12. Scripts de Build e Desenvolvimento

```bash name=scripts/build-electron.sh
#!/bin/bash

echo "🔧 Preparando build do Electron..."

# Limpar diretórios anteriores
rm -rf out dist

# Build do Next.js para produção
echo "📦 Fazendo build do Next.js..."
npm run build

# Gerar arquivos estáticos
echo "📁 Exportando arquivos estáticos..."
npm run export

# Build do Electron
echo "⚡ Fazendo build do Electron..."
npx electron-builder

echo "✅ Build concluído! Verifique a pasta 'dist' para os instaladores."
```

## 13. Comandos para Executar

### Desenvolvimento:

```bash
# Executar em modo desenvolvimento (Next.js + Electron)
npm run electron-dev

# Ou executar separadamente:
npm run dev        # Terminal 1: Next.js
npm run electron   # Terminal 2: Electron
```

### Produção:

```bash
# Build completo para distribuição
npm run build-electron

# Ou passo a passo:
npm run export           # Gerar arquivos estáticos
npm run electron-pack    # Criar executáveis
```

### Testar Build de Produção:

```bash
# Testar localmente sem criar instaladores
npm run export && npx electron .
```

## 14. Estrutura Final de Arquivos

Sua estrutura ficará assim:

```
projeto/
├── electron/
│   ├── main.js
│   └── preload.js
├── assets/
│   ├── icon.png
│   ├── icon.ico
│   └── icon.icns
├── app/
├── components/
├── electron-builder.json
├── .env.electron
└── package.json
```

## 15. Próximos Passos

1. **Execute os comandos de instalação**
2. **Crie os arquivos fornecidos**
3. **Adicione ícones na pasta `assets/`**
4. **Teste em desenvolvimento:** `npm run electron-dev`
5. **Faça o build:** `npm run build-electron`

Agora você terá sua aplicação Next.js funcionando como um app nativo do Electron! O app manterá todas as funcionalidades originais, mas rodará como uma aplicação desktop independente.
