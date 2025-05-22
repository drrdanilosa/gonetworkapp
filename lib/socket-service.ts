import { io, type Socket } from 'socket.io-client'
import type { Comment } from '@/components/video/comment-markers-timeline'
import type { Annotation } from '@/components/video/annotation-canvas'
import type { VideoVersion } from '@/types/project'

// Tipos para os eventos do socket
export interface ServerToClientEvents {
  userJoined: (user: CollaborationUser) => void
  userLeft: (userId: string) => void
  userCursorMoved: (userId: string, position: { x: number; y: number }) => void
  userIsTyping: (userId: string, isTyping: boolean) => void
  commentAdded: (comment: Comment) => void
  commentUpdated: (comment: Comment) => void
  commentDeleted: (commentId: string) => void
  annotationStarted: (userId: string, annotation: Annotation) => void
  annotationUpdated: (userId: string, annotation: Annotation) => void
  annotationCompleted: (annotation: Annotation) => void
  annotationDeleted: (annotationId: string) => void
  videoSeeked: (userId: string, time: number) => void
  videoPlayPause: (userId: string, isPlaying: boolean) => void
  initialState: (data: CollaborationState) => void
  // Novos eventos para notificações em tempo real
  versionApproved: (
    projectId: string,
    deliverableId: string,
    versionId: string,
    approverName?: string
  ) => void
  versionRejected: (
    projectId: string,
    deliverableId: string,
    versionId: string,
    reason?: string
  ) => void
  newAssetAdded: (projectId: string, asset: any) => void
  newVideoVersionAdded: (
    projectId: string,
    deliverableId: string,
    version: VideoVersion
  ) => void
  timeCommentAdded: (
    projectId: string,
    deliverableId: string,
    commentId: string
  ) => void
  commentResolved: (
    projectId: string,
    deliverableId: string,
    commentId: string,
    resolved: boolean
  ) => void
}

export interface ClientToServerEvents {
  joinSession: (sessionId: string, user: CollaborationUser) => void
  leaveSession: () => void
  moveCursor: (position: { x: number; y: number }) => void
  setTyping: (isTyping: boolean) => void
  addComment: (comment: Comment) => void
  updateComment: (comment: Comment) => void
  deleteComment: (commentId: string) => void
  startAnnotation: (annotation: Annotation) => void
  updateAnnotation: (annotation: Annotation) => void
  completeAnnotation: (annotation: Annotation) => void
  deleteAnnotation: (annotationId: string) => void
  seekVideo: (time: number) => void
  playPauseVideo: (isPlaying: boolean) => void
  requestInitialState: () => void
  // Novos eventos para notificações em tempo real
  notifyVersionApproved: (
    projectId: string,
    deliverableId: string,
    versionId: string,
    approverName?: string
  ) => void
  notifyVersionRejected: (
    projectId: string,
    deliverableId: string,
    versionId: string,
    reason?: string
  ) => void
  notifyNewAssetAdded: (projectId: string, asset: any) => void
  notifyNewVideoVersionAdded: (
    projectId: string,
    deliverableId: string,
    version: VideoVersion
  ) => void
  notifyTimeCommentAdded: (
    projectId: string,
    deliverableId: string,
    commentId: string
  ) => void
  notifyCommentResolved: (
    projectId: string,
    deliverableId: string,
    commentId: string,
    resolved: boolean
  ) => void
}

export interface CollaborationUser {
  id: string
  name: string
  avatar?: string
  color: string
  role: string
}

export interface CollaborationState {
  users: CollaborationUser[]
  comments: Comment[]
  annotations: Annotation[]
  currentTime?: number
  isPlaying?: boolean
}

/**
 * Serviço Singleton para gerenciar conexões Socket.io
 * Implementa padrão Singleton para garantir apenas uma instância do socket em toda a aplicação
 */
class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null
  private connected = false
  private connectionInProgress = false
  private connectionAttempts = 0
  private maxReconnectAttempts = 5
  private authToken: string | null = null

  // Definir token de autenticação
  setAuthToken(token: string) {
    this.authToken = token
    return this
  }

  // Inicializar a conexão com o servidor Socket.IO
  connect(
    serverUrl: string = process.env.NEXT_PUBLIC_SOCKET_URL || '/socket.io'
  ) {
    if (this.connected) return this.socket
    if (this.connectionInProgress) {
      console.log('[Socket.io] Conexão já em andamento, aguardando...')
      return this.socket
    }

    this.connectionInProgress = true

    // Determina a URL correta para conexão
    // Se não começa com http ou https, assume que é um caminho relativo
    // e usa o proxy configurado no next.config.mjs
    const isRelativePath = !serverUrl.startsWith('http')

    // Configuração do Socket.io para lidar com CORS
    this.socket = io(serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      // Só definimos path quando usamos um caminho relativo (proxy)
      path: isRelativePath ? '/socket.io' : undefined,
      transports: ['websocket', 'polling'],
      timeout: 15000,
      auth: this.authToken ? { token: this.authToken } : undefined,
    })

    // Logs de conexão
    this.socket.on('connect', () => {
      console.log('[Socket.io] Conectado ao servidor de colaboração')
      this.connected = true
      this.connectionInProgress = false
      this.connectionAttempts = 0

      // Se temos token de autenticação, autenticamos após a conexão
      if (this.authToken) {
        this.authenticate()
      }
    })

    // Importante: Log detalhado de erros de conexão
    this.socket.on('connect_error', error => {
      this.connectionAttempts++

      console.error(
        `[Socket.io] Erro de conexão (tentativa ${this.connectionAttempts}/${this.maxReconnectAttempts}):`,
        error.message
      )

      if (error.message.includes('CORS') || error.message.includes('cors')) {
        console.error('[Socket.io] Erro de CORS detectado. Verifique:')
        console.error(
          '1. O servidor Socket.io tem CORS configurado corretamente?'
        )
        console.error(
          '2. O proxy no next.config.mjs está configurado corretamente?'
        )
        console.error(
          '3. Tente usar a conexão direta em produção com NEXT_PUBLIC_SOCKET_URL'
        )
      }

      if (this.connectionAttempts >= this.maxReconnectAttempts) {
        console.error(
          '[Socket.io] Número máximo de tentativas excedido. Desistindo...'
        )
        this.connectionInProgress = false
      }
    })

    // Log de desconexão
    this.socket.on('disconnect', reason => {
      console.log('[Socket.io] Desconectado do servidor:', reason)
      this.connected = false

      // Se for desconexão por erro, tentamos reconectar
      if (reason === 'io server disconnect') {
        // Desconexão foi iniciada pelo servidor, precisamos reconectar manualmente
        console.log('[Socket.io] Tentando reconectar manualmente...')
        this.socket?.connect()
      }
      // Se for qualquer outro motivo, o socket tentará reconectar automaticamente
    })

    // Monitor de eventos para depuração em modo de desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      this.socket.onAny((event, ...args) => {
        console.log(`[Socket.io] [DEV] Evento recebido: ${event}`, args)
      })
    }

    return this.socket
  }

  private createSocket(): void {
    const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    const socketPath = process.env.NEXT_PUBLIC_SOCKET_PATH
    
    this.socket = io(serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: socketPath || '/socket.io/',
      transports: ['websocket', 'polling'],
      timeout: 20000,
      auth: this.authToken ? { token: this.authToken } : undefined,
    })

    // Logs de conexão
    this.socket.on('connect', () => {
      console.log('[Socket.io] Conectado ao servidor de colaboração')
      this.connected = true
      this.connectionInProgress = false
      this.connectionAttempts = 0

      // Se temos token de autenticação, autenticamos após a conexão
      if (this.authToken) {
        this.authenticate()
      }
    })

    // Importante: Log detalhado de erros de conexão
    this.socket.on('connect_error', error => {
      this.connectionAttempts++

      console.error(
        `[Socket.io] Erro de conexão (tentativa ${this.connectionAttempts}/${this.maxReconnectAttempts}):`,
        error.message
      )

      if (error.message.includes('CORS') || error.message.includes('cors')) {
        console.error('[Socket.io] Erro de CORS detectado. Verifique:')
        console.error(
          '1. O servidor Socket.io tem CORS configurado corretamente?'
        )
        console.error(
          '2. O proxy no next.config.mjs está configurado corretamente?'
        )
        console.error(
          '3. Tente usar a conexão direta em produção com NEXT_PUBLIC_SOCKET_URL'
        )
      }

      if (this.connectionAttempts >= this.maxReconnectAttempts) {
        console.error(
          '[Socket.io] Número máximo de tentativas excedido. Desistindo...'
        )
        this.connectionInProgress = false
      }
    })

    // Log de desconexão
    this.socket.on('disconnect', reason => {
      console.log('[Socket.io] Desconectado do servidor:', reason)
      this.connected = false

      // Se for desconexão por erro, tentamos reconectar
      if (reason === 'io server disconnect') {
        // Desconexão foi iniciada pelo servidor, precisamos reconectar manualmente
        console.log('[Socket.io] Tentando reconectar manualmente...')
        this.socket?.connect()
      }
      // Se for qualquer outro motivo, o socket tentará reconectar automaticamente
    })

    // Monitor de eventos para depuração em modo de desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      this.socket.onAny((event, ...args) => {
        console.log(`[Socket.io] [DEV] Evento recebido: ${event}`, args)
      })
    }
  }

  // Desconectar do servidor
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
      this.connectionInProgress = false
      this.connectionAttempts = 0
    }
  }

  // Autenticar o usuário após a conexão
  private authenticate() {
    if (!this.socket || !this.authToken) return

    const [sessionId, userId] = this.parseToken(this.authToken)

    if (!sessionId || !userId) {
      console.error('[Socket.io] Token de autenticação inválido')
      return
    }

    this.socket.emit(
      'authenticate',
      {
        sessionId,
        userId,
        token: this.authToken,
      },
      (response: any) => {
        if (response && response.success) {
          console.log('[Socket.io] Autenticação bem-sucedida')
        } else {
          console.error(
            '[Socket.io] Erro de autenticação:',
            response?.error || 'Desconhecido'
          )
        }
      }
    )
  }

  // Analisar token (formato simplificado para exemplo)
  private parseToken(token: string): [string, string] {
    try {
      // Formato de exemplo: "session:user:signature"
      const parts = token.split(':')
      if (parts.length >= 2) {
        return [parts[0], parts[1]]
      }
    } catch (e) {
      console.error('[Socket.io] Erro ao analisar token', e)
    }
    return ['', '']
  }

  // Verificar status da conexão
  isConnected(): boolean {
    return this.connected && !!this.socket?.connected
  }

  // Entrar em uma sessão de colaboração
  joinSession(sessionId: string, user: CollaborationUser) {
    if (!this.socket) return
    this.socket.emit('joinSession', sessionId, user)
  }

  // Sair da sessão de colaboração
  leaveSession() {
    if (!this.socket) return
    this.socket.emit('leaveSession')
  }

  // Mover o cursor
  moveCursor(position: { x: number; y: number }) {
    if (!this.socket) return
    this.socket.emit('moveCursor', position)
  }

  // Definir estado de digitação
  setTyping(isTyping: boolean) {
    if (!this.socket) return
    this.socket.emit('setTyping', isTyping)
  }

  // Adicionar um comentário
  addComment(comment: Comment) {
    if (!this.socket) return
    this.socket.emit('addComment', comment)
  }

  // Atualizar um comentário
  updateComment(comment: Comment) {
    if (!this.socket) return
    this.socket.emit('updateComment', comment)
  }

  // Excluir um comentário
  deleteComment(commentId: string) {
    if (!this.socket) return
    this.socket.emit('deleteComment', commentId)
  }

  // Iniciar uma anotação
  startAnnotation(annotation: Annotation) {
    if (!this.socket) return
    this.socket.emit('startAnnotation', annotation)
  }

  // Atualizar uma anotação em progresso
  updateAnnotation(annotation: Annotation) {
    if (!this.socket) return
    this.socket.emit('updateAnnotation', annotation)
  }

  // Completar uma anotação
  completeAnnotation(annotation: Annotation) {
    if (!this.socket) return
    this.socket.emit('completeAnnotation', annotation)
  }

  // Excluir uma anotação
  deleteAnnotation(annotationId: string) {
    if (!this.socket) return
    this.socket.emit('deleteAnnotation', annotationId)
  }

  // Buscar no vídeo
  seekVideo(time: number) {
    if (!this.socket) return
    this.socket.emit('seekVideo', time)
  }

  // Reproduzir/pausar o vídeo
  playPauseVideo(isPlaying: boolean) {
    if (!this.socket) return
    this.socket.emit('playPauseVideo', isPlaying)
  }

  // Solicitar o estado inicial da sessão
  requestInitialState() {
    if (!this.socket) return
    this.socket.emit('requestInitialState')
  }

  // Obter o socket atual
  getSocket() {
    return this.socket
  }

  emit(event: string, ...args: unknown[]): void {
    if (this.socket?.connected) {
      this.socket.emit(event, ...args)
    }
  }
}

// Exportar a classe como default e uma instância singleton como export nomeado
export const socketService = new SocketService()
export default SocketService
