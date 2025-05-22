"use client"

import { useCollaboration } from "@/contexts/collaboration-context"
import { useEffect, useRef } from "react"

interface RemoteAnnotationsProps {
  canvasWidth: number
  canvasHeight: number
}

export default function RemoteAnnotations({ canvasWidth, canvasHeight }: RemoteAnnotationsProps) {
  const { activeAnnotators, activeUsers } = useCollaboration()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Função para desenhar as anotações remotas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Limpar o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Desenhar todas as anotações ativas
    Object.entries(activeAnnotators).forEach(([userId, annotation]) => {
      const user = activeUsers.find((u) => u.id === userId)
      if (!user) return

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

      // Desenhar o nome do usuário próximo à última posição da anotação
      if (annotation.points.length > 0) {
        const lastPoint = annotation.points[annotation.points.length - 1]
        ctx.font = "12px sans-serif"
        ctx.fillStyle = user.color
        ctx.fillText(user.name, lastPoint.x + 10, lastPoint.y + 10)
      }
    })
  }, [activeAnnotators, activeUsers, canvasWidth, canvasHeight])

  // Redimensionar o canvas quando as dimensões mudarem
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = canvasWidth
    canvas.height = canvasHeight
  }, [canvasWidth, canvasHeight])

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

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 z-20 pointer-events-none"
      width={canvasWidth}
      height={canvasHeight}
    />
  )
}
