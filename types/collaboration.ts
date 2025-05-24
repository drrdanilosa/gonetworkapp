export interface CollaborationUser {
  id: string
  name: string
  avatar?: string
  color: string
  isActive: boolean
  cursor?: {
    x: number
    y: number
  }
  isTyping?: boolean
}

export interface CollaborationProviderProps {
  children: React.ReactNode
  projectId: string
}
