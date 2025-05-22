"use client"

import { useRef } from "react"
import CommentMarker from "./comment-marker"

export interface Comment {
  id: string
  time: number
  text: string
  isResolved: boolean
  author: string
  createdAt: string
  colorCategory?: string
}

interface CommentMarkersTimelineProps {
  comments: Comment[]
  duration: number
  onMarkerClick: (id: string, time: number) => void
  className?: string
}

export default function CommentMarkersTimeline({
  comments,
  duration,
  onMarkerClick,
  className,
}: CommentMarkersTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className={`relative h-8 bg-secondary/30 rounded-md ${className || ""}`}>
      {comments.map((comment) => (
        <CommentMarker
          key={comment.id}
          id={comment.id}
          time={comment.time}
          duration={duration}
          isResolved={comment.isResolved}
          commentText={comment.text}
          colorCategory={comment.colorCategory}
          onClick={onMarkerClick}
        />
      ))}
    </div>
  )
}
