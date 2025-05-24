// Event interface - Para gerenciamento de eventos
export interface Event {
  id: string
  name: string
  date: string
  // Campos opcionais que podem ser úteis
  location?: string
  description?: string
  type?: string
}

// Phase interface - Para Timeline
export interface Phase {
  id: string
  name: string
  start: string
  end: string
  completed: boolean
  duration?: number
}

// Task interface - Para sistema de workflow
export type TaskStatus = 'pending' | 'completed'
export interface Task {
  id: string
  title: string
  status: TaskStatus
}

// VideoVersion interface - Para Sistema de Versões
export type VersionStatus =
  | 'pendingReview'
  | 'inReview'
  | 'approved'
  | 'rejected'
  | 'archived'
export interface VideoVersion {
  id: string
  name: string // ex: "v1", "v2", "Final"
  url: string // URL do arquivo de vídeo
  thumbnailUrl?: string
  uploadedAt: Date
  detectedAt?: Date // Data de detecção pelo watcher
  fileSize?: number // Tamanho do arquivo em bytes
  status?: VersionStatus // Status da versão
  active?: boolean // indica se esta versão é a atual/ativa
  approved?: boolean // indica se foi aprovada pelo cliente
  approvedBy?: string // nome/ID de quem aprovou
  approvalNotes?: string // observações da aprovação
  approvedAt?: string // data/hora da aprovação
  metadata?: {
    // Metadados adicionais da versão
    sourceType?: 'localWatcher' | 'manual' | 'api' | 'import'
    fileName?: string // Nome original do arquivo
    originalPath?: string // Caminho original do arquivo
    duration?: number // Duração do vídeo em segundos
    resolution?: string // Resolução do vídeo (ex: "1920x1080")
    codec?: string // Codec do vídeo
  }
}

// VideoDeliverable interface - Para Sistema de Versões
export type DeliverableStatus =
  | 'editing'
  | 'ready_for_review'
  | 'changes_requested'
  | 'approved'
  | 'archived'
export interface VideoDeliverable {
  id: string
  title: string
  description?: string
  versions: VideoVersion[]
  status?: DeliverableStatus
  comments?: Comment[]
  lastUpdated?: string // Data da última atualização
  dueDate?: string // Data de entrega
  assignedTo?: string[] // IDs dos usuários responsáveis
  tags?: string[] // Tags para categorização
}

export interface TeamMember {
  id: string
  name: string
  email?: string
  role: string
  avatar?: string
  addedAt?: string
}

export interface Project {
  id: string
  title: string
  name: string // Adicionamos para compatibilidade com o novo sistema
  description?: string
  clientId: string
  editorId: string
  createdAt: string
  updatedAt: string
  status:
    | 'draft'
    | 'review'
    | 'approved'
    | 'completed'
    | 'in_progress'
    | 'archived'
  videoUrl?: string
  thumbnailUrl?: string
  deadline?: string
  startDate?: string
  endDate?: string
  eventDate?: Date
  finalDueDate?: Date
  timeline: Phase[]
  videos: VideoDeliverable[]
  tasks?: Task[] // Adicionado para o sistema de tarefas
  events?: Event[] // Adicionado para gerenciar eventos associados ao projeto
  briefing?: {
    createdAt: string
    content: string
  } | null
  teamMembers?: TeamMember[] // Adicionado para gestão de equipe do projeto
  team?: number // Contador de membros da equipe
  annotations?: Annotation[] // Adicionado para suporte a anotações
  assets?: Asset[] // Adicionado para suporte a assets
  completed?: number // Adicionado para cálculo de progresso
  deliveries?: number // Adicionado para cálculo de progresso
  deliverables?: VideoDeliverable[] // Adicionado para entregáveis
  tags?: string[] // Adicionado para categorização
  client?: string // Adicionado para compatibilidade
  deliverySettings?: any // Substituir 'any' por tipo apropriado quando conhecido
}

export interface Comment {
  id: string
  projectId: string
  videoId?: string // ID do vídeo associado
  deliverableId?: string // ID do deliverable associado
  versionId?: string // ID específico da versão
  userId: string
  userAvatar?: string // URL do avatar do usuário
  userName?: string // Nome do usuário para exibição
  timestamp: number // timestamp no vídeo em segundos
  content: string
  createdAt: string
  resolved: boolean
  isPrivate?: boolean // Se o comentário é privado (interno)
  replies?: Comment[]
  attachments?: {
    // Anexos do comentário
    id: string
    type: 'image' | 'file'
    url: string
    name: string
  }[]
}

export interface Annotation {
  id: string
  projectId: string
  userId: string
  timestamp: number // timestamp no vídeo em segundos
  path: string // SVG path ou dados do desenho
  color: string
  createdAt: string
}

export interface Asset {
  id: string
  projectId: string
  name: string
  type: 'image' | 'video' | 'audio' | 'document' | 'font' | 'other'
  url: string
  thumbnailUrl?: string
  createdAt: string
  uploadedBy: string
  fileSize?: number // Tamanho do arquivo em bytes
  description?: string // Descrição do asset
  tags?: string[] // Tags para categorização
  metadata?: {
    // Metadados adicionais
    dimensions?: string // Dimensões (para imagens/vídeos)
    duration?: number // Duração (para áudio/vídeo)
    format?: string // Formato do arquivo
    location?: string // Localização de onde veio o asset
  }
  isShared?: boolean // Se o asset é compartilhado entre projetos
  relatedProjects?: string[] // IDs de projetos relacionados onde o asset é usado
}
