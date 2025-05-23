"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, PlayCircle, X } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { Progress } from '@/components/ui/progress'

interface VideoUploaderProps {
  onVideoUpload: (videoData: any) => void
  isDisabled?: boolean
}

export default function VideoUploader({ onVideoUpload, isDisabled = false }: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [uploading, setUploading] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      // Verificar se é um arquivo de vídeo
      if (!selectedFile.type.startsWith('video/')) {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo de vídeo.",
          variant: "destructive"
        })
        return
      }
      
      setFile(selectedFile)
      
      // Criar preview
      const url = URL.createObjectURL(selectedFile)
      setPreview(url)
      
      // Definir título baseado no nome do arquivo
      const fileName = selectedFile.name.split('.').slice(0, -1).join('.')
      setTitle(fileName)
    }
  }
  
  const handleRemoveFile = () => {
    setFile(null)
    setPreview('')
    setTitle('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  const handleUpload = async () => {
    if (!file) return
    
    if (!title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, defina um título para o vídeo.",
        variant: "destructive"
      })
      return
    }
    
    try {
      setUploading(true)
      
      // Simular progresso de upload
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(timer)
            return prev
          }
          return prev + 5
        })
      }, 100)
      
      // Na implementação real, você faria o upload para um bucket S3, Cloudinary, etc.
      // Aqui estamos apenas simulando um upload local
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Criar metadados do vídeo
      const videoData = {
        title,
        fileName: file.name,
        type: file.type,
        size: file.size,
        duration: '00:00', // Em uma implementação real, você extrairia a duração
        thumbnailUrl: preview, // Em uma implementação real, isso seria uma URL gerada
        uploadDate: new Date().toISOString(),
        localUrl: preview, // URL temporária para visualização local
      }
      
      // Progresso completo
      setProgress(100)
      
      // Enviar dados para o componente pai
      onVideoUpload(videoData)
      
      toast({
        title: "Upload concluído",
        description: "O vídeo foi enviado com sucesso."
      })
      
      // Limpar formulário
      setTimeout(() => {
        handleRemoveFile()
        setUploading(false)
        setProgress(0)
      }, 1000)
      
    } catch (error) {
      console.error("Erro no upload:", error)
      toast({
        title: "Erro no upload",
        description: "Não foi possível concluir o upload do vídeo.",
        variant: "destructive"
      })
      setUploading(false)
      setProgress(0)
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Upload de Vídeo</CardTitle>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDisabled ? 'bg-muted cursor-not-allowed' : 'cursor-pointer hover:border-primary'
            }`}
            onClick={() => !isDisabled && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isDisabled}
            />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="font-medium">Arraste um vídeo ou clique para selecionar</p>
            <p className="text-sm text-muted-foreground mt-1">
              MP4, MOV e outros formatos suportados
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {preview && (
                <video 
                  src={preview} 
                  controls 
                  className="w-full h-full"
                />
              )}
              
              <button 
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 bg-black/70 rounded-full p-1"
                disabled={uploading}
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Título do vídeo</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Digite um título para o vídeo"
                disabled={uploading}
              />
            </div>
            
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Enviando...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        {file && !uploading && (
          <Button onClick={handleUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Enviar Vídeo
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}