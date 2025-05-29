// types/api.ts - Tipos para APIs

// Auth API Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    name: string
    email: string
    role: string
    avatar?: string
    color?: string
  }
  accessToken: string
  refreshToken: string
}

// Events API Types
export interface CreateEventRequest {
  title: string
  client?: string
  description?: string
  date?: string
}

export interface UpdateEventRequest {
  title?: string
  client?: string
  description?: string
  date?: string
}

// Briefings API Types
export interface CreateBriefingRequest {
  eventId: string
  title?: string
  client?: string
  description?: string
}

export interface UpdateBriefingRequest {
  title?: string
  client?: string
  description?: string
}

// Team API Types
export interface TeamMember {
  id: string
  name: string
  role: string
  email?: string
  avatar?: string
  status?: 'active' | 'inactive'
  addedAt?: string
}

export interface TeamMemberRequest {
  members?: TeamMember[]
  member?: TeamMember
}

export interface UpdateTeamMemberRequest {
  memberId: string
  updates: Partial<TeamMember>
}

// Video API Types
export interface CreateVideoRequest {
  fileName: string
  filePath: string
  status: string
}

export interface UpdateVideoStatusRequest {
  status: string
  comment?: string
  reviewer?: string
}

// Common API Response Type
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
