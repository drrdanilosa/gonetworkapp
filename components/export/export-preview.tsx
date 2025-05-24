'use client'

'use client'

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Download, Eye } from 'lucide-react'

interface ExportPreviewProps {
  isOpen: boolean
  onClose: () => void
  previewUrl: string
  filename: string
  format: 'pdf' | 'csv'
  isLoading: boolean
}

export default function ExportPreview({
  isOpen,
  onClose,
  previewUrl,
  filename,
  format,
  isLoading,
}: ExportPreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)

      // Criar um link para download
      const link = document.createElement('a')
      link.href = previewUrl
      link.download = `${filename}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Fechar o modal após o download
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (error) {
      console.error('Erro ao fazer download:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  // Limpar a URL do objeto quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Prévia da Exportação</DialogTitle>
          <DialogDescription>
            Visualize o arquivo antes de fazer o download.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 min-h-0 flex-1 overflow-hidden rounded-md border">
          {isLoading ? (
            <div className="flex size-full items-center justify-center">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : format === 'pdf' ? (
            <iframe src={previewUrl} className="size-full" />
          ) : (
            <div className="h-full overflow-auto bg-secondary/20 p-4">
              <pre className="whitespace-pre-wrap text-xs">{previewUrl}</pre>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDownloading}>
            Fechar
          </Button>
          {format === 'pdf' && (
            <Button
              variant="outline"
              onClick={() => window.open(previewUrl, '_blank')}
              disabled={isDownloading}
            >
              <Eye className="mr-2 size-4" />
              Abrir em Nova Aba
            </Button>
          )}
          <Button onClick={handleDownload} disabled={isDownloading}>
            {isDownloading && <Loader2 className="mr-2 size-4 animate-spin" />}
            <Download className="mr-2 size-4" />
            Download {format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
