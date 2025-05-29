export interface Video {
  id: string
  eventId: string
  fileName: string
  filePath: string
  status: 'pendente' | 'em-revisao' | 'revisado' | 'aprovado' | 'rejeitado'
  createdAt: string
  updatedAt: string
  fileSize?: number
  duration?: number
  format?: string
  thumbnailPath?: string
  [key: string]: unknown
}

export interface VideoStatusUpdate {
  status: Video['status']
  comment: string
  reviewer: string
  reviewedAt?: string
}

export interface CreateVideoRequest {
  eventId: string
  fileName: string
  filePath: string
  status?: Video['status']
  fileSize?: number
  duration?: number
  format?: string
}

export interface UpdateVideoRequest {
  fileName?: string
  filePath?: string
  status?: Video['status']
  fileSize?: number
  duration?: number
  format?: string
  thumbnailPath?: string
}
