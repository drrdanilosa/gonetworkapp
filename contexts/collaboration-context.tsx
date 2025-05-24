'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { socketService } from '@/lib/socket-service'
import { Comment, Annotation } from '@/types/project'

interface CollaborationContextType {
  isConnected: boolean
  isJoined: boolean
  sessionId: string | null
  currentUser: CollaborationUser | null
  activeUsers: CollaborationUser[]
  userCursors: Record<string, { x: number; y: number }>
  typingUsers: string[]
  activeAnnotators: Record<string, Annotation>
  comments: Comment[]
  annotations: Annotation[]
  joinSession: (sessionId: string, userName: string, userRole: string) => void
  leaveSession: () => void
  addComment: (comment: Comment) => void
  updateComment: (comment: Comment) => void
  deleteComment: (commentId: string) => void
  startAnnotation: (annotation: Annotation) => void
  updateAnnotation: (annotation: Annotation) => void
  completeAnnotation: (annotation: Annotation) => void
  deleteAnnotation: (annotationId: string) => void
  setTyping: (isTyping: boolean) => void
  updateCursorPosition: (position: { x: number; y: number }) => void
  seekVideo: (time: number) => void
  playPauseVideo: (isPlaying: boolean) => void
  connectionError: Error | null
}

const CollaborationContext = createContext<
  CollaborationContextType | undefined
>(undefined)

// Cores para usuários
const USER_COLORS = [
  '#FF5733', // Vermelho
  '#33FF57', // Verde
  '#3357FF', // Azul
  '#FF33F5', // Rosa
  '#F5FF33', // Amarelo
  '#33FFF5', // Ciano
  '#FF8333', // Laranja
  '#8333FF', // Roxo
]

export function CollaborationProvider({
  children,
}: CollaborationProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<CollaborationUser | null>(null)
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([])
  const [userCursors, setUserCursors] = useState<
    Record<string, { x: number; y: number }>
  >({})
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [activeAnnotators, setActiveAnnotators] = useState<
    Record<string, Annotation>
  >({})
  const [comments, setComments] = useState<Comment[]>([])
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [connectionError, setConnectionError] = useState<Error | null>(null)

  const cursorUpdateThrottleRef = useRef<NodeJS.Timeout | null>(null)

  // Inicializar a conexão com o servidor Socket.IO
  useEffect(() => {
    const socketService = new SocketService()
    const socket = socketService.connect()
    if (!socket) return

    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      setIsJoined(false)
    })

    socket.on('connect_error', error => {
      setConnectionError(error)
    })

    socket.on('reconnect_attempt' as any, () => {
      setConnectionStatus('connecting')
    })

    return () => {
      socket.disconnect()
    }
  }, [projectId])

  // Configurar os listeners de eventos quando conectado
  useEffect(() => {
    if (!isConnected) return

    const socketService = new SocketService()
    const socket = socketService.getSocket()
    if (!socket) return

    // Evento quando um usuário entra na sessão
    socket.on('userJoined', user => {
      setActiveUsers(prev => [...prev.filter(u => u.id !== user.id), user])
    })

    // Evento quando um usuário sai da sessão
    socket.on('userLeft', userId => {
      setActiveUsers(prev => prev.filter(user => user.id !== userId))
      setUserCursors(prev => {
        const newCursors = { ...prev }
        delete newCursors[userId]
        return newCursors
      })
      setTypingUsers(prev => prev.filter(id => id !== userId))
      setActiveAnnotators(prev => {
        const newAnnotators = { ...prev }
        delete newAnnotators[userId]
        return newAnnotators
      })
    })

    // Evento quando um usuário move o cursor
    socket.on('userCursorMoved', (userId, position) => {
      setUserCursors(prev => ({
        ...prev,
        [userId]: position,
      }))
    })

    // Evento quando um usuário está digitando
    socket.on('userIsTyping', (userId, isTyping) => {
      setTypingUsers(prev =>
        isTyping
          ? [...prev.filter(id => id !== userId), userId]
          : prev.filter(id => id !== userId)
      )
    })

    // Evento quando um comentário é adicionado
    socket.on('commentAdded', comment => {
      setComments(prev => [...prev.filter(c => c.id !== comment.id), comment])
    })

    // Evento quando um comentário é atualizado
    socket.on('commentUpdated', comment => {
      setComments(prev => prev.map(c => (c.id === comment.id ? comment : c)))
    })

    // Evento quando um comentário é excluído
    socket.on('commentDeleted', commentId => {
      setComments(prev => prev.filter(comment => comment.id !== commentId))
    })

    // Evento quando uma anotação é iniciada
    socket.on('annotationStarted', (userId, annotation) => {
      setActiveAnnotators(prev => ({
        ...prev,
        [userId]: annotation,
      }))
    })

    // Evento quando uma anotação é atualizada
    socket.on('annotationUpdated', (userId, annotation) => {
      setActiveAnnotators(prev => ({
        ...prev,
        [userId]: annotation,
      }))
    })

    // Evento quando uma anotação é concluída
    socket.on('annotationCompleted', annotation => {
      setAnnotations(prev => [
        ...prev.filter(a => a.id !== annotation.id),
        annotation,
      ])
      setActiveAnnotators(prev => {
        const newAnnotators = { ...prev }
        // Remover a anotação ativa de qualquer usuário que tenha esta ID
        Object.keys(newAnnotators).forEach(userId => {
          if (newAnnotators[userId].id === annotation.id) {
            delete newAnnotators[userId]
          }
        })
        return newAnnotators
      })
    })

    // Evento quando uma anotação é excluída
    socket.on('annotationDeleted', annotationId => {
      setAnnotations(prev =>
        prev.filter(annotation => annotation.id !== annotationId)
      )
    })

    // Evento para receber o estado inicial da sessão
    socket.on('initialState', data => {
      setActiveUsers(data.users)
      setComments(data.comments)
      setAnnotations(data.annotations)
    })

    // Solicitar o estado inicial ao conectar
    // socketService.requestInitialState()

    return () => {
      // socketService.leaveSession()
      socket.disconnect()
    }
  }, [projectId])

  // Entrar em uma sessão de colaboração
  const joinSession = useCallback(
    (sessionId: string, userName: string, userRole: string) => {
      if (!isConnected) return

      // Gerar um ID único para o usuário
      const userId = uuidv4()

      // Atribuir uma cor aleatória ao usuário
      const colorIndex = Math.floor(Math.random() * USER_COLORS.length)
      const userColor = USER_COLORS[colorIndex]

      const user: CollaborationUser = {
        id: userId,
        name: userName,
        color: userColor,
        role: userRole,
      }

      setCurrentUser(user)
      setSessionId(sessionId)

      // Usar a instância de SocketService
      const socketService = new SocketService()
      socketService.joinSession(sessionId, user)

      setIsJoined(true)
    },
    [isConnected]
  )

  // Sair da sessão de colaboração
  const leaveSession = useCallback(() => {
    if (!isConnected || !isJoined) return

    SocketService.leaveSession()
    setIsJoined(false)
    setSessionId(null)
    setCurrentUser(null)
    setActiveUsers([])
    setUserCursors({})
    setTypingUsers([])
    setActiveAnnotators({})
    setComments([])
    setAnnotations([])
  }, [isConnected, isJoined])

  // Adicionar um comentário
  const addComment = useCallback(async (comment: Comment) => {
    try {
      // socketService.addComment(comment)
      setComments(prev => [...prev, comment])
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
    }
  }, [])

  // Atualizar um comentário
  const updateComment = useCallback(async (comment: Comment) => {
    try {
      // socketService.updateComment(comment)
      setComments(prev => prev.map(c => (c.id === comment.id ? comment : c)))
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error)
    }
  }, [])

  // Excluir um comentário
  const deleteComment = useCallback(async (commentId: string) => {
    try {
      // socketService.deleteComment(commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch (error) {
      console.error('Erro ao deletar comentário:', error)
    }
  }, [])

  // Iniciar uma anotação
  const startAnnotation = useCallback(async (annotation: Annotation) => {
    try {
      // socketService.startAnnotation(annotation)
      setActiveAnnotations(prev => [...prev, annotation])
    } catch (error) {
      console.error('Erro ao iniciar anotação:', error)
    }
  }, [])

  // Atualizar uma anotação em progresso
  const updateAnnotation = useCallback(async (annotation: Annotation) => {
    try {
      // socketService.updateAnnotation(annotation)
      setActiveAnnotations(prev =>
        prev.map(a => (a.id === annotation.id ? annotation : a))
      )
    } catch (error) {
      console.error('Erro ao atualizar anotação:', error)
    }
  }, [])

  // Completar uma anotação
  const completeAnnotation = useCallback(async (annotation: Annotation) => {
    try {
      // socketService.completeAnnotation(annotation)
      setActiveAnnotations(prev => prev.filter(a => a.id !== annotation.id))
    } catch (error) {
      console.error('Erro ao completar anotação:', error)
    }
  }, [])

  // Excluir uma anotação
  const deleteAnnotation = useCallback(async (annotationId: string) => {
    try {
      // socketService.deleteAnnotation(annotationId)
      setActiveAnnotations(prev => prev.filter(a => a.id !== annotationId))
    } catch (error) {
      console.error('Erro ao deletar anotação:', error)
    }
  }, [])

  // Definir estado de digitação
  const setTyping = useCallback(async (isTyping: boolean) => {
    try {
      // socketService.setTyping(isTyping)
    } catch (error) {
      console.error('Erro ao definir status de digitação:', error)
    }
  }, [])

  // Atualizar a posição do cursor com throttling
  const updateCursorPosition = useCallback(
    (position: { x: number; y: number }) => {
      if (!isConnected || !isJoined || !currentUser) return

      if (cursorUpdateThrottleRef.current) {
        clearTimeout(cursorUpdateThrottleRef.current)
      }

      cursorUpdateThrottleRef.current = setTimeout(() => {
        SocketService.moveCursor(position)
        cursorUpdateThrottleRef.current = null
      }, 50) // Limitar a 20 atualizações por segundo
    },
    [isConnected, isJoined, currentUser]
  )

  // Buscar no vídeo
  const seekVideo = useCallback(async (time: number) => {
    try {
      // socketService.seekVideo(time)
    } catch (error) {
      console.error('Erro ao buscar vídeo:', error)
    }
  }, [])

  // Reproduzir/pausar o vídeo
  const playPauseVideo = useCallback(async (isPlaying: boolean) => {
    try {
      // socketService.playPauseVideo(isPlaying)
    } catch (error) {
      console.error('Erro ao play/pause vídeo:', error)
    }
  }, [])

  const value = {
    isConnected,
    isJoined,
    sessionId,
    currentUser,
    activeUsers,
    userCursors,
    typingUsers,
    activeAnnotators,
    comments,
    annotations,
    joinSession,
    leaveSession,
    addComment,
    updateComment,
    deleteComment,
    startAnnotation,
    updateAnnotation,
    completeAnnotation,
    deleteAnnotation,
    setTyping,
    updateCursorPosition,
    seekVideo,
    playPauseVideo,
    connectionError,
  }

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  )
}

export const useCollaboration = () => {
  const context = useContext(CollaborationContext)
  if (context === undefined) {
    throw new Error(
      'useCollaboration must be used within a CollaborationProvider'
    )
  }
  return context
}
