// Import necessário para as interfaces
import { Event } from './event'
import { Video, VideoStatusUpdate } from './video'

export interface TimelineItem {
  id: string
  title: string
  description?: string
  timestamp: string
  status: string
  type: 'event' | 'video' | 'review' | 'update'
  metadata?: Record<string, unknown>
}

export interface DetailedTimelineViewProps {
  items: TimelineItem[]
  loading?: boolean
  onItemClick?: (item: TimelineItem) => void
  onLoadMore?: () => void
  hasMore?: boolean
}

export interface EventWidgetProps {
  event: Event
  videos?: Video[]
  onEventUpdate?: (event: Event) => void
  onVideoStatusChange?: (videoId: string, status: VideoStatusUpdate) => void
  readonly?: boolean
}
