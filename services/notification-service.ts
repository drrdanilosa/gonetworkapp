// services/notification-service.ts
'use client'

'use client'

import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'

// Interface para dados de notificação
export interface NotificationData {
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Tipos de eventos do sistema de vídeo
export enum VideoEventType {
  UPLOAD = 'video_upload',
  APPROVAL = 'video_approval',
  REJECTION = 'video_rejection',
  PROCESSING = 'video_processing',
  COMMENT = 'video_comment',
  READY = 'video_ready',
  ERROR = 'video_error',
}

// Classe do serviço de notificações
class NotificationService {
  // Método para enviar notificação
  notify(data: NotificationData): void {
    const { addNotification } = useUIStore.getState()

    addNotification(
      data.message,
      data.type || 'info',
      data.duration || 5000,
      data.action
    )

    // Registrar notificação no histórico (se implementado)
    this.logNotification(data)
  }

  // Método para registrar notificação (para histórico)
  private logNotification(data: NotificationData): void {
    // Aqui poderíamos implementar registro em banco de dados
    // ou enviar para um serviço de analytics
    console.log(`[Notification] ${data.title}: ${data.message}`)
  }

  // Notificações específicas para eventos de vídeo
  notifyVideoEvent(
    eventType: VideoEventType,
    projectId: string,
    projectName: string,
    versionInfo: {
      id: string
      name: string
    },
    additionalInfo?: Record<string, any>
  ): void {
    const currentUser = useAuthStore.getState().user

    // Definir mensagens de acordo com o tipo de evento
    let notification: NotificationData = {
      title: '',
      message: '',
      type: 'info',
    }

    switch (eventType) {
      case VideoEventType.UPLOAD:
        notification = {
          title: 'Novo vídeo disponível',
          message: `Um novo vídeo "${versionInfo.name}" foi adicionado ao projeto "${projectName}"`,
          type: 'info',
          action: {
            label: 'Visualizar',
            onClick: () => {
              window.location.href = `/eventos/${projectId}/aprovacao`
            },
          },
        }
        break

      case VideoEventType.APPROVAL:
        notification = {
          title: 'Vídeo aprovado',
          message: `A versão "${versionInfo.name}" foi aprovada por ${additionalInfo?.approvedBy || 'um usuário'}`,
          type: 'success',
          action: {
            label: 'Detalhes',
            onClick: () => {
              window.location.href = `/eventos/${projectId}/aprovacao`
            },
          },
        }
        break

      case VideoEventType.REJECTION:
        notification = {
          title: 'Alterações solicitadas',
          message: `Alterações foram solicitadas para o vídeo "${versionInfo.name}"${
            additionalInfo?.reason ? `: ${additionalInfo.reason}` : ''
          }`,
          type: 'warning',
          action: {
            label: 'Visualizar feedback',
            onClick: () => {
              window.location.href = `/eventos/${projectId}/aprovacao`
            },
          },
        }
        break

      case VideoEventType.PROCESSING:
        notification = {
          title: 'Vídeo em processamento',
          message: `O vídeo "${versionInfo.name}" está sendo processado`,
          type: 'info',
        }
        break

      case VideoEventType.COMMENT:
        notification = {
          title: 'Novo comentário',
          message: `${additionalInfo?.author || 'Alguém'} comentou no vídeo "${versionInfo.name}"`,
          type: 'info',
          action: {
            label: 'Ver comentário',
            onClick: () => {
              window.location.href = `/eventos/${projectId}/aprovacao`
            },
          },
        }
        break

      case VideoEventType.READY:
        notification = {
          title: 'Vídeo pronto para revisão',
          message: `O vídeo "${versionInfo.name}" está pronto para ser revisado`,
          type: 'success',
          action: {
            label: 'Revisar agora',
            onClick: () => {
              window.location.href = `/eventos/${projectId}/aprovacao`
            },
          },
        }
        break

      case VideoEventType.ERROR:
        notification = {
          title: 'Erro no processamento',
          message: `Ocorreu um erro ao processar o vídeo "${versionInfo.name}"`,
          type: 'error',
          action: {
            label: 'Ver detalhes',
            onClick: () => {
              window.location.href = `/eventos/${projectId}/aprovacao`
            },
          },
        }
        break

      default:
        notification = {
          title: 'Atualização de vídeo',
          message: `O vídeo "${versionInfo.name}" foi atualizado`,
          type: 'info',
        }
    }

    // Disparar a notificação
    this.notify(notification)
  }
}

// Criar e exportar instância singleton
export const notificationService = new NotificationService()
export default notificationService
