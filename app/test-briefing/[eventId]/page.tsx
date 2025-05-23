import React from 'react'
import { useBriefing } from '@/hooks/useBriefing'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Função auxiliar para formatar datas de forma segura
const formatProjectDate = (dateValue: any): string => {
  if (!dateValue) return 'Data não informada'
  
  try {
    const date = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue)
    return isValid(date) ? format(date, 'dd MMM yyyy', { locale: ptBR }) : 'Data inválida'
  } catch {
    return 'Data não disponível'
  }
}

export default function BriefingTestPage({ params }: { params: { eventId: string } }) {
  const eventId = params.eventId
  const { briefing, loading, error, saveBriefing, refetch } = useBriefing(eventId)
  
  const handleCreateTestBriefing = async () => {
    const testBriefing = {
      projectName: `Projeto de Teste ${new Date().toLocaleTimeString()}`,
      client: 'Cliente de Teste',
      eventDate: new Date().toISOString().split('T')[0],
      description: 'Descrição do evento de teste criado para validar o sistema de persistência',
      location: 'Local de Teste',
    }
    
    await saveBriefing(testBriefing)
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
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Teste de Persistência de Briefing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Ações</h2>
          <div className="space-y-4">
            <div>
              <Button
                onClick={handleCreateTestBriefing}
                className="w-full mb-2"
              >
                Criar Briefing de Teste
              </Button>
              <p className="text-sm text-muted-foreground">
                Cria um novo briefing com dados aleatórios para teste
              </p>
            </div>
            
            <div>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="w-full mb-2"
              >
                Recarregar Dados
              </Button>
              <p className="text-sm text-muted-foreground">
                Recarrega os dados do briefing do servidor
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Dados Atuais</h2>
          
          {error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              <p className="font-medium">Erro ao carregar dados:</p>
              <p>{error}</p>
            </div>
          ) : briefing ? (
            <div className="space-y-3">
              <div>
                <span className="font-medium">ID do Evento:</span>
                <div className="text-sm bg-muted p-2 rounded">{briefing.eventId}</div>
              </div>
              
              <div>
                <span className="font-medium">Nome do Projeto:</span>
                <div className="text-sm bg-muted p-2 rounded">{briefing.projectName || 'Não informado'}</div>
              </div>
              
              <div>
                <span className="font-medium">Cliente:</span>
                <div className="text-sm bg-muted p-2 rounded">{briefing.client || 'Não informado'}</div>
              </div>
              
              <div>
                <span className="font-medium">Data de Atualização:</span>
                <div className="text-sm bg-muted p-2 rounded">
                  {briefing.updatedAt ? formatProjectDate(briefing.updatedAt) : 'Nunca atualizado'}
                </div>
              </div>
              
              <div>
                <span className="font-medium">Descrição:</span>
                <div className="text-sm bg-muted p-2 rounded whitespace-pre-wrap">
                  {briefing.description || 'Não informada'}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 text-blue-700 rounded-md">
              <p>Nenhum briefing encontrado para este evento.</p>
              <p className="text-sm mt-2">Use o botão ao lado para criar um briefing de teste.</p>
            </div>
          )}
        </Card>
      </div>
      
      <div className="mt-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Instruções de Teste</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Crie um briefing utilizando o botão "Criar Briefing de Teste"</li>
            <li>Verifique se os dados aparecem na seção "Dados Atuais"</li>
            <li>Abra uma nova aba do navegador e acesse a mesma URL</li>
            <li>Verifique se os mesmos dados aparecem na nova aba</li>
            <li>Faça alterações em uma das abas e verifique se ao recarregar a outra aba os dados são atualizados</li>
          </ol>
        </Card>
      </div>
    </div>
  )
}
