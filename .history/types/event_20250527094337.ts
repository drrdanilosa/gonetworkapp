export interface Event {
  id: string
  title: string
  client: string
  status: 'pendente' | 'em-andamento' | 'concluido' | 'cancelado'
  date: string
  createdAt: string
  updatedAt: string
  description?: string
  location?: string
  [key: string]: unknown
}

export interface CreateEventRequest {
  title: string
  client: string
  status?: Event['status']
  date: string
  description?: string
  location?: string
}

export interface UpdateEventRequest {
  title?: string
  client?: string
  status?: Event['status']
  date?: string
  description?: string
  location?: string
}

export interface EventListResponse {
  events: Event[]
  total: number
  page?: number
  limit?: number
}
