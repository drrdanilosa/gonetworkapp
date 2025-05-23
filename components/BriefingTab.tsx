// filepath: /workspaces/melhorapp_final02/components/BriefingTab.tsx
import React from 'react'
import { useBriefing } from '../hooks/useBriefing'
import { Skeleton } from './ui/skeleton'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { AlertCircle, Check, RefreshCw } from 'lucide-react'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface BriefingTabProps {
  eventId: string
}

export default function BriefingTab({ eventId }: BriefingTabProps) {
  const { briefing, loading, error, saveBriefing, refetch } = useBriefing(eventId)
  const { toast } = useToast()
  
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())
    
    const success = await saveBriefing(data)
    
    if (success) {
      toast({
        title: "Sucesso",
        description: "Briefing salvo com sucesso",
        variant: "default",
      })
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o briefing",
        variant: "destructive",
      })
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="space-y-4 w-full max-w-2xl">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-10 w-1/4" />
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <Card className="p-6 text-center space-y-4 bg-destructive/10 border-destructive">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <h3 className="text-xl font-bold">Erro ao carregar briefing</h3>
          <p>{error}</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Briefing do Evento</h2>
      
      {briefing ? (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Projeto</label>
                <Input 
                  name="projectName" 
                  defaultValue={briefing.projectName || ''} 
                  placeholder="Ex: Lançamento Produto XYZ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Cliente</label>
                <Input 
                  name="client" 
                  defaultValue={briefing.client || ''} 
                  placeholder="Nome do cliente"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Data do Evento</label>
                <Input 
                  type="date" 
                  name="eventDate" 
                  defaultValue={briefing.eventDate || ''} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Local</label>
                <Input 
                  name="location" 
                  defaultValue={briefing.location || ''} 
                  placeholder="Endereço ou local do evento" 
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <Textarea 
                  name="description" 
                  defaultValue={briefing.description || ''} 
                  placeholder="Descrição detalhada do evento"
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Público Alvo</label>
                <Input 
                  name="targetAudience" 
                  defaultValue={briefing.targetAudience || ''} 
                  placeholder="Perfil do público esperado"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Requisitos Especiais</label>
                <Textarea 
                  name="specialRequirements" 
                  defaultValue={briefing.specialRequirements || ''} 
                  placeholder="Requisitos específicos para o evento"
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button type="submit">
              <Check className="mr-2 h-4 w-4" />
              Salvar Briefing
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center py-12">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
            <h3 className="text-lg font-medium mb-2">Nenhum briefing encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Crie um novo briefing para este evento preenchendo as informações abaixo.
            </p>
            <Button onClick={() => saveBriefing({ eventId })}>
              Criar Novo Briefing
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
