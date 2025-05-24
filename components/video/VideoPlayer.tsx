'use client'

'use client'

'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Maximize,
  Minimize,
} from 'lucide-react'

interface VideoPlayerProps {
  src: string
  poster?: string
  onTimeUpdate?: (currentTime: number) => void
  onEnded?: () => void
  className?: string
  autoPlay?: boolean
  initialTime?: number // Tempo inicial em segundos
  allowFullscreen?: boolean // Permitir tela cheia
}

export default function VideoPlayer({
  src,
  poster,
  onTimeUpdate,
  onEnded,
  className = '',
  autoPlay = false,
  initialTime = 0,
  allowFullscreen = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(initialTime)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [volume, setVolume] = useState(1) // Volume entre 0 e 1
  // Debounce da função de timeUpdate para melhorar performance
  const debouncedTimeUpdate = useCallback(
    debounce((time: number) => {
      onTimeUpdate?.(time)
    }, 200),
    [onTimeUpdate]
  )

  // Método para buscar uma posição específica no vídeo (exposto para componentes externos)
  const seekToPosition = useCallback(
    (timeInSeconds: number) => {
      if (
        videoRef.current &&
        !isNaN(timeInSeconds) &&
        timeInSeconds >= 0 &&
        timeInSeconds <= duration
      ) {
        videoRef.current.currentTime = timeInSeconds
        setCurrentTime(timeInSeconds)
        // Se o vídeo estiver pausado, iniciar a reprodução
        if (!isPlaying) {
          videoRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch(error =>
              console.error('Erro ao reproduzir após busca:', error)
            )
        }
      }
    },
    [isPlaying, duration]
  )

  // Expor método de busca para componentes pais via ref
  useEffect(() => {
    // Adicionar método ao elemento de vídeo para que possa ser acessado externamente
    if (videoRef.current) {
      ;(videoRef.current as any).seekToTimestamp = seekToPosition
    }
  }, [seekToPosition])

  // Quando a fonte do vídeo mudar, resetar o estado
  useEffect(() => {
    if (videoRef.current) {
      // Se houver um tempo inicial definido
      if (initialTime > 0) {
        videoRef.current.currentTime = initialTime
        setCurrentTime(initialTime)
      } else {
        setCurrentTime(0)
      }

      setIsPlaying(false)

      // Se autoPlay estiver habilitado, iniciar o vídeo
      if (autoPlay) {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(error =>
            console.error('Erro ao reproduzir automaticamente:', error)
          )
      }
    }
  }, [src, autoPlay, initialTime])
  // Manipulador para atualizar o tempo atual
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      setCurrentTime(time)
      debouncedTimeUpdate(time)
    }
  }

  // Manipulador para quando o vídeo terminar
  const handleEnded = () => {
    setIsPlaying(false)
    onEnded?.()
  }

  // Carregar metadados do vídeo (duração)
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  // Eventos de buffer
  const handleWaiting = () => {
    setIsBuffering(true)
  }

  const handleCanPlay = () => {
    setIsBuffering(false)
  }

  // Alternar reprodução
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current
          .play()
          .catch(err => console.error('Erro ao reproduzir:', err))
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Alternar mudo
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Controles de volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  // Funções de avanço/retrocesso rápido
  const skipForward = () => {
    if (videoRef.current) {
      const newTime = Math.min(videoRef.current.currentTime + 10, duration)
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const skipBackward = () => {
    if (videoRef.current) {
      const newTime = Math.max(videoRef.current.currentTime - 10, 0)
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  // Alternar tela cheia
  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true)
        })
        .catch(err => {
          console.error('Erro ao entrar em tela cheia:', err)
        })
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false)
        })
        .catch(err => {
          console.error('Erro ao sair de tela cheia:', err)
        })
    }
  }

  // Alterar posição do vídeo
  const seekTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  // Formatar tempo (segundos para MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg bg-black ${className}`}
    >
      {/* Overlay de carregamento/buffer */}
      {isBuffering && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <div className="size-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="size-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onClick={togglePlay}
      />

      {/* Controles de vídeo */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-100 transition-opacity hover:opacity-100">
        <div className="flex flex-col gap-2">
          {/* Barra de progresso */}
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={seekTo}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-700"
            style={{
              backgroundSize: `${(currentTime / duration) * 100}% 100%`,
              backgroundImage: 'linear-gradient(#3b82f6, #3b82f6)',
            }}
          />

          {/* Controles e tempo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="rounded-full bg-gray-800/50 p-1 hover:bg-gray-700/60"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>

              {/* Skip backward/forward */}
              <button
                onClick={skipBackward}
                className="rounded-full bg-gray-800/50 p-1 hover:bg-gray-700/60"
              >
                <SkipBack size={18} />
              </button>

              <button
                onClick={skipForward}
                className="rounded-full bg-gray-800/50 p-1 hover:bg-gray-700/60"
              >
                <SkipForward size={18} />
              </button>

              {/* Mute/Unmute */}
              <button
                onClick={toggleMute}
                className="rounded-full bg-gray-800/50 p-1 hover:bg-gray-700/60"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              {/* Volume Slider - apenas visível em desktop */}
              <div className="hidden w-20 sm:block">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-gray-700"
                />
              </div>

              {/* Tempo atual / Duração */}
              <div className="text-xs text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Controle de tela cheia */}
            {allowFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="rounded-full bg-gray-800/50 p-1 hover:bg-gray-700/60"
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
