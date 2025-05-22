import { socketService } from './socket-service'
import type { Asset, VideoVersion } from '@/types/project'

/**
 * Classe para estender o serviço de socket.io com funcionalidades de notificação em tempo real
 */
class SocketNotificationService {
  // Singleton para garantir apenas uma instância
  private static instance: SocketNotificationService

  // Construtor privado para impedir instanciação direta
  private constructor() {}

  // Método para obter a instância singleton
  public static getInstance(): SocketNotificationService {
    if (!SocketNotificationService.instance) {
      SocketNotificationService.instance = new SocketNotificationService()
    }
    return SocketNotificationService.instance
  }

  // Notificação de aprovação de versão de vídeo
  public notifyVersionApproved(
    projectId: string,
    deliverableId: string,
    versionId: string,
    approverName?: string
  ): void {
    const socket = socketService.getSocket()
    if (!socket) return

    console.log(`[Socket] Notificando aprovação de versão: ${versionId}`)

    // Evento personalizado para o servidor
    socket.emit(
      'notifyVersionApproved',
      projectId,
      deliverableId,
      versionId,
      approverName
    )
  }

  // Notificação de rejeição de versão de vídeo
  public notifyVersionRejected(
    projectId: string,
    deliverableId: string,
    versionId: string,
    reason?: string
  ): void {
    const socket = socketService.getSocket()
    if (!socket) return

    console.log(`[Socket] Notificando rejeição de versão: ${versionId}`)

    socket.emit(
      'notifyVersionRejected',
      projectId,
      deliverableId,
      versionId,
      reason
    )
  }

  // Notificação de novo asset adicionado
  public notifyNewAssetAdded(projectId: string, asset: Asset): void {
    const socket = socketService.getSocket()
    if (!socket) return

    console.log(`[Socket] Notificando novo asset: ${asset.name}`)

    socket.emit('notifyNewAssetAdded', projectId, {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      url: asset.url, // URL temporária, será substituída no servidor
    })
  }

  // Notificação de nova versão de vídeo
  public notifyNewVideoVersionAdded(
    projectId: string,
    deliverableId: string,
    version: VideoVersion
  ): void {
    const socket = socketService.getSocket()
    if (!socket) return

    console.log(`[Socket] Notificando nova versão de vídeo: ${version.name}`)

    socket.emit('notifyNewVideoVersionAdded', projectId, deliverableId, {
      id: version.id,
      name: version.name,
      uploadedAt: version.uploadedAt,
    })
  }

  // Notificação de novo comentário temporal
  public notifyTimeCommentAdded(
    projectId: string,
    deliverableId: string,
    commentId: string
  ): void {
    const socket = socketService.getSocket()
    if (!socket) return

    console.log(`[Socket] Notificando novo comentário: ${commentId}`)

    socket.emit('notifyTimeCommentAdded', projectId, deliverableId, commentId)
  }

  // Notificação de resolução de comentário
  public notifyCommentResolved(
    projectId: string,
    deliverableId: string,
    commentId: string,
    resolved: boolean
  ): void {
    const socket = socketService.getSocket()
    if (!socket) return

    console.log(
      `[Socket] Notificando resolução de comentário: ${commentId} (${resolved ? 'resolvido' : 'não resolvido'})`
    )

    socket.emit(
      'notifyCommentResolved',
      projectId,
      deliverableId,
      commentId,
      resolved
    )
  }

  // Registrar handlers para eventos de notificação
  public registerNotificationHandlers(callbacks: {
    onVersionApproved?: (
      projectId: string,
      deliverableId: string,
      versionId: string,
      approverName?: string
    ) => void
    onVersionRejected?: (
      projectId: string,
      deliverableId: string,
      versionId: string,
      reason?: string
    ) => void
    onNewAssetAdded?: (projectId: string, asset: any) => void
    onNewVideoVersionAdded?: (
      projectId: string,
      deliverableId: string,
      version: any
    ) => void
    onTimeCommentAdded?: (
      projectId: string,
      deliverableId: string,
      commentId: string
    ) => void
    onCommentResolved?: (
      projectId: string,
      deliverableId: string,
      commentId: string,
      resolved: boolean
    ) => void
  }): void {
    const socket = socketService.getSocket()
    if (!socket) return

    if (callbacks.onVersionApproved) {
      socket.on('versionApproved', callbacks.onVersionApproved)
    }

    if (callbacks.onVersionRejected) {
      socket.on('versionRejected', callbacks.onVersionRejected)
    }

    if (callbacks.onNewAssetAdded) {
      socket.on('newAssetAdded', callbacks.onNewAssetAdded)
    }

    if (callbacks.onNewVideoVersionAdded) {
      socket.on('newVideoVersionAdded', callbacks.onNewVideoVersionAdded)
    }

    if (callbacks.onTimeCommentAdded) {
      socket.on('timeCommentAdded', callbacks.onTimeCommentAdded)
    }

    if (callbacks.onCommentResolved) {
      socket.on('commentResolved', callbacks.onCommentResolved)
    }
  }

  // Remover handlers de notificação
  public removeNotificationHandlers(): void {
    const socket = socketService.getSocket()
    if (!socket) return

    socket.off('versionApproved')
    socket.off('versionRejected')
    socket.off('newAssetAdded')
    socket.off('newVideoVersionAdded')
    socket.off('timeCommentAdded')
    socket.off('commentResolved')
  }
}

// Exportar a instância singleton
export const socketNotificationService = SocketNotificationService.getInstance()
export default socketNotificationService
