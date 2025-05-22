"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Clock, Trash2, FileText } from "lucide-react"
import type { Annotation } from "./annotation-canvas"

interface AnnotationListProps {
  annotations: Annotation[]
  onDeleteAnnotation: (id: string) => void
  onJumpToTime: (time: number) => void
  onExport?: () => void
}

export default function AnnotationList({
  annotations,
  onDeleteAnnotation,
  onJumpToTime,
  onExport,
}: AnnotationListProps) {
  const [filter, setFilter] = useState<string>("all")

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const getToolName = (tool: string) => {
    switch (tool) {
      case "pen":
        return "Caneta"
      case "highlighter":
        return "Marcador"
      case "arrow":
        return "Seta"
      case "rectangle":
        return "Retângulo"
      case "ellipse":
        return "Elipse"
      case "text":
        return "Texto"
      case "eraser":
        return "Borracha"
      default:
        return tool
    }
  }

  const filteredAnnotations = annotations.filter((annotation) => {
    if (filter === "all") return true
    return annotation.tool === filter
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Anotações Visuais</h3>
        <div className="flex items-center gap-2">
          <select
            className="text-xs bg-secondary rounded px-2 py-1"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="pen">Caneta</option>
            <option value="highlighter">Marcador</option>
            <option value="arrow">Seta</option>
            <option value="rectangle">Retângulo</option>
            <option value="ellipse">Elipse</option>
            <option value="text">Texto</option>
          </select>

          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="h-7">
              <FileText className="h-3.5 w-3.5 mr-1" />
              Exportar
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-[200px]">
        <div className="space-y-2 pr-2">
          {filteredAnnotations.length > 0 ? (
            filteredAnnotations.map((annotation) => (
              <Card key={annotation.id} className="overflow-hidden">
                <CardContent className="p-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: annotation.color }}></div>
                      <span className="text-sm font-medium">{getToolName(annotation.tool)}</span>
                    </div>
                    <div
                      className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1"
                      onClick={() => onJumpToTime(annotation.timeStart)}
                    >
                      <Clock className="h-3 w-3" />
                      {formatTime(annotation.timeStart)}
                    </div>
                  </div>

                  {annotation.tool === "text" && (
                    <p className="text-xs border-l-2 pl-2 my-1" style={{ borderColor: annotation.color }}>
                      {annotation.text}
                    </p>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(Date.now() - Math.random() * 3600000), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onDeleteAnnotation(annotation.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
              Nenhuma anotação encontrada com o filtro atual.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
