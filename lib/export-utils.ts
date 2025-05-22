import type { Comment } from "@/components/video/comment-markers-timeline"
import type { Annotation } from "@/components/video/annotation-canvas"
import type { ExportOptions } from "@/components/export/export-modal"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

// Função auxiliar para formatar o tempo
export const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds)) return "00:00"

  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = Math.floor(timeInSeconds % 60)
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

// Função auxiliar para formatar a data
export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Função para obter o nome da ferramenta de anotação
export const getToolName = (tool: string) => {
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

// Função para filtrar comentários e anotações com base nas opções
export const filterFeedbackItems = (comments: Comment[], annotations: Annotation[], options: ExportOptions) => {
  let filteredComments: Comment[] = []
  let filteredAnnotations: Annotation[] = []

  // Filtrar comentários
  if (options.includeComments) {
    filteredComments = comments.filter((comment) => {
      if (comment.isResolved && !options.includeResolved) return false
      if (!comment.isResolved && !options.includePending) return false
      return true
    })
  }

  // Filtrar anotações
  if (options.includeAnnotations) {
    filteredAnnotations = annotations.filter(() => true) // Não temos status para anotações ainda
  }

  return { filteredComments, filteredAnnotations }
}

// Função para ordenar os itens com base nas opções
export const sortFeedbackItems = (comments: Comment[], annotations: Annotation[], sortBy: ExportOptions["sortBy"]) => {
  const sortedComments = [...comments]
  const sortedAnnotations = [...annotations]

  switch (sortBy) {
    case "time":
      sortedComments.sort((a, b) => a.time - b.time)
      sortedAnnotations.sort((a, b) => a.timeStart - b.timeStart)
      break
    case "type":
      // Já estão separados por tipo
      break
    case "author":
      sortedComments.sort((a, b) => a.author.localeCompare(b.author))
      // Anotações não têm autor ainda
      break
    case "status":
      sortedComments.sort((a, b) => {
        if (a.isResolved === b.isResolved) return 0
        return a.isResolved ? 1 : -1
      })
      break
  }

  return { sortedComments, sortedAnnotations }
}

// Função para exportar para CSV
export const exportToCSV = async (
  comments: Comment[],
  annotations: Annotation[],
  options: ExportOptions,
  videoTitle: string,
): Promise<string> => {
  const { filteredComments, filteredAnnotations } = filterFeedbackItems(comments, annotations, options)
  const { sortedComments, sortedAnnotations } = sortFeedbackItems(filteredComments, filteredAnnotations, options.sortBy)

  let csvContent = "Tipo,Tempo,Autor,Status,Conteúdo,Data de Criação\n"

  // Adicionar comentários
  if (options.includeComments) {
    sortedComments.forEach((comment) => {
      const row = [
        "Comentário",
        formatTime(comment.time),
        comment.author,
        comment.isResolved ? "Resolvido" : "Pendente",
        `"${comment.text.replace(/"/g, '""')}"`,
        formatDate(comment.createdAt),
      ]
      csvContent += row.join(",") + "\n"
    })
  }

  // Adicionar anotações
  if (options.includeAnnotations) {
    sortedAnnotations.forEach((annotation) => {
      const row = [
        `Anotação (${getToolName(annotation.tool)})`,
        formatTime(annotation.timeStart),
        "Sistema", // Placeholder para autor
        "N/A", // Placeholder para status
        annotation.text ? `"${annotation.text.replace(/"/g, '""')}"` : `"Anotação visual"`,
        "N/A", // Placeholder para data de criação
      ]
      csvContent += row.join(",") + "\n"
    })
  }

  return csvContent
}

// Função para exportar para PDF
export const exportToPDF = async (
  comments: Comment[],
  annotations: Annotation[],
  options: ExportOptions,
  videoTitle: string,
  videoScreenshots?: { time: number; dataUrl: string }[],
): Promise<Blob> => {
  const { filteredComments, filteredAnnotations } = filterFeedbackItems(comments, annotations, options)
  const { sortedComments, sortedAnnotations } = sortFeedbackItems(filteredComments, filteredAnnotations, options.sortBy)

  // Criar novo documento PDF
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Adicionar título
  doc.setFontSize(18)
  doc.text(`Relatório de Feedback: ${videoTitle}`, 14, 20)

  doc.setFontSize(12)
  doc.text(`Data de exportação: ${new Date().toLocaleDateString("pt-BR")}`, 14, 30)

  let yPosition = 40

  // Adicionar resumo
  doc.setFontSize(14)
  doc.text("Resumo", 14, yPosition)
  yPosition += 8

  doc.setFontSize(10)
  const totalComments = filteredComments.length
  const resolvedComments = filteredComments.filter((c) => c.isResolved).length
  const pendingComments = totalComments - resolvedComments
  const totalAnnotations = filteredAnnotations.length

  doc.text(`Total de comentários: ${totalComments}`, 14, yPosition)
  yPosition += 5
  doc.text(`Comentários resolvidos: ${resolvedComments}`, 14, yPosition)
  yPosition += 5
  doc.text(`Comentários pendentes: ${pendingComments}`, 14, yPosition)
  yPosition += 5
  doc.text(`Total de anotações visuais: ${totalAnnotations}`, 14, yPosition)
  yPosition += 10

  // Adicionar comentários
  if (options.includeComments && sortedComments.length > 0) {
    doc.setFontSize(14)
    doc.text("Comentários", 14, yPosition)
    yPosition += 8

    // @ts-ignore - jsPDF-autotable não tem tipos TS adequados
    doc.autoTable({
      startY: yPosition,
      head: [["Tempo", "Autor", "Status", "Comentário", "Data"]],
      body: sortedComments.map((comment) => [
        formatTime(comment.time),
        comment.author,
        comment.isResolved ? "Resolvido" : "Pendente",
        comment.text,
        formatDate(comment.createdAt),
      ]),
      theme: "striped",
      headStyles: { fillColor: [128, 0, 128] },
      margin: { top: 10 },
    })

    // @ts-ignore - Obter a posição Y final da tabela
    yPosition = doc.lastAutoTable.finalY + 10
  }

  // Adicionar anotações
  if (options.includeAnnotations && sortedAnnotations.length > 0) {
    // Verificar se precisamos adicionar uma nova página
    if (yPosition > 240) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(14)
    doc.text("Anotações Visuais", 14, yPosition)
    yPosition += 8

    // @ts-ignore - jsPDF-autotable não tem tipos TS adequados
    doc.autoTable({
      startY: yPosition,
      head: [["Tempo", "Tipo", "Descrição"]],
      body: sortedAnnotations.map((annotation) => [
        formatTime(annotation.timeStart),
        getToolName(annotation.tool),
        annotation.text || "Anotação visual",
      ]),
      theme: "striped",
      headStyles: { fillColor: [128, 0, 128] },
      margin: { top: 10 },
    })

    // @ts-ignore - Obter a posição Y final da tabela
    yPosition = doc.lastAutoTable.finalY + 10
  }

  // Adicionar screenshots se disponíveis
  if (options.includeScreenshots && videoScreenshots && videoScreenshots.length > 0) {
    // Adicionar uma nova página para os screenshots
    doc.addPage()
    yPosition = 20

    doc.setFontSize(14)
    doc.text("Capturas de Tela com Anotações", 14, yPosition)
    yPosition += 10

    // Adicionar cada screenshot
    for (let i = 0; i < videoScreenshots.length; i++) {
      const screenshot = videoScreenshots[i]

      // Verificar se precisamos adicionar uma nova página
      if (yPosition > 240) {
        doc.addPage()
        yPosition = 20
      }

      // Adicionar o tempo do screenshot
      doc.setFontSize(10)
      doc.text(`Tempo: ${formatTime(screenshot.time)}`, 14, yPosition)
      yPosition += 5

      try {
        // Adicionar a imagem
        const imgWidth = 180 // Largura em mm
        const imgHeight = 100 // Altura em mm
        doc.addImage(screenshot.dataUrl, "JPEG", 14, yPosition, imgWidth, imgHeight)
        yPosition += imgHeight + 15
      } catch (error) {
        console.error("Erro ao adicionar imagem:", error)
        doc.text("Erro ao adicionar imagem", 14, yPosition)
        yPosition += 10
      }
    }
  }

  // Retornar o PDF como Blob
  return doc.output("blob")
}

// Função para capturar screenshots do vídeo com anotações
export const captureVideoScreenshots = async (
  videoElement: HTMLVideoElement,
  canvasElement: HTMLCanvasElement,
  annotations: Annotation[],
): Promise<{ time: number; dataUrl: string }[]> => {
  const screenshots: { time: number; dataUrl: string }[] = []
  const currentTime = videoElement.currentTime

  // Agrupar anotações por tempo para evitar capturas duplicadas
  const timeGroups = new Map<number, Annotation[]>()

  annotations.forEach((annotation) => {
    const time = annotation.timeStart
    if (!timeGroups.has(time)) {
      timeGroups.set(time, [])
    }
    timeGroups.get(time)?.push(annotation)
  })

  // Capturar screenshots para cada grupo de tempo
  for (const [time, timeAnnotations] of timeGroups.entries()) {
    try {
      // Definir o tempo do vídeo
      videoElement.currentTime = time

      // Esperar o vídeo carregar o frame
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          videoElement.removeEventListener("seeked", onSeeked)
          resolve()
        }
        videoElement.addEventListener("seeked", onSeeked)
      })

      // Capturar o frame do vídeo
      const canvas = document.createElement("canvas")
      canvas.width = videoElement.videoWidth
      canvas.height = videoElement.videoHeight
      const ctx = canvas.getContext("2d")

      if (ctx) {
        // Desenhar o frame do vídeo
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

        // Adicionar o screenshot à lista
        screenshots.push({
          time,
          dataUrl: canvas.toDataURL("image/jpeg", 0.7),
        })
      }
    } catch (error) {
      console.error(`Erro ao capturar screenshot no tempo ${time}:`, error)
    }
  }

  // Restaurar o tempo original do vídeo
  videoElement.currentTime = currentTime

  return screenshots
}
