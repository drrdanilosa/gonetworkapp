"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useCollaboration } from "@/contexts/collaboration-context"

export type AnnotationTool = "pen" | "arrow" | "rectangle" | "ellipse" | "text" | "highlighter" | "eraser"

export interface Annotation {
  id: string
  timeStart: number
  timeEnd: number
  tool: AnnotationTool
  color: string
  thickness: number
  points: { x: number; y: number }[]
  text?: string
  completed: boolean
  userId?: string
  userName?: string
  userColor?: string
}

interface AnnotationCanvasProps {
  videoWidth: number
  videoHeight: number
  currentTime: number
  isPlaying: boolean
  annotations: Annotation[]
  onAnnotationCreate: (annotation: Annotation) => void
  onAnnotationUpdate: (annotation: Annotation) => void
  onAnnotationStart?: (annotation: Annotation) => void
  selectedTool: AnnotationTool
  selectedColor: string
  selectedThickness: number
  isAnnotationMode: boolean
  className?: string
}

export default function AnnotationCanvas({
  videoWidth,
  videoHeight,
  currentTime,
  isPlaying,
  annotations,
  onAnnotationCreate,
  onAnnotationUpdate,
  onAnnotationStart,
  selectedTool,
  selectedColor,
  selectedThickness,
  isAnnotationMode,
  className,
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null)
  const [textInput, setTextInput] = useState("")
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null)
  const [visibleAnnotations, setVisibleAnnotations] = useState<Annotation[]>([])

  // Collaboration context
  const { currentUser } = useCollaboration()

  // Redimensionar o canvas para corresponder ao tamanho do vídeo
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = videoWidth
    canvas.height = videoHeight
  }, [videoWidth, videoHeight])

  // Filtrar anotações visíveis com base no tempo atual
  useEffect(() => {
    const visible = annotations.filter(
      (annotation) => currentTime >= annotation.timeStart && currentTime <= annotation.timeEnd,
    )
    setVisibleAnnotations(visible)
  }, [annotations, currentTime])

  // Renderizar anotações visíveis
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Limpar o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Desenhar todas as anotações visíveis
    visibleAnnotations.forEach((annotation) => {
      if (!annotation.completed) return

      ctx.strokeStyle = annotation.color
      ctx.fillStyle = annotation.color
      ctx.lineWidth = annotation.thickness
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      switch (annotation.tool) {
        case "pen":
          drawPen(ctx, annotation.points)
          break
        case "highlighter":
          drawHighlighter(ctx, annotation.points, annotation.thickness)
          break
        case "arrow":
          drawArrow(ctx, annotation.points)
          break
        case "rectangle":
          drawRectangle(ctx, annotation.points)
          break
        case "ellipse":
          drawEllipse(ctx, annotation.points)
          break
        case "text":
          if (annotation.text) {
            drawText(ctx, annotation.points[0], annotation.text, annotation.color, annotation.thickness)
          }
          break
        case "eraser":
          // Eraser não é renderizado
          break
      }
    })
  }, [visibleAnnotations])

  // Funções de desenho para diferentes ferramentas
  const drawPen = (ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) => {
    if (points.length < 2) return

    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }

    ctx.stroke()
  }

  const drawHighlighter = (ctx: CanvasRenderingContext2D, points: { x: number; y: number }[], thickness: number) => {
    if (points.length < 2) return

    const originalGlobalAlpha = ctx.globalAlpha
    const originalLineWidth = ctx.lineWidth

    ctx.globalAlpha = 0.3
    ctx.lineWidth = thickness * 2

    drawPen(ctx, points)

    ctx.globalAlpha = originalGlobalAlpha
    ctx.lineWidth = originalLineWidth
  }

  const drawArrow = (ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) => {
    if (points.length < 2) return

    const start = points[0]
    const end = points[points.length - 1]

    // Desenhar a linha
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()

    // Desenhar a ponta da seta
    const angle = Math.atan2(end.y - start.y, end.x - start.x)
    const headLength = 15 // Tamanho da ponta da seta

    ctx.beginPath()
    ctx.moveTo(end.x, end.y)
    ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6))
    ctx.moveTo(end.x, end.y)
    ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6))
    ctx.stroke()
  }

  const drawRectangle = (ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) => {
    if (points.length < 2) return

    const start = points[0]
    const end = points[points.length - 1]

    const width = end.x - start.x
    const height = end.y - start.y

    ctx.beginPath()
    ctx.rect(start.x, start.y, width, height)
    ctx.stroke()
  }

  const drawEllipse = (ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) => {
    if (points.length < 2) return

    const start = points[0]
    const end = points[points.length - 1]

    const centerX = (start.x + end.x) / 2
    const centerY = (start.y + end.y) / 2
    const radiusX = Math.abs(end.x - start.x) / 2
    const radiusY = Math.abs(end.y - start.y) / 2

    ctx.beginPath()
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
    ctx.stroke()
  }

  const drawText = (
    ctx: CanvasRenderingContext2D,
    position: { x: number; y: number },
    text: string,
    color: string,
    size: number,
  ) => {
    ctx.font = `${Math.max(12, size * 5)}px sans-serif`
    ctx.fillStyle = color
    ctx.fillText(text, position.x, position.y)
  }

  // Manipuladores de eventos do mouse
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAnnotationMode || isPlaying) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (selectedTool === "text") {
      setTextPosition({ x, y })
      return
    }

    // Criar uma nova anotação
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      timeStart: currentTime,
      timeEnd: currentTime + 5, // Anotação visível por 5 segundos por padrão
      tool: selectedTool,
      color: selectedColor,
      thickness: selectedThickness,
      points: [{ x, y }],
      completed: false,
      userId: currentUser?.id,
      userName: currentUser?.name,
      userColor: currentUser?.color,
    }

    setCurrentAnnotation(newAnnotation)
    setIsDrawing(true)

    // Notificar o início da anotação para colaboração
    onAnnotationStart?.(newAnnotation)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Atualizar a anotação atual com o novo ponto
    const updatedAnnotation = {
      ...currentAnnotation,
      points: [...currentAnnotation.points, { x, y }],
    }

    setCurrentAnnotation(updatedAnnotation)

    // Notificar a atualização da anotação para colaboração
    onAnnotationUpdate(updatedAnnotation)

    // Renderizar a anotação atual
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Desenhar anotações existentes
    visibleAnnotations.forEach((annotation) => {
      if (!annotation.completed) return

      ctx.strokeStyle = annotation.color
      ctx.fillStyle = annotation.color
      ctx.lineWidth = annotation.thickness
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      switch (annotation.tool) {
        case "pen":
          drawPen(ctx, annotation.points)
          break
        case "highlighter":
          drawHighlighter(ctx, annotation.points, annotation.thickness)
          break
        case "arrow":
          drawArrow(ctx, annotation.points)
          break
        case "rectangle":
          drawRectangle(ctx, annotation.points)
          break
        case "ellipse":
          drawEllipse(ctx, annotation.points)
          break
        case "text":
          if (annotation.text) {
            drawText(ctx, annotation.points[0], annotation.text, annotation.color, annotation.thickness)
          }
          break
      }
    })

    // Desenhar a anotação atual
    ctx.strokeStyle = updatedAnnotation.color
    ctx.fillStyle = updatedAnnotation.color
    ctx.lineWidth = updatedAnnotation.thickness
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    switch (updatedAnnotation.tool) {
      case "pen":
        drawPen(ctx, updatedAnnotation.points)
        break
      case "highlighter":
        drawHighlighter(ctx, updatedAnnotation.points, updatedAnnotation.thickness)
        break
      case "arrow":
        drawArrow(ctx, updatedAnnotation.points)
        break
      case "rectangle":
        drawRectangle(ctx, updatedAnnotation.points)
        break
      case "ellipse":
        drawEllipse(ctx, updatedAnnotation.points)
        break
      case "eraser":
        // Implementar lógica de apagador
        break
    }
  }

  const handleMouseUp = () => {
    if (!isDrawing || !currentAnnotation) return

    // Finalizar a anotação atual
    const completedAnnotation = {
      ...currentAnnotation,
      completed: true,
    }

    setCurrentAnnotation(null)
    setIsDrawing(false)

    // Salvar a anotação
    onAnnotationCreate(completedAnnotation)
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!textPosition || !textInput.trim()) {
      setTextPosition(null)
      setTextInput("")
      return
    }

    // Criar uma nova anotação de texto
    const textAnnotation: Annotation = {
      id: Date.now().toString(),
      timeStart: currentTime,
      timeEnd: currentTime + 5,
      tool: "text",
      color: selectedColor,
      thickness: selectedThickness,
      points: [textPosition],
      text: textInput,
      completed: true,
      userId: currentUser?.id,
      userName: currentUser?.name,
      userColor: currentUser?.color,
    }

    // Salvar a anotação
    onAnnotationCreate(textAnnotation)

    // Limpar o estado
    setTextPosition(null)
    setTextInput("")
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute top-0 left-0 z-10 pointer-events-none",
          isAnnotationMode && !isPlaying && "pointer-events-auto cursor-crosshair",
          className,
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {textPosition && (
        <div
          className="absolute z-20 bg-background border rounded-md p-2 shadow-md"
          style={{ top: textPosition.y + 10, left: textPosition.x }}
        >
          <form onSubmit={handleTextSubmit} className="flex flex-col gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              placeholder="Digite o texto..."
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-2 py-1 text-xs bg-secondary rounded"
                onClick={() => {
                  setTextPosition(null)
                  setTextInput("")
                }}
              >
                Cancelar
              </button>
              <button type="submit" className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded">
                Adicionar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
