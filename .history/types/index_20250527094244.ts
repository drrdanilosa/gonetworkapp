// types/index.ts - Barrel export
// Import dos tipos para as type guards
import { Event } from './event'
import { Video, VideoStatusUpdate } from './video'

export * from './event'
export * from './video'
export * from './api'
export * from './component'
export * from './database'

// Utility functions para type guards
export function isEvent(obj: unknown): obj is Event {
  return typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).title === 'string' &&
    typeof (obj as any).client === 'string'
}

export function isVideo(obj: unknown): obj is Video {
  return typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).fileName === 'string' &&
    typeof (obj as any).filePath === 'string'
}

export function isVideoStatusUpdate(obj: unknown): obj is VideoStatusUpdate {
  return typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).status === 'string' &&
    typeof (obj as any).comment === 'string' &&
    typeof (obj as any).reviewer === 'string'
}
