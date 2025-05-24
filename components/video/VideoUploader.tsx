'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Upload,
  PlayCircle,
  X,
  FileVideo,
  Clock,
  HardDrive,
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { Progress } from '@/components/ui/progress'

interface VideoData {
  id: string
  title: string
  fileName: string
  type: string
  size: number
  duration: string
  thumbnailUrl: string
  uploadDate: string
  localUrl: string
  status: 'uploading' | 'ready' | 'error'
  eventId?: string
}

interface VideoUploaderProps {
  onVideoUpload: (videoData: VideoData) => void
  isDisabled?: boolean
  eventId?: string
  maxFileSize?: number // em MB
  acceptedFormats?: string[]
}

export default function VideoUploader({
  onVideoUpload,
  isDisabled = false,
  eventId,
  maxFileSize = 500, // 500MB por padrão
  acceptedFormats = [
    'video/mp4',
    'video/mov',
    'video/avi',
    'video/mkv',
    'video/webm',
  ],
}: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [uploading, setUploading] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [dragActive, setDragActive] = useState<boolean>(false)
  const [videoDuration, setVideoDuration] = useState<string>('00:00')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Função para formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Função para formatar duração do vídeo
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Função para obter duração do vídeo
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise(resolve => {
      const video = document.createElement('video')
      video.preload = 'metadata'

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        resolve(video.duration)
      }

      video.onerror = () => {
        resolve(0)
      }

      video.src = URL.createObjectURL(file)
    })
  }

  // Validar arquivo
  const validateFile = (file: File): string | null => {
    // Verificar tipo
    if (!acceptedFormats.includes(file.type)) {
      return `Formato não suportado. Formatos aceitos: ${acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`
    }

    // Verificar tamanho
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxFileSize) {
      return `Arquivo muito grande. Tamanho máximo: ${maxFileSize}MB`
    }

    return null
  }

  const handleFileSelect = async (selectedFile: File) => {
    const validationError = validateFile(selectedFile)
    if (validationError) {
      toast({
        title: 'Arquivo inválido',
        description: validationError,
        variant: 'destructive',
      })
      return
    }

    try {
      setFile(selectedFile)

      // Criar preview
      const url = URL.createObjectURL(selectedFile)
      setPreview(url)

      // Definir título baseado no nome do arquivo
      const fileName = selectedFile.name.split('.').slice(0, -1).join('.')
      setTitle(fileName)

      // Obter duração do vídeo
      const duration = await getVideoDuration(selectedFile)
      setVideoDuration(formatDuration(duration))

      toast({
        title: 'Arquivo selecionado',
        description: `${selectedFile.name} (${formatFileSize(selectedFile.size)})`,
      })
    } catch (error) {
      console.error('Erro ao processar arquivo:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível processar o arquivo selecionado.',
        variant: 'destructive',
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  // Handlers para drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [])

  const handleRemoveFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setFile(null)
    setPreview('')
    setTitle('')
    setVideoDuration('00:00')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (!file || uploading) return

    if (!title.trim()) {
      toast({
        title: 'Título obrigatório',
        description: 'Por favor, defina um título para o vídeo.',
        variant: 'destructive',
      })
      return
    }

    try {
      setUploading(true)
      setProgress(0)

      // Simular progresso de upload mais realista
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 200)

      // Simular upload (em produção, aqui seria feita a requisição real)
      await new Promise(resolve => setTimeout(resolve, 3000))

      clearInterval(progressInterval)
      setProgress(95)

      // Criar metadados do vídeo
      const videoData: VideoData = {
        id: Date.now().toString(),
        title: title.trim(),
        fileName: file.name,
        type: file.type,
        size: file.size,
        duration: videoDuration,
        thumbnailUrl: preview,
        uploadDate: new Date().toISOString(),
        localUrl: preview,
        status: 'ready',
        eventId: eventId,
      }

      // Simular processamento final
      await new Promise(resolve => setTimeout(resolve, 500))
      setProgress(100)

      // Enviar dados para o componente pai
      onVideoUpload(videoData)

      toast({
        title: 'Upload concluído',
        description: `"${title}" foi enviado com sucesso e está pronto para aprovação.`,
      })

      // Limpar formulário após sucesso
      setTimeout(() => {
        handleRemoveFile()
        setUploading(false)
        setProgress(0)
      }, 1500)
    } catch (error) {
      console.error('Erro no upload:', error)
      toast({
        title: 'Erro no upload',
        description:
          'Não foi possível concluir o upload do vídeo. Tente novamente.',
        variant: 'destructive',
      })
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileVideo className="size-5" />
          Upload de Vídeo para Aprovação
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div
            className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDisabled
                ? 'cursor-not-allowed border-muted bg-muted'
                : dragActive
                  ? 'border-primary bg-primary/5'
                  : 'cursor-pointer hover:border-primary hover:bg-muted/50'
            }`}
            onClick={() => !isDisabled && fileInputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats.join(',')}
              className="hidden"
              onChange={handleInputChange}
              disabled={isDisabled}
            />
            <Upload
              className={`mx-auto mb-4 size-12 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`}
            />
            <p className="mb-2 text-lg font-medium">
              {dragActive
                ? 'Solte o arquivo aqui'
                : 'Arraste um vídeo ou clique para selecionar'}
            </p>
            <p className="text-sm text-muted-foreground">
              Formatos suportados:{' '}
              {acceptedFormats
                .map(f => f.split('/')[1].toUpperCase())
                .join(', ')}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tamanho máximo: {maxFileSize}MB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
              {preview && (
                <video
                  src={preview}
                  controls
                  className="size-full object-contain"
                  preload="metadata"
                />
              )}

              {!uploading && (
                <button
                  onClick={handleRemoveFile}
                  className="absolute right-2 top-2 rounded-full bg-red-600/80 p-2 transition-colors hover:bg-red-600"
                  title="Remover arquivo"
                >
                  <X className="size-4 text-white" />
                </button>
              )}
            </div>

            {/* Informações do arquivo */}
            <div className="grid grid-cols-1 gap-4 rounded-lg bg-muted/50 p-4 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <HardDrive className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tamanho</p>
                  <p className="text-sm font-medium">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Duração</p>
                  <p className="text-sm font-medium">{videoDuration}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileVideo className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Formato</p>
                  <p className="text-sm font-medium">
                    {file.type.split('/')[1].toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Título do vídeo *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full rounded-md border p-3 focus:border-transparent focus:ring-2 focus:ring-primary"
                placeholder="Digite um título descritivo para o vídeo"
                disabled={uploading}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/100 caracteres
              </p>
            </div>

            {uploading && (
              <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    Enviando vídeo...
                  </span>
                  <span className="text-sm font-medium text-blue-700">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-blue-700">
                  {progress < 30 && 'Preparando arquivo...'}
                  {progress >= 30 && progress < 70 && 'Enviando dados...'}
                  {progress >= 70 && progress < 95 && 'Processando vídeo...'}
                  {progress >= 95 && 'Finalizando...'}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {file && !uploading && (
          <>
            <Button
              variant="outline"
              onClick={handleRemoveFile}
              className="flex items-center gap-2"
            >
              <X className="size-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!title.trim()}
              className="flex items-center gap-2"
            >
              <Upload className="size-4" />
              Enviar para Aprovação
            </Button>
          </>
        )}
        {uploading && (
          <div className="flex w-full justify-center">
            <Button disabled className="flex items-center gap-2">
              <div className="size-4 animate-spin rounded-full border-b-2 border-white"></div>
              Enviando...
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
