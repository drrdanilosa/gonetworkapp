'use client'

import React, { useState } from 'react'
import { useBriefing } from '../hooks/useBriefing'
import { Skeleton } from './ui/skeleton'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { AlertCircle, Check, RefreshCw, PlusCircle, Trash2, Clock, FileText } from 'lucide-react'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Deliverable } from '@/types/briefing'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Badge } from './ui/badge'

interface EntregasTabProps {
  eventId: string
}

export default function EntregasTab({ eventId }: EntregasTabProps) {
  const { briefing, loading, error, saveBriefing, fetchBriefing } = useBriefing(eventId)
  const { toast } = useToast()
  const [newDeliverable, setNewDeliverable] = useState<Partial<Deliverable>>({
    name: '',
    description: '',
    type: 'document',
    status: 'pending',
    dueDate: '',
    assignedTo: []
  })
  
  const deliverableTypes = [
    { value: 'document', label: 'Documento' },
    { value: 'video', label: 'Vídeo' },
    { value: 'audio', label: 'Áudio' },
    { value: 'image', label: 'Imagem' },
    { value: 'presentation', label: 'Apresentação' },
    { value: 'other', label: 'Outro' }
  ]
  
  const statusTypes = [
    { value: 'pending', label: 'Pendente' },
    { value: 'in-progress', label: 'Em andamento' },
    { value: 'review', label: 'Em revisão' },
    { value: 'completed', label: 'Concluído' },
    { value: 'cancelled', label: 'Cancelado' }
  ]
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const handleAddDeliverable = async () => {
    if (!newDeliverable.name || !newDeliverable.type || !newDeliverable.dueDate) {
      toast({
        title: "Erro",
        description: "Preencha pelo menos nome, tipo e data de entrega",
        variant: "destructive",
      })
      return
    }
    
    const deliverable: Deliverable = {
      id: uuidv4(),
      name: newDeliverable.name,
      description: newDeliverable.description || '',
      type: newDeliverable.type as any,
      status: newDeliverable.status as any,
      dueDate: newDeliverable.dueDate,
      assignedTo: newDeliverable.assignedTo || [],
      dependencies: []
    }
    
    const updatedDeliverables = [...(briefing?.deliverables || []), deliverable]
    
    try {
      await saveBriefing({ deliverables: updatedDeliverables })
      setNewDeliverable({
        name: '',
        description: '',
        type: 'document',
        status: 'pending',
        dueDate: '',
        assignedTo: []
      })
      toast({
        title: "Sucesso",
        description: "Entrega adicionada com sucesso",
      })
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a entrega",
        variant: "destructive",
      })
    }
  }
  
  const handleRemoveDeliverable = async (id: string) => {
    if (!briefing?.deliverables) return
    
    const updatedDeliverables = briefing.deliverables.filter(d => d.id !== id)
    
    try {
      await saveBriefing({ deliverables: updatedDeliverables })
      toast({
        title: "Sucesso",
        description: "Entrega removida com sucesso",
      })
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a entrega",
        variant: "destructive",
      })
    }
  }
  
  const updateDeliverableStatus = async (id: string, status: string) => {
    if (!briefing?.deliverables) return
    
    const updatedDeliverables = briefing.deliverables.map(d => 
      d.id === id ? { ...d, status: status as any } : d
    )
    
    try {
      await saveBriefing({ deliverables: updatedDeliverables })
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso",
      })
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      })
    }
  }
  
  const handleAssignedToChange = (value: string) => {
    setNewDeliverable(prev => ({
      ...prev,
      assignedTo: value.split(',').map(s => s.trim()).filter(Boolean)
    }))
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
          <Button variant="outline" onClick={() => fetchBriefing()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </Card>
      </div>
    )
  }
  
  // Se não tem briefing, redirecionar para criar primeiro o briefing
  if (!briefing) {
    return (
      <div className="p-8 text-center">
        <Card className="p-6 text-center space-y-4">
          <h3 className="text-xl font-bold">Briefing não encontrado</h3>
          <p>É necessário criar um briefing básico antes de adicionar entregas</p>
          <Button variant="default" onClick={() => saveBriefing({ eventId })}>
            Criar Briefing
          </Button>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Entregas do Projeto</h2>
      
      <div className="space-y-8">
        {/* Formulário para adicionar nova entrega */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Adicionar Nova Entrega</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome da Entrega</label>
              <Input 
                value={newDeliverable.name}
                onChange={e => setNewDeliverable(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Roteiro Final, Video Editado"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <Select 
                value={newDeliverable.type} 
                onValueChange={value => setNewDeliverable(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {deliverableTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data de Entrega</label>
              <Input 
                type="date"
                value={newDeliverable.dueDate}
                onChange={e => setNewDeliverable(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select 
                value={newDeliverable.status} 
                onValueChange={value => setNewDeliverable(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statusTypes.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Responsáveis (separados por vírgula)</label>
              <Input 
                value={newDeliverable.assignedTo?.join(', ') || ''}
                onChange={e => handleAssignedToChange(e.target.value)}
                placeholder="Ex: João Silva, Maria Oliveira"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <Textarea 
                value={newDeliverable.description || ''}
                onChange={e => setNewDeliverable(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detalhes sobre a entrega"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddDeliverable}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Entrega
            </Button>
          </div>
        </Card>
        
        {/* Lista de entregas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Lista de Entregas</h3>
          
          {briefing.deliverables && briefing.deliverables.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {briefing.deliverables.map(deliverable => (
                <Card key={deliverable.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{deliverable.name}</h4>
                        <Badge variant="outline" className={getStatusColor(deliverable.status)}>
                          {statusTypes.find(s => s.value === deliverable.status)?.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {deliverableTypes.find(t => t.value === deliverable.type)?.label}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveDeliverable(deliverable.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  
                  {deliverable.description && (
                    <p className="text-sm mb-2">{deliverable.description}</p>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>Entrega: {new Date(deliverable.dueDate).toLocaleDateString()}</span>
                    </div>
                    
                    {deliverable.assignedTo && deliverable.assignedTo.length > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Responsáveis:</span>
                        <span className="ml-1">{deliverable.assignedTo.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t flex justify-end gap-2">
                    <Select 
                      value={deliverable.status} 
                      onValueChange={value => updateDeliverableStatus(deliverable.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Atualizar status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusTypes.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Nenhuma entrega adicionada ao projeto</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => fetchBriefing()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar Dados
          </Button>
        </div>
      </div>
    </div>
  )
}
