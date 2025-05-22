"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Download, Eye } from "lucide-react"

interface ExportPreviewProps {
  isOpen: boolean
  onClose: () => void
  previewUrl: string
  filename: string
  format: "pdf" | "csv"
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
      const link = document.createElement("a")
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
      console.error("Erro ao fazer download:", error)
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Prévia da Exportação</DialogTitle>
          <DialogDescription>Visualize o arquivo antes de fazer o download.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden rounded-md border my-4">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : format === "pdf" ? (
            <iframe src={previewUrl} className="w-full h-full" />
          ) : (
            <div className="bg-secondary/20 p-4 h-full overflow-auto">
              <pre className="text-xs whitespace-pre-wrap">{previewUrl}</pre>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDownloading}>
            Fechar
          </Button>
          {format === "pdf" && (
            <Button variant="outline" onClick={() => window.open(previewUrl, "_blank")} disabled={isDownloading}>
              <Eye className="mr-2 h-4 w-4" />
              Abrir em Nova Aba
            </Button>
          )}
          <Button onClick={handleDownload} disabled={isDownloading}>
            {isDownloading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Download className="mr-2 h-4 w-4" />
            Download {format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
