"use client"

import { useRef, useState, useEffect, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { Maximize2, Minimize2, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import AnnotationCanvas, { type Annotation, type AnnotationTool } from "./annotation-canvas"
import AnnotationToolbar from "./annotation-toolbar"
import RemoteCursors from "@/components/collaboration/remote-cursors"
import RemoteAnnotations from "@/components/collaboration/remote-annotations"
import { useCollaboration } from "@/contexts/collaboration-context"

interface VideoPlayerProps {
  src: string
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onSeek?: (time: number) => void
  onAnnotationCreate?: (annotation: Annotation) => void
  onAnnotationUpdate?: (annotation: Annotation) => void
  onAnnotationDelete?: (id: string) => void
  annotations?: Annotation[]
  className?: string
  autoPlay?: boolean
}

const VideoPlayer = forwardRef<HTMLDivElement, VideoPlayerProps>(
  (
    {
      src,
      onTimeUpdate,
      onSeek,
      onAnnotationCreate,
      onAnnotationUpdate,
      onAnnotationDelete,
      annotations = [],
      className,
      autoPlay = false,
    },
    ref,
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(80)
    const [isMuted, setIsMuted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [videoWidth, setVideoWidth] = useState(0)
    const [videoHeight, setVideoHeight] = useState(0)

    // Annotation state
    const [isAnnotationMode, setIsAnnotationMode] = useState(false)
    const [selectedTool, setSelectedTool] = useState<AnnotationTool>("pen")
    const [selectedColor, setSelectedColor] = useState("#ff0000")
    const [selectedThickness, setSelectedThickness] = useState(3)

    // Collaboration state
    const {
      isJoined,
      currentUser,
      updateCursorPosition,
      startAnnotation,
      updateAnnotation,
      completeAnnotation,
      playPauseVideo,
      seekVideo,
    } = useCollaboration()

    useEffect(() => {
      const video = videoRef.current
      if (!video) return

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime)
        onTimeUpdate?.(video.currentTime, video.duration)
      }

      const handleDurationChange = () => {
        setDuration(video.duration)
      }

      const handlePlay = () => {
        setIsPlaying(true)
        if (isJoined) {
          playPauseVideo(true)
        }
      }

      const handlePause = () => {
        setIsPlaying(false)
        if (isJoined) {
          playPauseVideo(false)
        }
      }

      const handleVolumeChange = () => setVolume(video.volume * 100)

      const handleResize = () => {
        if (video) {
          setVideoWidth(video.clientWidth)
          setVideoHeight(video.clientHeight)
        }
      }

      video.addEventListener("timeupdate", handleTimeUpdate)
      video.addEventListener("durationchange", handleDurationChange)
      video.addEventListener("play", handlePlay)
      video.addEventListener("pause", handlePause)
      video.addEventListener("volumechange", handleVolumeChange)
      video.addEventListener("loadedmetadata", handleResize)
      window.addEventListener("resize", handleResize)

      // Inicializar as dimensões
      handleResize()

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate)
        video.removeEventListener("durationchange", handleDurationChange)
        video.removeEventListener("play", handlePlay)
        video.removeEventListener("pause", handlePause)
        video.removeEventListener("volumechange", handleVolumeChange)
        video.removeEventListener("loadedmetadata", handleResize)
        window.removeEventListener("resize", handleResize)
      }
    }, [onTimeUpdate, isJoined, playPauseVideo])

    useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement)
      }

      document.addEventListener("fullscreenchange", handleFullscreenChange)
      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange)
      }
    }, [])

    // Pausar o vídeo quando entrar no modo de anotação
    useEffect(() => {
      if (isAnnotationMode && isPlaying) {
        const video = videoRef.current
        if (video) {
          video.pause()
        }
      }
    }, [isAnnotationMode, isPlaying])

    // Rastrear o movimento do mouse para colaboração
    useEffect(() => {
      if (!isJoined || !containerRef.current) return

      const handleMouseMove = (e: MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return

        const x = e.clientX
        const y = e.clientY

        // Verificar se o mouse está dentro do contêiner
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          updateCursorPosition({ x, y })
        }
      }

      window.addEventListener("mousemove", handleMouseMove)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
      }
    }, [isJoined, updateCursorPosition])

    const togglePlay = () => {
      const video = videoRef.current
      if (!video) return

      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
    }

    const handleSeek = (value: number[]) => {
      const video = videoRef.current
      if (!video) return

      const newTime = value[0]
      video.currentTime = newTime
      setCurrentTime(newTime)
      onSeek?.(newTime)

      if (isJoined) {
        seekVideo(newTime)
      }
    }

    const handleVolumeChange = (value: number[]) => {
      const video = videoRef.current
      if (!video) return

      const newVolume = value[0] / 100
      video.volume = newVolume
      setVolume(value[0])

      if (newVolume === 0) {
        setIsMuted(true)
        video.muted = true
      } else if (isMuted) {
        setIsMuted(false)
        video.muted = false
      }
    }

    const toggleMute = () => {
      const video = videoRef.current
      if (!video) return

      const newMutedState = !isMuted
      setIsMuted(newMutedState)
      video.muted = newMutedState
    }

    const skipBackward = () => {
      const video = videoRef.current
      if (!video) return

      const newTime = Math.max(0, video.currentTime - 10)
      video.currentTime = newTime
      setCurrentTime(newTime)
      onSeek?.(newTime)

      if (isJoined) {
        seekVideo(newTime)
      }
    }

    const skipForward = () => {
      const video = videoRef.current
      if (!video) return

      const newTime = Math.min(video.duration, video.currentTime + 10)
      video.currentTime = newTime
      setCurrentTime(newTime)
      onSeek?.(newTime)

      if (isJoined) {
        seekVideo(newTime)
      }
    }

    const toggleFullscreen = () => {
      if (!containerRef.current) return

      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`)
        })
      } else {
        document.exitFullscreen()
      }
    }

    const formatTime = (timeInSeconds: number) => {
      if (isNaN(timeInSeconds)) return "00:00"

      const minutes = Math.floor(timeInSeconds / 60)
      const seconds = Math.floor(timeInSeconds % 60)
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    const handleAnnotationCreate = (annotation: Annotation) => {
      // Adicionar informações do usuário à anotação
      const annotationWithUser = {
        ...annotation,
        userId: currentUser?.id,
        userName: currentUser?.name,
        userColor: currentUser?.color,
      }

      onAnnotationCreate?.(annotationWithUser)

      if (isJoined) {
        completeAnnotation(annotationWithUser)
      }
    }

    const handleAnnotationUpdate = (annotation: Annotation) => {
      onAnnotationUpdate?.(annotation)

      if (isJoined) {
        updateAnnotation(annotation)
      }
    }

    const handleAnnotationStart = (annotation: Annotation) => {
      if (isJoined) {
        startAnnotation(annotation)
      }
    }

    return (
      <div
        ref={(el) => {
          containerRef.current = el
          if (typeof ref === "function") {
            ref(el)
          } else if (ref) {
            ref.current = el
          }
        }}
        className={cn(
          "relative overflow-hidden bg-black rounded-md",
          isFullscreen ? "fixed inset-0 z-50" : "",
          className,
        )}
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          autoPlay={autoPlay}
        />

        {/* Annotation Canvas */}
        <AnnotationCanvas
          videoWidth={videoWidth}
          videoHeight={videoHeight}
          currentTime={currentTime}
          isPlaying={isPlaying}
          annotations={annotations}
          onAnnotationCreate={handleAnnotationCreate}
          onAnnotationUpdate={handleAnnotationUpdate}
          onAnnotationStart={handleAnnotationStart}
          selectedTool={selectedTool}
          selectedColor={selectedColor}
          selectedThickness={selectedThickness}
          isAnnotationMode={isAnnotationMode}
        />

        {/* Remote Annotations (for collaboration) */}
        {isJoined && <RemoteAnnotations canvasWidth={videoWidth} canvasHeight={videoHeight} />}

        {/* Remote Cursors (for collaboration) */}
        {isJoined && <RemoteCursors containerRef={containerRef} />}

        {/* Annotation Toolbar */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <AnnotationToolbar
            isAnnotationMode={isAnnotationMode}
            setIsAnnotationMode={setIsAnnotationMode}
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedThickness={selectedThickness}
            setSelectedThickness={setSelectedThickness}
          />
        </div>

        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity">
          <div className="flex flex-col gap-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.01}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={skipBackward} className="text-white hover:bg-white/20">
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full text-white hover:bg-white/20"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                <Button variant="ghost" size="icon" onClick={skipForward} className="text-white hover:bg-white/20">
                  <SkipForward className="h-4 w-4" />
                </Button>

                <span className="text-xs text-white ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20">
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>

                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />

                <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
)

VideoPlayer.displayName = "VideoPlayer"

export default VideoPlayer
