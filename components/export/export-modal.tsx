"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Loader2, FileText, FileSpreadsheet } from "lucide-react"
import type { Comment } from "@/components/video/comment-markers-timeline"
import type { Annotation } from "@/components/video/annotation-canvas"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  comments: Comment[]
  annotations: Annotation[]
  videoTitle: string
  onExport: (format: "pdf" | "csv", options: ExportOptions) => Promise<void>
}

export interface ExportOptions {
  includeComments: boolean
  includeAnnotations: boolean
  includeScreenshots: boolean
  includeResolved: boolean
  includePending: boolean
  sortBy: "time" | "type" | "author" | "status"
  filename: string
}

export default function ExportModal({
  isOpen,
  onClose,
  comments,
  annotations,
  videoTitle,
  onExport,
}: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf")
  const [isExporting, setIsExporting] = useState(false)
  const [options, setOptions] = useState<ExportOptions>({
    includeComments: true,
    includeAnnotations: true,
    includeScreenshots: true,
    includeResolved: true,
    includePending: true,
    sortBy: "time",
    filename: `${videoTitle.replace(/\s+/g, "_")}_feedback`,
  })

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await onExport(exportFormat, options)
      onClose()
    } catch (error) {
      console.error("Erro ao exportar:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const updateOption = (key: keyof ExportOptions, value: any) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Exportar Feedback</DialogTitle>
          <DialogDescription>Configure as opções para exportar comentários e anotações do vídeo.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pdf" value={exportFormat} onValueChange={(v) => setExportFormat(v as "pdf" | "csv")}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="pdf" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              PDF
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pdf" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Conteúdo</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="include-comments-pdf"
                      checked={options.includeComments}
                      onCheckedChange={(checked) => updateOption("includeComments", !!checked)}
                    />
                    <Label htmlFor="include-comments-pdf">Incluir comentários</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="include-annotations-pdf"
                      checked={options.includeAnnotations}
                      onCheckedChange={(checked) => updateOption("includeAnnotations", !!checked)}
                    />
                    <Label htmlFor="include-annotations-pdf">Incluir anotações visuais</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="include-screenshots-pdf"
                      checked={options.includeScreenshots}
                      disabled={!options.includeAnnotations}
                      onCheckedChange={(checked) => updateOption("includeScreenshots", !!checked)}
                    />
                    <Label
                      htmlFor="include-screenshots-pdf"
                      className={!options.includeAnnotations ? "text-muted-foreground" : ""}
                    >
                      Incluir capturas de tela com anotações
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Filtros</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="include-resolved-pdf"
                      checked={options.includeResolved}
                      onCheckedChange={(checked) => updateOption("includeResolved", !!checked)}
                    />
                    <Label htmlFor="include-resolved-pdf">Incluir itens resolvidos</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="include-pending-pdf"
                      checked={options.includePending}
                      onCheckedChange={(checked) => updateOption("includePending", !!checked)}
                    />
                    <Label htmlFor="include-pending-pdf">Incluir itens pendentes</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Ordenação</h3>
                <RadioGroup
                  value={options.sortBy}
                  onValueChange={(value) => updateOption("sortBy", value)}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="sort-time-pdf" value="time" />
                    <Label htmlFor="sort-time-pdf">Ordenar por tempo no vídeo</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="sort-type-pdf" value="type" />
                    <Label htmlFor="sort-type-pdf">Ordenar por tipo (comentário/anotação)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="sort-author-pdf" value="author" />
                    <Label htmlFor="sort-author-pdf">Ordenar por autor</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="sort-status-pdf" value="status" />
                    <Label htmlFor="sort-status-pdf">Ordenar por status (resolvido/pendente)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filename-pdf">Nome do arquivo</Label>
                <Input
                  id="filename-pdf"
                  value={options.filename}
                  onChange={(e) => updateOption("filename", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="csv" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Conteúdo</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="include-comments-csv"
                      checked={options.includeComments}
                      onCheckedChange={(checked) => updateOption("includeComments", !!checked)}
                    />
                    <Label htmlFor="include-comments-csv">Incluir comentários</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="include-annotations-csv"
                      checked={options.includeAnnotations}
                      onCheckedChange={(checked) => updateOption("includeAnnotations", !!checked)}
                    />
                    <Label htmlFor="include-annotations-csv">Incluir anotações visuais</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Filtros</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="include-resolved-csv"
                      checked={options.includeResolved}
                      onCheckedChange={(checked) => updateOption("includeResolved", !!checked)}
                    />
                    <Label htmlFor="include-resolved-csv">Incluir itens resolvidos</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="include-pending-csv"
                      checked={options.includePending}
                      onCheckedChange={(checked) => updateOption("includePending", !!checked)}
                    />
                    <Label htmlFor="include-pending-csv">Incluir itens pendentes</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Ordenação</h3>
                <RadioGroup
                  value={options.sortBy}
                  onValueChange={(value) => updateOption("sortBy", value)}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="sort-time-csv" value="time" />
                    <Label htmlFor="sort-time-csv">Ordenar por tempo no vídeo</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="sort-type-csv" value="type" />
                    <Label htmlFor="sort-type-csv">Ordenar por tipo (comentário/anotação)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="sort-author-csv" value="author" />
                    <Label htmlFor="sort-author-csv">Ordenar por autor</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="sort-status-csv" value="status" />
                    <Label htmlFor="sort-status-csv">Ordenar por status (resolvido/pendente)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filename-csv">Nome do arquivo</Label>
                <Input
                  id="filename-csv"
                  value={options.filename}
                  onChange={(e) => updateOption("filename", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Exportar {exportFormat.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
