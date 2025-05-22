"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  FileText, 
  Plus, 
  Users, 
  Share, 
  Upload, 
  Mic, 
  Hash, 
  Image, 
  Download, 
  Facebook, 
  Instagram, 
  Youtube, 
  Twitter, 
  MessageSquare,
  Trash
} from "lucide-react"
import VideoPlayer from "@/components/video/video-player"
import CommentMarkersTimeline, { type Comment } from "@/components/video/comment-markers-timeline"
import CommentItem from "@/components/video/comment-item"
import AnnotationList from "@/components/video/annotation-list"
import ExportModal, { type ExportOptions } from "@/components/export/export-modal"
import ExportPreview from "@/components/export/export-preview"
import CollaborationPanel from "@/components/collaboration/collaboration-panel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { v4 as uuidv4 } from "uuid"
import type { Annotation } from "@/components/video/annotation-canvas"
import { exportToCSV, exportToPDF, captureVideoScreenshots } from "@/lib/export-utils"
import { CollaborationProvider, useCollaboration } from "@/contexts/collaboration-context"
import { Badge } from "@/components/ui/badge" 
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"

// Tipos para a versão melhorada
interface Asset {
  id: string
  name: string
  type: "image" | "video" | "audio" | "document"
  url: string
  thumbnailUrl?: string
  uploadedBy: string
  uploadedAt: string
}

interface CommentColor {
  id: string
  name: string
  color: string
  description: string
}

interface VideoVersion {
  id: string
  versionNumber: number
  title: string
  src: string
  createdAt: string
  createdBy: string
  comments: Comment[]
}

// Dados de vídeo para projetos reais
const SAMPLE_VIDEOS = [
  {
    id: "video1",
    title: "GoNetwork Summit 2025 - Teaser",
    src: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: "video2",
    title: "Lançamento GoNetflix Plus - Apresentação",
    src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
  {
    id: "video3",
    title: "GoNetwork DevCon 2025 - Highlights",
    src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
]

// Comentários iniciais com nomes definidos
const INITIAL_COMMENTS: Comment[] = [
  {
    id: "comment1",
    time: 15.5,
    text: "Podemos ajustar o brilho nesta cena? Está um pouco escuro para a marca.",
    isResolved: false,
    author: "Regina Duarte",
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 horas atrás
    colorCategory: "creative"
  },
  {
    id: "comment2",
    time: 45.2,
    text: "Cortar esta parte e ir direto para a apresentação do GoNetwork Plus.",
    isResolved: true,
    author: "Carlos Drummond",
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 horas atrás
    colorCategory: "technical"
  },
  {
    id: "comment3",
    time: 92.7,
    text: "Adicionar legenda com o nome do CEO Pedro Cardoso nesta parte.",
    isResolved: false,
    author: "Marina Lima",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
    colorCategory: "client"
  },
]

// Cores para categorização de comentários (Paleta Dracula)
const COMMENT_COLORS: CommentColor[] = [
  { id: "general", name: "Geral", color: "#BD93F9", description: "Comentários gerais" }, // Roxo
  { id: "creative", name: "Criativo", color: "#FF79C6", description: "Sugestões criativas" }, // Rosa
  { id: "technical", name: "Técnico", color: "#8BE9FD", description: "Questões técnicas" }, // Ciano
  { id: "client", name: "Cliente", color: "#50FA7B", description: "Feedback do cliente" }, // Verde
  { id: "urgent", name: "Urgente", color: "#FF5555", description: "Questões urgentes" }, // Vermelho
  { id: "approved", name: "Aprovado", color: "#F1FA8C", description: "Conteúdo aprovado" }, // Amarelo
]

// Exemplo de anotações iniciais
const INITIAL_ANNOTATIONS: Annotation[] = [
  {
    id: "annotation1",
    timeStart: 10.2,
    timeEnd: 15.2,
    tool: "rectangle",
    color: "#ff0000",
    thickness: 3,
    points: [
      { x: 100, y: 100 },
      { x: 300, y: 200 },
    ],
    completed: true,
  },
  {
    id: "annotation2",
    timeStart: 30.5,
    timeEnd: 35.5,
    tool: "arrow",
    color: "#00ff00",
    thickness: 2,
    points: [
      { x: 200, y: 150 },
      { x: 400, y: 250 },
    ],
    completed: true,
  },
  {
    id: "annotation3",
    timeStart: 60.0,
    timeEnd: 65.0,
    tool: "text",
    color: "#0000ff",
    thickness: 3,
    points: [{ x: 250, y: 180 }],
    text: "Adicionar transição aqui",
    completed: true,
  },
]

// Exemplo de library de assets
const SAMPLE_ASSETS: Asset[] = [
  {
    id: "asset1",
    name: "Logo GoNetwork (Transparente)",
    type: "image",
    url: "/logo_gonetwork.png",
    thumbnailUrl: "/logo_gonetwork.png",
    uploadedBy: "Pedro Cardoso",
    uploadedAt: new Date(Date.now() - 604800000).toISOString() // 7 dias atrás
  },
  {
    id: "asset2",
    name: "Música tema - GoNetwork",
    type: "audio",
    url: "https://example.com/audio.mp3",
    uploadedBy: "Daniel Ribeiro",
    uploadedAt: new Date(Date.now() - 259200000).toISOString() // 3 dias atrás
  },
  {
    id: "asset3",
    name: "Manual de marca GoNetwork",
    type: "document",
    url: "https://example.com/document.pdf",
    thumbnailUrl: "/placeholder.jpg",
    uploadedBy: "Regina Duarte",
    uploadedAt: new Date(Date.now() - 86400000).toISOString() // 1 dia atrás
  }
]

// Versões de vídeo
const SAMPLE_VERSIONS: VideoVersion[] = [
  {
    id: "version1",
    versionNumber: 1,
    title: "GoNetwork Summit 2025 - Primeira versão",
    src: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    createdBy: "Editor Principal",
    comments: [],
  },
  {
    id: "version2",
    versionNumber: 2,
    title: "GoNetwork Summit 2025 - Revisão 1",
    src: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    createdBy: "Editor Principal",
    comments: [],
  }
]

function EditingWidgetContent() {
  // Estado para vídeos e versões
  const [currentVideo, setCurrentVideo] = useState(SAMPLE_VIDEOS[0])
  const [versions, setVersions] = useState<VideoVersion[]>(SAMPLE_VERSIONS)
  const [currentVersionId, setCurrentVersionId] = useState<string>("version2")
  
  // Estado para comentários e anotações
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS)
  const [annotations, setAnnotations] = useState<Annotation[]>(INITIAL_ANNOTATIONS)
  const [filteredComments, setFilteredComments] = useState<Comment[]>(INITIAL_COMMENTS)
  const [showResolved, setShowResolved] = useState(true)
  const [showPending, setShowPending] = useState(true)
  const [commentColor, setCommentColor] = useState<string>("general")
  const [filterByColor, setFilterByColor] = useState<string | null>(null)

  // Estado para o player e interatividade
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [newCommentText, setNewCommentText] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [activeTab, setActiveTab] = useState("comments")
  const [showCollaboration, setShowCollaboration] = useState(false)
  
  // Estado para assets
  const [assets, setAssets] = useState<Asset[]>(SAMPLE_ASSETS)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  
  // Estado para legendas automáticas
  const [captions, setCaptions] = useState<string[]>([])
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false)
  
  // Estado para compartilhamento
  const [shareUrl, setShareUrl] = useState<string>("")
  
  // Toast para notificações
  const { toast } = useToast()
  
  // Detecção de dispositivo móvel
  const isMobile = useMobile()

  // Refs para o vídeo e canvas
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoPlayerRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Estado para os modais de exportação
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [exportPreviewUrl, setExportPreviewUrl] = useState("")
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf")
  const [exportFilename, setExportFilename] = useState("")
  const [isExportLoading, setIsExportLoading] = useState(false)

  // Collaboration context
  const {
    isJoined,
    comments: collaborationComments,
    annotations: collaborationAnnotations,
    addComment,
    updateComment,
    deleteComment,
    setTyping,
  } = useCollaboration()

  // Usar comentários e anotações da colaboração quando estiver em uma sessão
  useEffect(() => {
    if (isJoined) {
      if (collaborationComments.length > 0) {
        setComments(collaborationComments)
      }
      if (collaborationAnnotations.length > 0) {
        setAnnotations(collaborationAnnotations)
      }
    }
  }, [isJoined, collaborationComments, collaborationAnnotations])

  // Filtrar comentários com base nas configurações
  useEffect(() => {
    let filtered = [...comments]

    if (!showResolved) {
      filtered = filtered.filter((comment) => !comment.isResolved)
    }

    if (!showPending) {
      filtered = filtered.filter((comment) => comment.isResolved)
    }
    
    if (filterByColor) {
      filtered = filtered.filter((comment) => comment.colorCategory === filterByColor)
    }

    setFilteredComments(filtered)
  }, [comments, showResolved, showPending, filterByColor])

  // Manipuladores de eventos para comentários
  const handleAddComment = () => {
    if (!newCommentText.trim()) return

    const newComment: Comment = {
      id: uuidv4(),
      time: currentTime,
      text: newCommentText,
      isResolved: false,
      author: "Você", // Em um app real, seria o usuário atual
      createdAt: new Date().toISOString(),
      colorCategory: commentColor
    }

    if (isJoined) {
      addComment(newComment)
    } else {
      setComments((prev) => [...prev, newComment])
    }
    
    // Notificar usuário sobre o comentário adicionado
    toast({
      title: "Comentário adicionado",
      description: "Seu comentário foi adicionado com sucesso."
    })

    setNewCommentText("")
    setIsAdding(false)
  }

  const handleResolveComment = (id: string) => {
    const updatedComment = comments.find((c) => c.id === id)
    if (!updatedComment) return

    const resolvedComment = { ...updatedComment, isResolved: true }

    if (isJoined) {
      updateComment(resolvedComment)
    } else {
      setComments((prev) => prev.map((comment) => (comment.id === id ? resolvedComment : comment)))
    }
  }

  const handleReopenComment = (id: string) => {
    const updatedComment = comments.find((c) => c.id === id)
    if (!updatedComment) return

    const reopenedComment = { ...updatedComment, isResolved: false }

    if (isJoined) {
      updateComment(reopenedComment)
    } else {
      setComments((prev) => prev.map((comment) => (comment.id === id ? reopenedComment : comment)))
    }
  }

  const handleEditComment = (id: string, newText: string) => {
    const updatedComment = comments.find((c) => c.id === id)
    if (!updatedComment) return

    const editedComment = { ...updatedComment, text: newText }

    if (isJoined) {
      updateComment(editedComment)
    } else {
      setComments((prev) => prev.map((comment) => (comment.id === id ? editedComment : comment)))
    }
  }

  const handleDeleteComment = (id: string) => {
    if (isJoined) {
      deleteComment(id)
    } else {
      setComments((prev) => prev.filter((comment) => comment.id !== id))
    }
  }

  const handleMarkerClick = (id: string, time: number) => {
    // Navegar para o tempo do comentário
    setCurrentTime(time)
  }

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    setCurrentTime(currentTime)
    setDuration(duration)
  }

  const handleVideoChange = (videoId: string) => {
    const video = SAMPLE_VIDEOS.find((v) => v.id === videoId)
    if (video) {
      setCurrentVideo(video)
    }
  }

  // Manipuladores de eventos para anotações
  const handleAnnotationCreate = (annotation: Annotation) => {
    setAnnotations((prev) => [...prev, annotation])
  }

  const handleAnnotationUpdate = (annotation: Annotation) => {
    setAnnotations((prev) => prev.map((a) => (a.id === annotation.id ? annotation : a)))
  }

  const handleAnnotationDelete = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id))
  }

  // Manipuladores para exportação
  const handleOpenExportModal = () => {
    setIsExportModalOpen(true)
  }

  const handleExport = async (format: "pdf" | "csv", options: ExportOptions) => {
    try {
      setIsExportLoading(true)
      setExportFormat(format)
      setExportFilename(options.filename)

      if (format === "csv") {
        // Exportar para CSV
        const csvContent = await exportToCSV(comments, annotations, options, currentVideo.title)
        setExportPreviewUrl(csvContent)
      } else {
        // Exportar para PDF
        let screenshots: { time: number; dataUrl: string }[] = []

        // Capturar screenshots se necessário
        if (options.includeScreenshots && videoRef.current && canvasRef.current) {
          screenshots = await captureVideoScreenshots(videoRef.current, canvasRef.current, annotations)
        }

        const pdfBlob = await exportToPDF(comments, annotations, options, currentVideo.title, screenshots)
        const pdfUrl = URL.createObjectURL(pdfBlob)
        setExportPreviewUrl(pdfUrl)
      }

      setIsPreviewModalOpen(true)
    } catch (error) {
      console.error("Erro ao exportar:", error)
    } finally {
      setIsExportLoading(false)
    }
  }

  // Manipulador para digitação em colaboração
  const handleCommentInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewCommentText(e.target.value)

    if (isJoined) {
      setTyping(e.target.value.length > 0)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edições de Vídeo</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>Evento:</Label>
            <Select defaultValue="festival">
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecione um evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="festival">Festival de Música - 18-20 Mai 2025</SelectItem>
                <SelectItem value="lancamento">Lançamento de Produto - 25 Mai 2025</SelectItem>
                <SelectItem value="conferencia">Conferência Tech - 01 Jun 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label>Editor:</Label>
            <Select defaultValue="maria">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione um editor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maria">Maria Souza</SelectItem>
                <SelectItem value="pedro">Pedro Alves</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={() => setShowCollaboration(!showCollaboration)}>
            <Users className="h-4 w-4 mr-2" />
            Colaboração
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div>
          Cliente: <span className="font-medium">Empresa XYZ</span>
        </div>
        <div>
          Status: <span className="text-warning font-medium">Em revisão</span>
        </div>
        <div>
          <Select value={currentVideo.id} onValueChange={handleVideoChange}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Selecione um vídeo" />
            </SelectTrigger>
            <SelectContent>
              {SAMPLE_VIDEOS.map((video) => (
                <SelectItem key={video.id} value={video.id}>
                  {video.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {/* Video Player with Annotations */}
          <VideoPlayer
            src={currentVideo.src}
            onTimeUpdate={handleTimeUpdate}
            onSeek={(time) => setCurrentTime(time)}
            onAnnotationCreate={handleAnnotationCreate}
            onAnnotationUpdate={handleAnnotationUpdate}
            onAnnotationDelete={handleAnnotationDelete}
            annotations={annotations}
            className="aspect-video"
            ref={videoPlayerRef}
          />

          {/* Comment markers */}
          <CommentMarkersTimeline comments={comments} duration={duration} onMarkerClick={handleMarkerClick} />
        </div>

        <div className="col-span-1">
          {showCollaboration && (
            <div className="mb-4">
              <CollaborationPanel videoId={currentVideo.id} videoTitle={currentVideo.title} />
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="comments" className="flex-1">
                Comentários
              </TabsTrigger>
              <TabsTrigger value="annotations" className="flex-1">
                Anotações
              </TabsTrigger>
              <TabsTrigger value="deliveries" className="flex-1">
                Entregas
              </TabsTrigger>
              <TabsTrigger value="edits" className="flex-1">
                Edições
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Digite seu comentário sobre este ponto do vídeo..."
                    className="min-h-[80px]"
                    value={newCommentText}
                    onChange={handleCommentInputChange}
                    onBlur={() => isJoined && setTyping(false)}
                  />
                  <Button onClick={handleAddComment}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label>Filtrar:</Label>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="resolved"
                        checked={showResolved}
                        onCheckedChange={(checked) => setShowResolved(!!checked)}
                      />
                      <Label htmlFor="resolved" className="cursor-pointer">
                        Resolvidos
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="pending"
                        checked={showPending}
                        onCheckedChange={(checked) => setShowPending(!!checked)}
                      />
                      <Label htmlFor="pending" className="cursor-pointer">
                        Pendentes
                      </Label>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" onClick={handleOpenExportModal}>
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Label>Cor:</Label>
                  <Select
                    value={commentColor}
                    onValueChange={setCommentColor}
                    className="w-[150px]"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma cor" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMENT_COLORS.map((color) => (
                        <SelectItem key={color.id} value={color.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color.color }}
                            />
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterByColor(null)}
                  >
                    <Hash className="h-4 w-4 mr-2" />
                    Limpar filtro
                  </Button>
                </div>

                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {filteredComments.length > 0 ? (
                      filteredComments.map((comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          onResolve={handleResolveComment}
                          onReopen={handleReopenComment}
                          onEdit={handleEditComment}
                          onDelete={handleDeleteComment}
                          onJumpToTime={(time) => setCurrentTime(time)}
                        />
                      ))
                    ) : (
                      <Card>
                        <CardContent className="p-4 text-center text-muted-foreground">
                          Nenhum comentário encontrado com os filtros atuais.
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="annotations" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Use as ferramentas de anotação no player de vídeo para adicionar marcações visuais.
                  </p>
                </div>

                <AnnotationList
                  annotations={annotations}
                  onDeleteAnnotation={handleAnnotationDelete}
                  onJumpToTime={(time) => setCurrentTime(time)}
                  onExport={handleOpenExportModal}
                />

                <div className="space-y-2 mt-4">
                  <h3 className="text-sm font-medium">Dicas de uso:</h3>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                    <li>Pause o vídeo antes de adicionar anotações</li>
                    <li>Clique no botão de lápis para ativar o modo de anotação</li>
                    <li>Selecione a ferramenta, cor e espessura desejada</li>
                    <li>Clique e arraste para desenhar no vídeo</li>
                    <li>As anotações são visíveis por 5 segundos a partir do ponto onde foram criadas</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deliveries" className="space-y-4 mt-4">
              <Card className="bg-secondary/20">
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-medium">Versão atual: v1.2</h3>
                  <div className="text-sm">Enviada por: Maria Souza</div>
                  <div className="text-sm">Data: 19/05/2025 14:30</div>
                  <div className="text-sm">Status: Em revisão</div>
                </CardContent>
              </Card>

              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex justify-between">
                        <div className="font-medium">Versão 1.2</div>
                        <div className="text-warning">Em revisão</div>
                      </div>
                      <p className="text-sm">Ajustes de cor e cortes solicitados</p>
                      <div className="text-xs text-muted-foreground">19/05/2025 14:30</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex justify-between">
                        <div className="font-medium">Versão 1.1</div>
                        <div className="text-destructive">Rejeitada</div>
                      </div>
                      <p className="text-sm">Primeira revisão com ajustes de áudio</p>
                      <div className="text-xs text-muted-foreground">18/05/2025 16:45</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex justify-between">
                        <div className="font-medium">Versão 1.0</div>
                        <div className="text-destructive">Rejeitada</div>
                      </div>
                      <p className="text-sm">Primeira versão do vídeo</p>
                      <div className="text-xs text-muted-foreground">17/05/2025 10:20</div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>

              <div className="space-y-4">
                <Card className="border-primary/50 bg-primary/5">
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-medium text-primary">Ação de aprovação:</h3>
                    <div className="flex gap-2">
                      <Button className="bg-success hover:bg-success/80 text-success-foreground">Aprovar</Button>
                      <Button variant="destructive">Solicitar ajustes</Button>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full">Nova Entrega</Button>
              </div>
            </TabsContent>

            <TabsContent value="edits" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Edições de Vídeo</h2>
                  <Button onClick={() => setIsExportModalOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar Edição
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium">Versão 1.2</h3>
                      <p className="text-sm text-muted-foreground">
                        Ajustes de cor e cortes solicitados pelo cliente.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium">Versão 1.1</h3>
                      <p className="text-sm text-muted-foreground">
                        Primeira revisão com ajustes de áudio.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex items-center gap-4">
                  <Button className="flex-1">
                    <Share className="h-4 w-4 mr-2" />
                    Compartilhar link
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Solicitar feedback
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modais de exportação */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        comments={comments}
        annotations={annotations}
        videoTitle={currentVideo.title}
        onExport={handleExport}
      />

      <ExportPreview
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        previewUrl={exportPreviewUrl}
        filename={exportFilename}
        format={exportFormat}
        isLoading={isExportLoading}
      />
    </div>
  )
}

// Componente wrapper com o provider de colaboração
export default function EditingWidget() {
  return (
    <CollaborationProvider>
      <EditingWidgetContent />
    </CollaborationProvider>
  )
}
