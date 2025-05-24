import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from '@/components/ui/use-toast'

interface GenerateTimelineButtonProps {
  projectId: string // Tornar obrigatório
  disabled?: boolean
  onGenerated: (success: boolean) => void
}

const GenerateTimelineButton: React.FC<GenerateTimelineButtonProps> = ({
  projectId,
  disabled,
  onGenerated,
}) => {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateTimeline = async () => {
    if (!projectId) {
      toast({
        title: 'Erro',
        description: 'ID do projeto não fornecido.',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)

    try {
      // Simular uma chamada de API para gerar a timeline
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Sucesso na geração da timeline
      onGenerated(true)
    } catch (error) {
      console.error('Erro ao gerar timeline:', error)
      onGenerated(false)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleGenerateTimeline}
      disabled={disabled || isGenerating}
      className="transition-all"
    >
      {isGenerating ? 'Gerando...' : 'Gerar Timeline'}
    </Button>
  )
}

export default GenerateTimelineButton
