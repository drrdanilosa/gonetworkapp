import jsPDF from 'jspdf'

export interface AutorizacaoData {
  nomeAutorizante: string
  documento: string
  numeroDocumento: string
  dataAutorizacao: string
  assinatura: string
  observacoes?: string
  evento?: string
}

export class DocumentUtils {
  static async generateAutorizacaoPDF(data: AutorizacaoData): Promise<Blob> {
    const pdf = new jsPDF()

    // Configurações da página
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - 2 * margin

    // Título
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text('AUTORIZAÇÃO DE USO DE IMAGEM', pageWidth / 2, 30, {
      align: 'center',
    })

    // Linha horizontal
    pdf.setDrawColor(0, 0, 0)
    pdf.line(margin, 40, pageWidth - margin, 40)

    // Conteúdo do documento
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')

    let yPosition = 60
    const lineHeight = 8

    // Texto da autorização
    const textoAutorizacao = [
      `Eu, ${data.nomeAutorizante}, portador(a) do documento ${data.documento} nº ${data.numeroDocumento},`,
      '',
      'AUTORIZO o uso de minha imagem, voz e nome para fins relacionados ao evento descrito neste documento.',
      '',
      'Esta autorização abrange:',
      '• Captação de imagem e voz durante o evento',
      '• Uso para fins de divulgação e documentação',
      '• Publicação em mídias sociais e materiais promocionais',
      '• Arquivo e documentação do evento',
      '',
      'Esta autorização é concedida a título gratuito e por prazo indeterminado.',
      '',
    ]

    textoAutorizacao.forEach(linha => {
      if (linha === '') {
        yPosition += lineHeight / 2
      } else {
        const splitText = pdf.splitTextToSize(linha, contentWidth)
        pdf.text(splitText, margin, yPosition)
        yPosition += splitText.length * lineHeight
      }
    })

    // Informações do evento
    if (data.evento) {
      yPosition += 10
      pdf.setFont('helvetica', 'bold')
      pdf.text('Evento:', margin, yPosition)
      pdf.setFont('helvetica', 'normal')
      pdf.text(data.evento, margin + 25, yPosition)
      yPosition += lineHeight
    }

    // Data da autorização
    yPosition += 10
    pdf.setFont('helvetica', 'bold')
    pdf.text('Data da Autorização:', margin, yPosition)
    pdf.setFont('helvetica', 'normal')

    const dataFormatada = new Date(data.dataAutorizacao).toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    )
    pdf.text(dataFormatada, margin + 50, yPosition)

    // Observações
    if (data.observacoes) {
      yPosition += 20
      pdf.setFont('helvetica', 'bold')
      pdf.text('Observações:', margin, yPosition)
      yPosition += lineHeight
      pdf.setFont('helvetica', 'normal')
      const obsText = pdf.splitTextToSize(data.observacoes, contentWidth)
      pdf.text(obsText, margin, yPosition)
      yPosition += obsText.length * lineHeight
    }

    // Espaço para assinatura
    yPosition += 30

    // Inserir assinatura se disponível
    if (data.assinatura) {
      try {
        // Criar uma imagem temporária para obter dimensões
        const img = new Image()
        img.src = data.assinatura

        await new Promise(resolve => {
          img.onload = resolve
        })

        // Calcular dimensões proporcionais
        const maxWidth = 80
        const maxHeight = 30
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height)
        const width = img.width * ratio
        const height = img.height * ratio

        // Adicionar assinatura ao PDF
        pdf.addImage(data.assinatura, 'PNG', margin, yPosition, width, height)
        yPosition += height + 10
      } catch (error) {
        console.warn('Erro ao adicionar assinatura ao PDF:', error)
      }
    }

    // Linha para assinatura manual (caso não tenha assinatura digital)
    if (!data.assinatura) {
      pdf.line(margin, yPosition + 20, margin + 100, yPosition + 20)
      pdf.setFontSize(10)
      pdf.text('Assinatura do Autorizante', margin, yPosition + 30)
    } else {
      pdf.setFontSize(10)
      pdf.text('Assinatura Digital', margin, yPosition)
    }

    // Rodapé
    pdf.setFontSize(8)
    pdf.setTextColor(128, 128, 128)
    pdf.text(
      `Documento gerado digitalmente em ${new Date().toLocaleDateString('pt-BR')}`,
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    )

    return pdf.output('blob')
  }

  static downloadPDF(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  static async convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type)
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}
