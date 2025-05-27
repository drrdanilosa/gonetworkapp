const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron')
import path from 'path'
const isDev = process.env.NODE_ENV === 'development'
const { spawn } = require('child_process')

let mainWindow
let nextProcess

function createWindow() {
  // Criar a janela principal
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev, // Permitir recursos locais em desenvolvimento
    },
    icon: path.join(__dirname, '../public/icon.png'), // Adicione um ícone se tiver
    show: false, // Não mostrar até carregar
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
  })

  // URL do Next.js (desenvolvimento ou produção)
  const url = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../out/index.html')}`

  // Carregar a aplicação
  mainWindow.loadURL(url)

  // Mostrar janela quando pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()

    // Abrir DevTools em desenvolvimento
    if (isDev) {
      mainWindow.webContents.openDevTools()
    }
  })

  // Interceptar links externos
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Menu personalizado
  createMenu()

  // Limpar referência quando fechada
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Eventos de navegação segura
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)

    if (parsedUrl.origin !== 'http://localhost:3000' && !isDev) {
      event.preventDefault()
    }
  })
}

function createMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Novo Projeto',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-action', 'new-project')
          },
        },
        {
          label: 'Abrir Projeto',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('menu-action', 'open-project')
          },
        },
        { type: 'separator' },
        {
          label: 'Salvar',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-action', 'save')
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
        { role: 'toggleDevTools', label: 'Ferramentas do Desenvolvedor' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Normal' },
        { role: 'zoomIn', label: 'Aumentar Zoom' },
        { role: 'zoomOut', label: 'Diminuir Zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tela Cheia' },
      ],
    },
    {
      label: 'Captação',
      submenu: [
        {
          label: 'Nova Assinatura Digital',
          click: () => {
            mainWindow.webContents.send('menu-action', 'new-signature')
          },
        },
        {
          label: 'Autorização de Uso de Imagem',
          click: () => {
            mainWindow.webContents.send('menu-action', 'image-authorization')
          },
        },
        {
          label: 'Nova Reunião Online',
          click: () => {
            mainWindow.webContents.send('menu-action', 'new-meeting')
          },
        },
      ],
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Sobre',
              message: 'Sistema de Gestão de Produção Audiovisual',
              detail: 'Versão 1.0.0\nElectron Desktop App',
            })
          },
        },
      ],
    },
  ]

  // Ajustes para macOS
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: 'Sobre ' + app.getName() },
        { type: 'separator' },
        { role: 'services', label: 'Serviços' },
        { type: 'separator' },
        { role: 'hide', label: 'Ocultar ' + app.getName() },
        { role: 'hideothers', label: 'Ocultar Outros' },
        { role: 'unhide', label: 'Mostrar Todos' },
        { type: 'separator' },
        { role: 'quit', label: 'Sair do ' + app.getName() },
      ],
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// IPC Handlers para comunicação com o renderer
ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options)
  return result
})

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options)
  return result
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-app-path', (event, name) => {
  return app.getPath(name)
})

// Eventos do app
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  // No macOS, apps geralmente ficam ativas mesmo sem janelas
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // No macOS, recriar janela quando clicado no dock
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Segurança adicional
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })
})

// Iniciar Next.js em desenvolvimento
if (isDev) {
  app.on('ready', () => {
    // O Next.js já deve estar rodando via package.json script
    console.log(
      'Electron em modo desenvolvimento - conectando ao Next.js na porta 3000'
    )
  })
}

// Lidar com certificados não confiáveis em desenvolvimento
if (isDev) {
  app.commandLine.appendSwitch('ignore-certificate-errors')
  app.commandLine.appendSwitch('ignore-ssl-errors')
}
