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
  const { briefing, loading, error, saveBriefing, refetch } =
    useBriefing(eventId)
  const { toast } = useToast()

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      await saveBriefing(data)
      toast({
        title: 'Sucesso',
        description: 'Briefing salvo com sucesso',
        variant: 'default',
      })
    } catch (error) {
      console.error('Erro ao salvar briefing:', error)
      toast({
        title: 'Erro',
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível salvar o briefing',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-2xl space-y-4">
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
        <Card className="space-y-4 border-destructive bg-destructive/10 p-6 text-center">
          <AlertCircle className="mx-auto size-10 text-destructive" />
          <h3 className="text-xl font-bold">Erro ao carregar briefing</h3>
          <p>{error}</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 size-4" />
            Tentar novamente
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">Briefing do Evento</h2>

      {briefing ? (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nome do Projeto
                </label>
                <Input
                  name="projectName"
                  defaultValue={briefing.projectName || ''}
                  placeholder="Ex: Lançamento Produto XYZ"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Cliente
                </label>
                <Input
                  name="client"
                  defaultValue={briefing.client || ''}
                  placeholder="Nome do cliente"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Data do Evento
                </label>
                <Input
                  type="date"
                  name="eventDate"
                  defaultValue={briefing.eventDate || ''}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Local</label>
                <Input
                  name="location"
                  defaultValue={briefing.location || ''}
                  placeholder="Endereço ou local do evento"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Descrição
                </label>
                <Textarea
                  name="description"
                  defaultValue={briefing.description || ''}
                  placeholder="Descrição detalhada do evento"
                  rows={4}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Público Alvo
                </label>
                <Input
                  name="targetAudience"
                  defaultValue={briefing.targetAudience || ''}
                  placeholder="Perfil do público esperado"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Requisitos Especiais
                </label>
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
              <RefreshCw className="mr-2 size-4" />
              Atualizar
            </Button>
            <Button type="submit">
              <Check className="mr-2 size-4" />
              Salvar Briefing
            </Button>
          </div>
        </form>
      ) : (
        <div className="py-12 text-center">
          <div className="rounded-md border border-blue-200 bg-blue-50 p-6">
            <h3 className="mb-2 text-lg font-medium">
              Nenhum briefing encontrado
            </h3>
            <p className="mb-4 text-muted-foreground">
              Crie um novo briefing para este evento preenchendo as informações
              abaixo.
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
