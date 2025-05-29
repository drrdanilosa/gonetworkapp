export interface DatabaseEvent {
  id: string
  title: string
  client: string
  status: string
  date: Date
  created_at: Date
  updated_at: Date
  description?: string
  location?: string
}

export interface DatabaseVideo {
  id: string
  event_id: string
  file_name: string
  file_path: string
  status: string
  created_at: Date
  updated_at: Date
  file_size?: number
  duration?: number
  format?: string
  thumbnail_path?: string
}

// Utility types para conversão entre Database e API
export type EventFromDatabase = Omit<DatabaseEvent, 'created_at' | 'updated_at'> & {
  createdAt: string
  updatedAt: string
}

export type VideoFromDatabase = Omit<DatabaseVideo, 'event_id' | 'file_name' | 'file_path' | 'created_at' | 'updated_at' | 'file_size' | 'thumbnail_path'> & {
  eventId: string
  fileName: string
  filePath: string
  createdAt: string
  updatedAt: string
  fileSize?: number
  thumbnailPath?: string
}
