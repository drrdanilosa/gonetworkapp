'use client'

import { useRef, useCallback } from 'react'

interface UseSignaturePadOptions {
  backgroundColor?: string
  penColor?: string
  minWidth?: number
  maxWidth?: number
}

export function useSignaturePad(options: UseSignaturePadOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  const {
    backgroundColor = '#ffffff',
    penColor = '#000000',
    minWidth = 1,
    maxWidth = 3,
  } = options

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio

    // Scale context to ensure correct drawing on retina displays
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Set canvas style
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'

    // Set drawing styles
    ctx.strokeStyle = penColor
    ctx.lineWidth = maxWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.fillStyle = backgroundColor

    // Fill background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [backgroundColor, penColor, maxWidth])

  const getEventPoint = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    
    if (e.type.startsWith('touch')) {
      const touch = (e as TouchEvent).touches[0] || (e as TouchEvent).changedTouches[0]
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    } else {
      const mouse = e as MouseEvent
      return {
        x: mouse.clientX - rect.left,
        y: mouse.clientY - rect.top,
      }
    }
  }, [])

  const startDrawing = useCallback((e: MouseEvent | TouchEvent) => {
    const point = getEventPoint(e)
    if (!point) return

    isDrawingRef.current = true
    lastPointRef.current = point

    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(point.x, point.y)
    }
  }, [getEventPoint])

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawingRef.current) return

    const point = getEventPoint(e)
    if (!point || !lastPointRef.current) return

    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    // Calculate line width based on speed
    const distance = Math.sqrt(
      Math.pow(point.x - lastPointRef.current.x, 2) +
      Math.pow(point.y - lastPointRef.current.y, 2)
    )
    
    const speed = distance
    let lineWidth = Math.max(minWidth, Math.min(maxWidth, maxWidth - speed * 0.1))

    ctx.lineWidth = lineWidth
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(point.x, point.y)

    lastPointRef.current = point
  }, [getEventPoint, minWidth, maxWidth])

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false
    lastPointRef.current = null
  }, [])

  const clear = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [backgroundColor])

  const getSignatureData = useCallback((format: 'png' | 'jpeg' = 'png') => {
    const canvas = canvasRef.current
    if (!canvas) return null

    return canvas.toDataURL(`image/${format}`)
  }, [])

  const isEmpty = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return true

    const ctx = canvas.getContext('2d')
    if (!ctx) return true

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Check if canvas is empty (all pixels are the background color)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      // If any pixel is not the background color, canvas is not empty
      if (a !== 0 && (r !== 255 || g !== 255 || b !== 255)) {
        return false
      }
    }

    return true
  }, [])

  return {
    canvasRef,
    setupCanvas,
    startDrawing,
    draw,
    stopDrawing,
    clear,
    getSignatureData,
    isEmpty,
  }
}