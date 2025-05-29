// types/index.ts - Barrel export
// Import dos tipos para as type guards
import type { Event } from './event'
import type { Video, VideoStatusUpdate } from './video'

export * from './event'
export * from './video'
export * from './api'
export * from './component'
export * from './database'

// Utility functions para type guards
export function isEvent(obj: unknown): obj is Event {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Event).id === 'string' &&
    typeof (obj as Event).title === 'string' &&
    typeof (obj as Event).client === 'string'
  )
}

export function isVideo(obj: unknown): obj is Video {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Video).id === 'string' &&
    typeof (obj as Video).fileName === 'string' &&
    typeof (obj as Video).filePath === 'string'
  )
}

export function isVideoStatusUpdate(obj: unknown): obj is VideoStatusUpdate {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as VideoStatusUpdate).status === 'string' &&
    typeof (obj as VideoStatusUpdate).comment === 'string' &&
    typeof (obj as VideoStatusUpdate).reviewer === 'string'
  )
}
