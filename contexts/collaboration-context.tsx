"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { socketService as defaultSocketService, type CollaborationUser } from "@/lib/socket-service"
import SocketService from "@/lib/socket-service"
import useSocket from "@/hooks/use-socket"
import type { Comment } from "@/components/video/comment-markers-timeline"
import type { Annotation } from "@/components/video/annotation-canvas"
import { v4 as uuidv4 } from "uuid"

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

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined)

// Cores para usuários
const USER_COLORS = [
  "#FF5733", // Vermelho
  "#33FF57", // Verde
  "#3357FF", // Azul
  "#FF33F5", // Rosa
  "#F5FF33", // Amarelo
  "#33FFF5", // Ciano
  "#FF8333", // Laranja
  "#8333FF", // Roxo
]

export const CollaborationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<CollaborationUser | null>(null)
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([])
  const [userCursors, setUserCursors] = useState<Record<string, { x: number; y: number }>>({})
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [activeAnnotators, setActiveAnnotators] = useState<Record<string, Annotation>>({})
  const [comments, setComments] = useState<Comment[]>([])
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [connectionError, setConnectionError] = useState<Error | null>(null)

  const cursorUpdateThrottleRef = useRef<NodeJS.Timeout | null>(null)

  // Inicializar a conexão com o servidor Socket.IO
  useEffect(() => {
    const socketService = new SocketService();
    const socket = socketService.connect();
    if (!socket) return;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setIsJoined(false);
    });

    socket.on("connect_error", (error) => {
      setConnectionError(error);
    });

    socket.on("reconnect_attempt", () => {
      setConnectionError(null);
    });

    return () => {
      socketService.disconnect();
    };
  }, [])

  // Configurar os listeners de eventos quando conectado
  useEffect(() => {
    if (!isConnected) return

    const socketService = new SocketService();
    const socket = socketService.getSocket()
    if (!socket) return

    // Evento quando um usuário entra na sessão
    socket.on("userJoined", (user) => {
      setActiveUsers((prev) => [...prev.filter((u) => u.id !== user.id), user])
    })

    // Evento quando um usuário sai da sessão
    socket.on("userLeft", (userId) => {
      setActiveUsers((prev) => prev.filter((user) => user.id !== userId))
      setUserCursors((prev) => {
        const newCursors = { ...prev }
        delete newCursors[userId]
        return newCursors
      })
      setTypingUsers((prev) => prev.filter((id) => id !== userId))
      setActiveAnnotators((prev) => {
        const newAnnotators = { ...prev }
        delete newAnnotators[userId]
        return newAnnotators
      })
    })

    // Evento quando um usuário move o cursor
    socket.on("userCursorMoved", (userId, position) => {
      setUserCursors((prev) => ({
        ...prev,
        [userId]: position,
      }))
    })

    // Evento quando um usuário está digitando
    socket.on("userIsTyping", (userId, isTyping) => {
      setTypingUsers((prev) =>
        isTyping ? [...prev.filter((id) => id !== userId), userId] : prev.filter((id) => id !== userId),
      )
    })

    // Evento quando um comentário é adicionado
    socket.on("commentAdded", (comment) => {
      setComments((prev) => [...prev.filter((c) => c.id !== comment.id), comment])
    })

    // Evento quando um comentário é atualizado
    socket.on("commentUpdated", (comment) => {
      setComments((prev) => prev.map((c) => (c.id === comment.id ? comment : c)))
    })

    // Evento quando um comentário é excluído
    socket.on("commentDeleted", (commentId) => {
      setComments((prev) => prev.filter((comment) => comment.id !== commentId))
    })

    // Evento quando uma anotação é iniciada
    socket.on("annotationStarted", (userId, annotation) => {
      setActiveAnnotators((prev) => ({
        ...prev,
        [userId]: annotation,
      }))
    })

    // Evento quando uma anotação é atualizada
    socket.on("annotationUpdated", (userId, annotation) => {
      setActiveAnnotators((prev) => ({
        ...prev,
        [userId]: annotation,
      }))
    })

    // Evento quando uma anotação é concluída
    socket.on("annotationCompleted", (annotation) => {
      setAnnotations((prev) => [...prev.filter((a) => a.id !== annotation.id), annotation])
      setActiveAnnotators((prev) => {
        const newAnnotators = { ...prev }
        // Remover a anotação ativa de qualquer usuário que tenha esta ID
        Object.keys(newAnnotators).forEach((userId) => {
          if (newAnnotators[userId].id === annotation.id) {
            delete newAnnotators[userId]
          }
        })
        return newAnnotators
      })
    })

    // Evento quando uma anotação é excluída
    socket.on("annotationDeleted", (annotationId) => {
      setAnnotations((prev) => prev.filter((annotation) => annotation.id !== annotationId))
    })

    // Evento para receber o estado inicial da sessão
    socket.on("initialState", (data) => {
      setActiveUsers(data.users)
      setComments(data.comments)
      setAnnotations(data.annotations)
    })

    // Solicitar o estado inicial ao conectar
    SocketService.requestInitialState()

    return () => {
      socket.off("userJoined")
      socket.off("userLeft")
      socket.off("userCursorMoved")
      socket.off("userIsTyping")
      socket.off("commentAdded")
      socket.off("commentUpdated")
      socket.off("commentDeleted")
      socket.off("annotationStarted")
      socket.off("annotationUpdated")
      socket.off("annotationCompleted")
      socket.off("annotationDeleted")
      socket.off("initialState")
    }
  }, [isConnected])

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
    [isConnected],
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
  const addComment = useCallback(
    (comment: Comment) => {
      if (!isConnected || !isJoined || !currentUser) return

      SocketService.addComment(comment)
    },
    [isConnected, isJoined, currentUser],
  )

  // Atualizar um comentário
  const updateComment = useCallback(
    (comment: Comment) => {
      if (!isConnected || !isJoined || !currentUser) return

      SocketService.updateComment(comment)
    },
    [isConnected, isJoined, currentUser],
  )

  // Excluir um comentário
  const deleteComment = useCallback(
    (commentId: string) => {
      if (!isConnected || !isJoined || !currentUser) return

      SocketService.deleteComment(commentId)
    },
    [isConnected, isJoined, currentUser],
  )

  // Iniciar uma anotação
  const startAnnotation = useCallback(
    (annotation: Annotation) => {
      if (!isConnected || !isJoined || !currentUser) return

      SocketService.startAnnotation(annotation)
    },
    [isConnected, isJoined, currentUser],
  )

  // Atualizar uma anotação em progresso
  const updateAnnotation = useCallback(
    (annotation: Annotation) => {
      if (!isConnected || !isJoined || !currentUser) return

      SocketService.updateAnnotation(annotation)
    },
    [isConnected, isJoined, currentUser],
  )

  // Completar uma anotação
  const completeAnnotation = useCallback(
    (annotation: Annotation) => {
      if (!isConnected || !isJoined || !currentUser) return

      SocketService.completeAnnotation(annotation)
    },
    [isConnected, isJoined, currentUser],
  )

  // Excluir uma anotação
  const deleteAnnotation = useCallback(
    (annotationId: string) => {
      if (!isConnected || !isJoined || !currentUser) return

      SocketService.deleteAnnotation(annotationId)
    },
    [isConnected, isJoined, currentUser],
  )

  // Definir estado de digitação
  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!isConnected || !isJoined || !currentUser) return

      SocketService.setTyping(isTyping)
    },
    [isConnected, isJoined, currentUser],
  )

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
    [isConnected, isJoined, currentUser],
  )

  // Buscar no vídeo
  const seekVideo = useCallback(
    (time: number) => {
      if (!isConnected || !isJoined || !currentUser) return

      SocketService.seekVideo(time)
    },
    [isConnected, isJoined, currentUser],
  )

  // Reproduzir/pausar o vídeo
  const playPauseVideo = useCallback(
    (isPlaying: boolean) => {
      if (!isConnected || !isJoined || !currentUser) return

      SocketService.playPauseVideo(isPlaying)
    },
    [isConnected, isJoined, currentUser],
  )

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

  return <CollaborationContext.Provider value={value}>{children}</CollaborationContext.Provider>
}

export const useCollaboration = () => {
  const context = useContext(CollaborationContext)
  if (context === undefined) {
    throw new Error("useCollaboration must be used within a CollaborationProvider")
  }
  return context
}
