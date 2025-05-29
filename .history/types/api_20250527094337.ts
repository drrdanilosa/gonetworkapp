export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
}

export interface ApiError {
  success: false
  error: string
  message: string
  statusCode: number
  timestamp: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface SearchParams extends PaginationParams {
  q?: string
  status?: string
  client?: string
  dateFrom?: string
  dateTo?: string
}

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
  updatedAt?: string
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
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
