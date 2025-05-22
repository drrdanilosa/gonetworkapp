export const VIDEO_FORMATS = ['mp4', 'mov', 'avi', 'mkv', 'webm'] as const

export const COMMENT_TYPES = [
  'general',
  'technical',
  'creative',
  'approval',
] as const

export const PROJECT_STATUS = [
  'draft',
  'active',
  'completed',
  'archived',
] as const

export const USER_ROLES = ['admin', 'editor', 'viewer'] as const

export const PRIORITY_LEVELS = ['low', 'medium', 'high'] as const

export const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB
export const MAX_UPLOAD_FILES = 10
export const DEFAULT_VIDEO_QUALITY = '720p'
export const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US'] as const
