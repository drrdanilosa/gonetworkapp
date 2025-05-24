'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  Download,
  Scissors,
  ZoomIn,
  ZoomOut,
  Move,
  Type,
  Palette,
  Layers,
  Music,
  Settings,
  Eye,
  EyeOff,
  Save,
  Undo,
  Redo,
  Plus,
  X,
  Check,
  MessageSquare,
  FilePlus,
  Clock,
  Filter,
  SquarePen,
  Share2,
  Lock,
  Unlock,
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Definir interfaces necessárias
interface TimelineClip {
  id: string
  name: string
  start: number
  end: number
  layer: string
  color: string
}

interface TimelineMarker {
  id: string
  time: number
  label: string
  type: 'comment' | 'chapter' | 'issue'
}

interface VideoVersion {
  id: string
  name: string
  url: string
  uploadedAt: Date
  createdBy?: string
}

interface Asset {
  id: string
  name: string
  type: 'audio' | 'image' | 'video'
  url: string
  duration?: number
  size: number
  uploadedAt: string
}

interface Comment {
  id: string
  time: number
  text: string
  isResolved: boolean
  author: string
  createdAt: string
  colorCategory: string
}

interface CommentColor {
  id: string
  name: string
  color: string
  description: string
}

interface Point {
  x: number
  y: number
}

interface Annotation {
  id: string
  timeStart: number
  timeEnd: number
  tool: string
  color: string
  thickness: number
  points: Point[]
  text?: string
  completed: boolean
}

interface Layer {
  id: string
  name: string
  type: 'video' | 'audio' | 'text' | 'image'
  visible: boolean
  locked: boolean
}

// Dados de amostra para o componente
const SAMPLE_CLIPS: TimelineClip[] = [
  {
    id: 'clip1',
    name: 'Introdução',
    start: 0,
    end: 15,
    layer: 'video1',
    color: '#4ade80',
  },
  {
    id: 'clip2',
    name: 'Entrevista',
    start: 15,
    end: 45,
    layer: 'video1',
    color: '#60a5fa',
  },
  {
    id: 'clip3',
    name: 'Conclusão',
    start: 45,
    end: 60,
    layer: 'video1',
    color: '#f87171',
  },
]

const SAMPLE_MARKERS: TimelineMarker[] = [
  {
    id: 'marker1',
    time: 5,
    label: 'Início da introdução',
    type: 'chapter',
  },
  {
    id: 'marker2',
    time: 25,
    label: 'Questão importante',
    type: 'comment',
  },
  {
    id: 'marker3',
    time: 50,
    label: 'Problema de áudio',
    type: 'issue',
  },
]

const SAMPLE_VERSIONS: VideoVersion[] = [
  {
    id: 'version1',
    name: 'Versão inicial',
    url: '/videos/sample.mp4',
    uploadedAt: new Date('2023-05-10'),
    createdBy: 'João Silva',
  },
  {
    id: 'version2',
    name: 'Versão revisada',
    url: '/videos/sample2.mp4',
    uploadedAt: new Date('2023-05-15'),
    createdBy: 'Maria Oliveira',
  },
]

const SAMPLE_ASSETS: Asset[] = [
  {
    id: 'asset1',
    name: 'Logo da empresa.png',
    type: 'image',
    url: '/assets/logo.png',
    size: 256000,
    uploadedAt: '2023-05-05T12:00:00Z',
  },
  {
    id: 'asset2',
    name: 'Música de fundo.mp3',
    type: 'audio',
    url: '/assets/background.mp3',
    duration: 120,
    size: 2560000,
    uploadedAt: '2023-05-06T12:00:00Z',
  },
  {
    id: 'asset3',
    name: 'Vídeo institucional.mp4',
    type: 'video',
    url: '/assets/institutional.mp4',
    duration: 180,
    size: 25600000,
    uploadedAt: '2023-05-07T12:00:00Z',
  },
]

// Comentários iniciais com nomes definidos
const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comment1',
    time: 15.5,
    text: 'Podemos ajustar o brilho nesta cena? Está um pouco escuro para a marca.',
    isResolved: false,
    author: 'Regina Duarte',
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 horas atrás
    colorCategory: 'creative',
  },
  {
    id: 'comment2',
    time: 45.2,
    text: 'Cortar esta parte e ir direto para a apresentação do GoNetwork Plus.',
    isResolved: true,
    author: 'Carlos Drummond',
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 horas atrás
    colorCategory: 'technical',
  },
  {
    id: 'comment3',
    time: 92.7,
    text: 'Adicionar legenda com o nome do CEO Pedro Cardoso nesta parte.',
    isResolved: false,
    author: 'Marina Lima',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
    colorCategory: 'client',
  },
]

// Cores para categorização de comentários (Paleta Dracula)
const COMMENT_COLORS: CommentColor[] = [
  {
    id: 'general',
    name: 'Geral',
    color: '#BD93F9',
    description: 'Comentários gerais',
  }, // Roxo
  {
    id: 'creative',
    name: 'Criativo',
    color: '#FF79C6',
    description: 'Sugestões criativas',
  }, // Rosa
  {
    id: 'technical',
    name: 'Técnico',
    color: '#8BE9FD',
    description: 'Questões técnicas',
  }, // Ciano
  {
    id: 'client',
    name: 'Cliente',
    color: '#50FA7B',
    description: 'Feedback do cliente',
  }, // Verde
  {
    id: 'urgent',
    name: 'Urgente',
    color: '#FF5555',
    description: 'Questões urgentes',
  }, // Vermelho
  {
    id: 'approved',
    name: 'Aprovado',
    color: '#F1FA8C',
    description: 'Conteúdo aprovado',
  }, // Amarelo
]

// Exemplo de anotações iniciais
const INITIAL_ANNOTATIONS: Annotation[] = [
  {
    id: 'annotation1',
    timeStart: 10.2,
    timeEnd: 15.2,
    tool: 'rectangle',
    color: '#ff0000',
    thickness: 3,
    points: [
      { x: 100, y: 100 },
      { x: 300, y: 200 },
    ],
    completed: true,
  },
  {
    id: 'annotation2',
    timeStart: 30.5,
    timeEnd: 35.5,
    tool: 'arrow',
    color: '#00ff00',
    thickness: 2,
    points: [
      { x: 200, y: 150 },
      { x: 400, y: 250 },
    ],
    completed: true,
  },
  {
    id: 'annotation3',
    timeStart: 60.0,
    timeEnd: 65.0,
    tool: 'text',
    color: '#0000ff',
    thickness: 3,
    points: [{ x: 250, y: 180 }],
    text: 'Adicionar transição aqui',
    completed: true,
  },
]

// Camadas de exemplo
const INITIAL_LAYERS: Layer[] = [
  {
    id: 'video1',
    name: 'Vídeo principal',
    type: 'video',
    visible: true,
    locked: false,
  },
  {
    id: 'audio1',
    name: 'Áudio principal',
    type: 'audio',
    visible: true,
    locked: false,
  },
  { id: 'text1', name: 'Legendas', type: 'text', visible: true, locked: false },
  {
    id: 'image1',
    name: 'Overlays',
    type: 'image',
    visible: true,
    locked: false,
  },
]

// Tipagem para ações de desfazer/refazer
type UndoAction =
  | { type: 'add-clip'; data: TimelineClip }
  | { type: 'delete-clip'; data: TimelineClip }
  | { type: 'add-comment'; data: Comment }
  | { type: 'delete-comment'; data: Comment }
  | { type: 'add-marker'; data: TimelineMarker }
  | { type: 'delete-marker'; data: TimelineMarker }

export interface EditingWidgetProps {
  projectId?: string
  videoId?: string
}

/**
 * A comprehensive video editing interface that provides a full suite of editing tools.
 *
 * This component offers a complete video editing experience including:
 * - Video playback controls with timeline navigation
 * - Multi-layer timeline editing with clips and markers
 * - Comment and annotation system for collaborative feedback
 * - Asset management for videos, images, and audio files
 * - Export functionality with configurable settings
 *
 * The editing widget is organized into tabs (timeline, comments, assets, export) to provide
 * a clean interface while maintaining powerful functionality.
 *
 * @param {Object} props - Component props
 * @param {string} props.projectId - ID of the current project being edited
 * @param {string} props.videoId - ID of the video being edited
 *
 * @returns A complex video editing interface with playback controls, timeline, and asset management
 */
export function EditingWidget({ projectId, videoId }: EditingWidgetProps) {
  // Estado principal
  const [activeTab, setActiveTab] = useState('timeline')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration] = useState(120) // Total duration in seconds
  const [volume, setVolume] = useState(80)
  const [selectedTool, setSelectedTool] = useState('select')
  const [zoomLevel, setZoomLevel] = useState(100)

  // Timeline e estado de edição
  const [clips, setClips] = useState<TimelineClip[]>(SAMPLE_CLIPS)
  const [timelinePosition, setTimelinePosition] = useState(0)
  const [selectedClip, setSelectedClip] = useState<string | null>(null)
  const [markers, setMarkers] = useState<TimelineMarker[]>(SAMPLE_MARKERS)
  const [selectedLayer, setSelectedLayer] = useState<string>('video1')
  const [layers, setLayers] = useState<Layer[]>(INITIAL_LAYERS)

  // Comentários
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS)
  const [newComment, setNewComment] = useState('')
  const [selectedCommentCategory, setSelectedCommentCategory] =
    useState('general')
  const [showResolvedComments, setShowResolvedComments] = useState(true)

  // Anotações
  const [annotations, setAnnotations] =
    useState<Annotation[]>(INITIAL_ANNOTATIONS)
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(
    null
  )

  // Assets
  const [assets, setAssets] = useState<Asset[]>(SAMPLE_ASSETS)
  const [searchAssetQuery, setSearchAssetQuery] = useState('')
  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(
    null
  )
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Exportação
  const [exportFormat, setExportFormat] = useState('mp4')
  const [exportQuality, setExportQuality] = useState('1080p')
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  // Histórico e clipboard com tipagem correta
  const [undoStack, setUndoStack] = useState<UndoAction[]>([])
  const [redoStack, setRedoStack] = useState<UndoAction[]>([])
  const [clipboard, setClipboard] = useState<any>(null)

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Filtrar assets usando useMemo para evitar re-renderizações
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = asset.name
        .toLowerCase()
        .includes(searchAssetQuery.toLowerCase())
      const matchesType = !selectedAssetType || asset.type === selectedAssetType
      return matchesSearch && matchesType
    })
  }, [assets, searchAssetQuery, selectedAssetType])

  // Funções de controle otimizadas com useCallback
  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const handleTimeUpdate = useCallback((value: number) => {
    setCurrentTime(value)
    setTimelinePosition(value)
    if (videoRef.current) {
      videoRef.current.currentTime = value
    }
  }, [])

  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 5)
    handleTimeUpdate(newTime)
  }

  const handleSkipForward = () => {
    const newTime = Math.min(duration, currentTime + 5)
    handleTimeUpdate(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100
    }
  }

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool)
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50))
  }

  // Manipulação de clips
  const handleClipSelect = (clipId: string) => {
    setSelectedClip(clipId === selectedClip ? null : clipId)
  }

  const handleClipAdd = () => {
    const newClip: TimelineClip = {
      id: `clip${clips.length + 1}`,
      name: `Novo clipe ${clips.length + 1}`,
      start: timelinePosition,
      end: timelinePosition + 10,
      layer: selectedLayer,
      color: '#60a5fa',
    }

    setClips([...clips, newClip])
    // Adicionar à pilha de desfazer
    setUndoStack([...undoStack, { type: 'add-clip', data: newClip }])
  }

  const handleClipDelete = (clipId: string) => {
    const clipToDelete = clips.find(clip => clip.id === clipId)
    setClips(clips.filter(clip => clip.id !== clipId))
    setSelectedClip(null)
    // Adicionar à pilha de desfazer
    if (clipToDelete) {
      setUndoStack([...undoStack, { type: 'delete-clip', data: clipToDelete }])
    }
  }

  // Manipulação de comentários
  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: `comment${comments.length + 1}`,
        time: currentTime,
        text: newComment,
        isResolved: false,
        author: 'Usuário Atual', // Normalmente seria obtido de um contexto de autenticação
        createdAt: new Date().toISOString(),
        colorCategory: selectedCommentCategory,
      }

      setComments([...comments, newCommentObj])
      setNewComment('')

      // Adicionar marcador para o comentário
      const newMarker: TimelineMarker = {
        id: `marker-comment-${newCommentObj.id}`,
        time: currentTime,
        label:
          newComment.substring(0, 20) + (newComment.length > 20 ? '...' : ''),
        type: 'comment',
      }

      setMarkers([...markers, newMarker])
    }
  }

  const handleToggleCommentResolution = (commentId: string) => {
    setComments(
      comments.map(comment =>
        comment.id === commentId
          ? { ...comment, isResolved: !comment.isResolved }
          : comment
      )
    )
  }

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId))
    // Remover o marcador associado
    setMarkers(
      markers.filter(marker => marker.id !== `marker-comment-${commentId}`)
    )
  }

  // Manipulação de marcadores
  const handleMarkerClick = (_id: string, time: number) => {
    handleTimeUpdate(time)
  }

  const handleAddMarker = (type: TimelineMarker['type']) => {
    const newMarker: TimelineMarker = {
      id: `marker${markers.length + 1}`,
      time: currentTime,
      label: `Marcador ${markers.length + 1}`,
      type,
    }

    setMarkers([...markers, newMarker])
  }

  const handleDeleteMarker = (markerId: string) => {
    setMarkers(markers.filter(marker => marker.id !== markerId))
  }

  // Manipulação de assets
  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    // Simular upload
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setIsUploading(false)

        // Adicionar novo asset
        const file = files[0]
        const newAsset: Asset = {
          id: `asset${assets.length + 1}`,
          name: file.name,
          type: file.type.startsWith('image/')
            ? 'image'
            : file.type.startsWith('audio/')
              ? 'audio'
              : 'video',
          url: URL.createObjectURL(file),
          duration:
            file.type.startsWith('video/') || file.type.startsWith('audio/')
              ? 60
              : undefined,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        }

        setAssets([...assets, newAsset])
      }
    }, 300)
  }

  const handleDeleteAsset = (assetId: string) => {
    setAssets(assets.filter(asset => asset.id !== assetId))
  }

  // Exportação
  const handleExport = () => {
    setIsExporting(true)
    setExportProgress(0)

    // Simular exportação
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setExportProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setIsExporting(false)
      }
    }, 200)
  }

  // Formatar tempo
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Histórico
  const handleUndo = () => {
    if (undoStack.length === 0) return

    const action = undoStack[undoStack.length - 1]
    const newUndoStack = undoStack.slice(0, -1)

    setUndoStack(newUndoStack)
    setRedoStack([...redoStack, action])

    // Desfazer a ação específica
    switch (action.type) {
      case 'add-clip':
        setClips(clips.filter(clip => clip.id !== action.data.id))
        break
      case 'delete-clip':
        setClips([...clips, action.data])
        break
      // Adicionar outros casos conforme necessário
    }
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return

    const action = redoStack[redoStack.length - 1]
    const newRedoStack = redoStack.slice(0, -1)

    setRedoStack(newRedoStack)
    setUndoStack([...undoStack, action])

    // Refazer a ação específica
    switch (action.type) {
      case 'add-clip':
        setClips([...clips, action.data])
        break
      case 'delete-clip':
        setClips(clips.filter(clip => clip.id !== action.data.id))
        break
      // Adicionar outros casos conforme necessário
    }
  }

  // Atualizar posição do timeline durante reprodução
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prevTime => {
          const newTime = prevTime + 0.1
          setTimelinePosition(newTime)

          if (newTime >= duration) {
            setIsPlaying(false)
            return duration
          }

          return newTime
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [isPlaying, duration])

  return (
    <div className="flex flex-col space-y-4">
      {/* Área do Player de Vídeo */}
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="relative mb-2 aspect-video overflow-hidden rounded-md bg-black">
            {/* Player de vídeo */}
            <video
              ref={videoRef}
              className="size-full object-contain"
              src="/sample-video.mp4"
              poster="/thumbnail.jpg"
            />

            {/* Canvas para anotações */}
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute left-0 top-0 size-full"
            />

            {/* Feedback de anotações temporárias */}
            {selectedTool !== 'select' && (
              <div className="absolute bottom-4 left-4 rounded-md bg-black/70 px-3 py-1 text-sm text-white">
                {selectedTool === 'pen' && 'Desenho livre'}
                {selectedTool === 'rectangle' && 'Retângulo'}
                {selectedTool === 'arrow' && 'Seta'}
                {selectedTool === 'text' && 'Texto'}
              </div>
            )}
          </div>

          {/* Controles de reprodução */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSkipBack}
              aria-label="Voltar 5 segundos"
            >
              <SkipBack className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handlePlayPause}
              aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
            >
              {isPlaying ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleSkipForward}
              aria-label="Avançar 5 segundos"
            >
              <SkipForward className="size-4" />
            </Button>

            <div className="font-mono text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <div className="mx-4 flex-1">
              <Slider
                value={[timelinePosition]}
                min={0}
                max={duration}
                step={0.1}
                onValueChange={value => handleTimeUpdate(value[0])}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Volume2 className="size-4" />
              <div className="w-24">
                <Slider
                  value={[volume]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>

            <Button variant="outline" size="icon" aria-label="Tela cheia">
              <Maximize className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Principal área de edição */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Edição de Vídeo</CardTitle>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleUndo}
                      disabled={undoStack.length === 0}
                    >
                      <Undo className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Desfazer</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRedo}
                      disabled={redoStack.length === 0}
                    >
                      <Redo className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refazer</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Separator orientation="vertical" className="h-6" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Save className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Salvar projeto</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Share2 className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Compartilhar</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 grid grid-cols-4">
              <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
              <TabsTrigger value="comments">Comentários</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="export">Exportar</TabsTrigger>
            </TabsList>

            {/* ABA: LINHA DO TEMPO */}
            <TabsContent value="timeline" className="space-y-4">
              {/* Ferramenta e controles de visualização */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={
                            selectedTool === 'select' ? 'default' : 'outline'
                          }
                          size="icon"
                          onClick={() => handleToolSelect('select')}
                        >
                          <Move className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Selecionar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={
                            selectedTool === 'cut' ? 'default' : 'outline'
                          }
                          size="icon"
                          onClick={() => handleToolSelect('cut')}
                        >
                          <Scissors className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Cortar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={
                            selectedTool === 'pen' ? 'default' : 'outline'
                          }
                          size="icon"
                          onClick={() => handleToolSelect('pen')}
                        >
                          <SquarePen className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Desenhar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={
                            selectedTool === 'text' ? 'default' : 'outline'
                          }
                          size="icon"
                          onClick={() => handleToolSelect('text')}
                        >
                          <Type className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Texto</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Separator orientation="vertical" className="mx-1 h-8" />

                  <Select
                    defaultValue="video1"
                    onValueChange={setSelectedLayer}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Selecionar camada" />
                    </SelectTrigger>
                    <SelectContent>
                      {layers.map(layer => (
                        <SelectItem key={layer.id} value={layer.id}>
                          {layer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-1">
                  <Button variant="outline" size="icon" onClick={handleZoomOut}>
                    <ZoomOut className="size-4" />
                  </Button>
                  <span className="text-sm font-medium">{zoomLevel}%</span>
                  <Button variant="outline" size="icon" onClick={handleZoomIn}>
                    <ZoomIn className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Área da linha do tempo */}
              <div
                ref={timelineRef}
                className="h-64 overflow-x-auto rounded-md border p-4"
                style={{
                  backgroundSize: `${zoomLevel / 10}px 10px`,
                  backgroundImage:
                    'repeating-linear-gradient(90deg, #444, #444 1px, transparent 1px, transparent 100%)',
                }}
              >
                {/* Régua de tempo */}
                <div className="relative mb-2 h-8">
                  {Array.from({ length: Math.ceil(duration / 5) + 1 }).map(
                    (_, index) => (
                      <div
                        key={`tick-${index}`}
                        className="absolute top-0 text-xs"
                        style={{ left: `${(index * 5 * zoomLevel) / 5}px` }}
                      >
                        {formatTime(index * 5)}
                      </div>
                    )
                  )}
                </div>

                {/* Indicador de posição atual */}
                <div
                  className="absolute bottom-0 top-8 z-10 w-[2px] bg-red-500"
                  style={{
                    left: `${(timelinePosition * zoomLevel) / 5}px`,
                    height: 'calc(100% - 3rem)',
                  }}
                />

                {/* Camadas e clips */}
                {layers.map((layer, layerIndex) => (
                  <div
                    key={layer.id}
                    className="relative mb-2 flex h-12 items-center"
                  >
                    <div className="flex w-32 items-center justify-between pr-2">
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mr-1 size-6"
                          onClick={() => {
                            setLayers(
                              layers.map(l =>
                                l.id === layer.id
                                  ? { ...l, visible: !l.visible }
                                  : l
                              )
                            )
                          }}
                          aria-label={
                            layer.visible ? 'Esconder camada' : 'Mostrar camada'
                          }
                        >
                          {layer.visible ? (
                            <Eye className="size-4" />
                          ) : (
                            <EyeOff className="size-4" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          onClick={() => {
                            setLayers(
                              layers.map(l =>
                                l.id === layer.id
                                  ? { ...l, locked: !l.locked }
                                  : l
                              )
                            )
                          }}
                          aria-label={
                            layer.locked
                              ? 'Desbloquear camada'
                              : 'Bloquear camada'
                          }
                        >
                          {layer.locked ? (
                            <Lock className="size-4" />
                          ) : (
                            <Unlock className="size-4" />
                          )}
                        </Button>
                      </div>
                      <span className="truncate text-xs font-medium">
                        {layer.name}
                      </span>
                    </div>

                    {/* Clipes nesta camada */}
                    <div className="relative h-full flex-1">
                      {clips
                        .filter(clip => clip.layer === layer.id)
                        .map(clip => (
                          <div
                            key={clip.id}
                            className={`absolute top-0 flex h-full cursor-pointer items-center justify-center rounded-md text-xs font-medium text-white transition-all ${
                              selectedClip === clip.id
                                ? 'ring-2 ring-white'
                                : ''
                            }`}
                            style={{
                              left: `${(clip.start * zoomLevel) / 5}px`,
                              width: `${((clip.end - clip.start) * zoomLevel) / 5}px`,
                              backgroundColor: clip.color,
                            }}
                            onClick={() => handleClipSelect(clip.id)}
                          >
                            <span className="truncate px-2">{clip.name}</span>

                            {selectedClip === clip.id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 size-6"
                                onClick={e => {
                                  e.stopPropagation()
                                  handleClipDelete(clip.id)
                                }}
                              >
                                <X className="size-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}

                {/* Marcadores */}
                <div className="relative mt-4 h-4 flex-1">
                  {markers.map(marker => (
                    <div
                      key={marker.id}
                      className={`absolute top-0 size-4 -translate-x-1/2 cursor-pointer ${
                        marker.type === 'chapter'
                          ? 'bg-green-500'
                          : marker.type === 'comment'
                            ? 'bg-blue-500'
                            : 'bg-red-500'
                      } rounded-full`}
                      style={{
                        left: `${(marker.time * zoomLevel) / 5}px`,
                      }}
                      onClick={() => handleMarkerClick(marker.id, marker.time)}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="size-full"></div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <span className="font-medium">
                              {marker.type === 'chapter'
                                ? 'Capítulo: '
                                : marker.type === 'comment'
                                  ? 'Comentário: '
                                  : 'Problema: '}
                              {marker.label}
                            </span>
                            <div className="text-xs opacity-70">
                              {formatTime(marker.time)}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controles da linha do tempo */}
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleClipAdd}>
                    <Plus className="mr-2 size-4" />
                    Adicionar Clip
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 size-4" />
                        Adicionar Marcador
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleAddMarker('chapter')}
                      >
                        Capítulo
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAddMarker('comment')}
                      >
                        Comentário
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAddMarker('issue')}
                      >
                        Problema
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor="layer-visibility" className="text-sm">
                    Camadas:
                  </Label>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]" id="layer-visibility">
                      <SelectValue placeholder="Visualização" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Mostrar todas</SelectItem>
                      <SelectItem value="video">Apenas vídeo</SelectItem>
                      <SelectItem value="audio">Apenas áudio</SelectItem>
                      <SelectItem value="text">Apenas texto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* ABA: COMENTÁRIOS */}
            <TabsContent value="comments" className="space-y-4">
              {/* Adicionar comentário */}
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Textarea
                    placeholder="Adicionar comentário..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Select
                    value={selectedCommentCategory}
                    onValueChange={setSelectedCommentCategory}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMENT_COLORS.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center">
                            <div
                              className="mr-2 size-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddComment}>
                    Adicionar no {formatTime(currentTime)}
                  </Button>
                </div>
              </div>

              {/* Filtros e visualização */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="comment-filter" className="text-sm">
                    Filtrar:
                  </Label>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]" id="comment-filter">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas categorias</SelectItem>
                      {COMMENT_COLORS.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={showResolvedComments}
                      onChange={() =>
                        setShowResolvedComments(!showResolvedComments)
                      }
                    />
                    Mostrar resolvidos
                  </Label>
                </div>
              </div>

              {/* Lista de comentários */}
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {comments
                    .filter(
                      comment => showResolvedComments || !comment.isResolved
                    )
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .map(comment => {
                      const commentCategory =
                        COMMENT_COLORS.find(
                          c => c.id === comment.colorCategory
                        ) || COMMENT_COLORS[0]

                      return (
                        <div
                          key={comment.id}
                          className={`rounded-lg border p-3 transition-opacity ${
                            comment.isResolved ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <div className="flex items-center">
                              <Avatar className="mr-2 size-6">
                                <AvatarFallback>
                                  {comment.author.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">
                                {comment.author}
                              </span>
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs"
                                style={{
                                  borderColor: commentCategory.color,
                                  color: commentCategory.color,
                                }}
                              >
                                {commentCategory.name}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="size-3" />
                              <span>{formatTime(comment.time)}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="ml-1 size-6"
                                onClick={() => handleTimeUpdate(comment.time)}
                              >
                                <Play className="size-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="mb-2 text-sm">{comment.text}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString()}{' '}
                              {new Date(comment.createdAt).toLocaleTimeString(
                                [],
                                { hour: '2-digit', minute: '2-digit' }
                              )}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() =>
                                  handleToggleCommentResolution(comment.id)
                                }
                                aria-label={
                                  comment.isResolved
                                    ? 'Marcar como não resolvido'
                                    : 'Marcar como resolvido'
                                }
                              >
                                {comment.isResolved ? (
                                  <MessageSquare className="size-4" />
                                ) : (
                                  <Check className="size-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-destructive"
                                onClick={() => handleDeleteComment(comment.id)}
                                aria-label="Excluir comentário"
                              >
                                <X className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                  {comments.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      <MessageSquare className="mx-auto mb-2 size-10 opacity-20" />
                      <p>Nenhum comentário adicionado.</p>
                      <p className="text-sm">
                        Adicione o primeiro comentário acima.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* ABA: ASSETS */}
            <TabsContent value="assets" className="space-y-4">
              {/* Upload e filtros */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Buscar assets..."
                    className="w-80"
                    value={searchAssetQuery}
                    onChange={e => setSearchAssetQuery(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => setSearchAssetQuery('')}
                  >
                    <Filter className="mr-2 size-4" />
                    Limpar
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={selectedAssetType || 'all'}
                    onValueChange={value =>
                      setSelectedAssetType(value === 'all' ? null : value)
                    }
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos tipos</SelectItem>
                      <SelectItem value="video">Vídeos</SelectItem>
                      <SelectItem value="audio">Áudios</SelectItem>
                      <SelectItem value="image">Imagens</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="default"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <FilePlus className="mr-2 size-4" />
                    Adicionar
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleAssetUpload}
                    accept="image/*,audio/*,video/*"
                  />
                </div>
              </div>

              {/* Progresso de upload */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Enviando arquivo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Lista de assets */}
              <div className="grid grid-cols-3 gap-4">
                {filteredAssets.map(asset => (
                  <Card key={asset.id}>
                    <CardContent className="p-3">
                      <div className="mb-2 flex aspect-video items-center justify-center overflow-hidden rounded bg-muted">
                        {asset.type === 'image' ? (
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="size-full object-cover"
                          />
                        ) : asset.type === 'audio' ? (
                          <Music className="size-10 text-muted-foreground" />
                        ) : (
                          <div className="relative size-full bg-black">
                            <video
                              src={asset.url}
                              className="size-full object-cover"
                              controls={false}
                              muted
                              playsInline
                            />
                            <Play className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-white/80" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-start justify-between">
                        <div>
                          <h4
                            className="truncate text-sm font-medium"
                            title={asset.name}
                          >
                            {asset.name}
                          </h4>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span className="capitalize">{asset.type}</span>
                            <span className="mx-1">•</span>
                            <span>
                              {(asset.size / 1024 / 1024).toFixed(1)} MB
                            </span>
                            {asset.duration && (
                              <>
                                <span className="mx-1">•</span>
                                <span>{formatTime(asset.duration)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              aria-label="Opções do asset"
                            >
                              <Settings className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {}}>
                              Adicionar à timeline
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {}}>
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteAsset(asset.id)}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredAssets.length === 0 && (
                  <div className="col-span-3 p-8 text-center text-muted-foreground">
                    <FilePlus className="mx-auto mb-2 size-10 opacity-20" />
                    <p>Nenhum asset encontrado.</p>
                    <p className="text-sm">
                      {searchAssetQuery || selectedAssetType
                        ? 'Tente mudar os filtros.'
                        : 'Adicione arquivos para começar.'}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ABA: EXPORTAR */}
            <TabsContent value="export" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Configurações de Exportação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="export-format">Formato</Label>
                      <Select
                        value={exportFormat}
                        onValueChange={setExportFormat}
                      >
                        <SelectTrigger id="export-format">
                          <SelectValue placeholder="Selecione o formato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                          <SelectItem value="webm">WebM (VP9)</SelectItem>
                          <SelectItem value="mov">MOV (ProRes)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="export-quality">Qualidade</Label>
                      <Select
                        value={exportQuality}
                        onValueChange={setExportQuality}
                      >
                        <SelectTrigger id="export-quality">
                          <SelectValue placeholder="Selecione a qualidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="720p">HD (720p)</SelectItem>
                          <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                          <SelectItem value="2160p">4K (2160p)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="export-range">Intervalo de tempo</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="export-range-start"
                          type="text"
                          placeholder="00:00"
                          defaultValue="00:00"
                        />
                        <span>até</span>
                        <Input
                          id="export-range-end"
                          type="text"
                          placeholder="02:00"
                          defaultValue={formatTime(duration)}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        className="w-full"
                        onClick={handleExport}
                        disabled={isExporting}
                      >
                        <Download className="mr-2 size-4" />
                        {isExporting ? 'Exportando...' : 'Exportar vídeo'}
                      </Button>

                      {isExporting && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>{exportProgress}%</span>
                          </div>
                          <Progress value={exportProgress} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Versões Anteriores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Autor</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {SAMPLE_VERSIONS.map(version => (
                          <TableRow key={version.id}>
                            <TableCell className="font-medium">
                              {version.name}
                            </TableCell>
                            <TableCell>
                              {version.uploadedAt.toLocaleDateString()}
                            </TableCell>
                            <TableCell>{version.createdBy}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon">
                                <Download className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {SAMPLE_VERSIONS.length === 0 && (
                      <div className="p-4 text-center text-muted-foreground">
                        <p>Nenhuma versão anterior disponível.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
