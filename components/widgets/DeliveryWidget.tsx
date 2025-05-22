// components/widgets/DeliveryWidget.tsx
import React, { useState, useEffect } from 'react';
import { useProjectsStore } from '@/store/useProjectsStore';
import { useUIStore } from '@/store/useUIStore';
import { Calendar, Clock, AlertCircle, Check, CheckCircle, X, Calendar as CalendarIcon } from 'lucide-react';
import { format, differenceInDays, isAfter, parseISO, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// Enum para status de entrega
enum DeliveryStatus {
  PENDENTE = "pendente",
  EM_PROGRESSO = "em_progresso",
  AGUARDANDO_APROVACAO = "aguardando_aprovacao",
  APROVADO = "aprovado",
  ALTERACOES_SOLICITADAS = "alteracoes_solicitadas",
  CONCLUIDO = "concluido",
  ATRASADO = "atrasado",
  CANCELADO = "cancelado"
}

// Interfaces
interface DeliveryWidgetProps {
  projectId: string;
  deliverableId?: string;
  isEditable?: boolean;
}

interface DeadlineFormData {
  dueDate: string;
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  notes: string;
}

const DeliveryWidget: React.FC<DeliveryWidgetProps> = ({
  projectId,
  deliverableId,
  isEditable = true
}) => {
  const { projects, updateProject } = useProjectsStore();
  const { addNotification } = useUIStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deadlineForm, setDeadlineForm] = useState<DeadlineFormData>({
    dueDate: '',
    priority: 'media',
    notes: ''
  });
  
  // Encontrar o projeto
  const project = projects.find(p => p.id === projectId);
  
  // Encontrar o deliverable, se especificado
  const deliverable = deliverableId && project?.videos?.find(v => v.id === deliverableId);
  
  // Se não houver projeto, retornar mensagem
  if (!project) {
    return <Card className="w-full"><CardContent className="pt-4">Projeto não encontrado</CardContent></Card>;
  }
  
  // Obter o prazo atual
  const currentDeadline = deliverable?.deadline || project.deadline;
  const dueDate = currentDeadline?.dueDate ? parseISO(currentDeadline.dueDate) : null;
  
  // Calcular dias restantes
  const daysRemaining = dueDate ? differenceInDays(dueDate, new Date()) : null;
  const isLate = dueDate ? isAfter(new Date(), dueDate) : false;
  
  // Status atual
  const currentStatus = deliverable?.status || project.status || DeliveryStatus.PENDENTE;
  
  // Função para atualizar status
  const updateStatus = (status: DeliveryStatus) => {
    if (deliverable) {
      // Atualizar o status do deliverable específico
      const updatedVideos = project.videos?.map(v => 
        v.id === deliverableId 
          ? {...v, status, lastUpdated: new Date().toISOString()} 
          : v
      );
      
      updateProject(projectId, {
        videos: updatedVideos,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Atualizar o status do projeto inteiro
      updateProject(projectId, {
        status,
        updatedAt: new Date().toISOString()
      });
    }
    
    addNotification(`Status atualizado para: ${getStatusLabel(status)}`);
  };
  
  // Função para obter label do status
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      pendente: 'Pendente',
      em_progresso: 'Em Progresso',
      aguardando_aprovacao: 'Aguardando Aprovação',
      aprovado: 'Aprovado',
      alteracoes_solicitadas: 'Alterações Solicitadas',
      concluido: 'Concluído',
      atrasado: 'Atrasado',
      cancelado: 'Cancelado'
    };
    
    return statusMap[status] || status;
  };
  
  // Função para obter cor do status
  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      pendente: 'bg-gray-400',
      em_progresso: 'bg-blue-500',
      aguardando_aprovacao: 'bg-yellow-500',
      aprovado: 'bg-green-500',
      alteracoes_solicitadas: 'bg-orange-500',
      concluido: 'bg-emerald-500',
      atrasado: 'bg-red-500',
      cancelado: 'bg-gray-700'
    };
    
    return colorMap[status] || 'bg-gray-400';
  };
  
  // Função para atualizar prazo
  const updateDeadline = () => {
    if (!deadlineForm.dueDate) {
      addNotification('Por favor, selecione uma data de entrega válida', 'error');
      return;
    }
    
    const newDeadline = {
      dueDate: deadlineForm.dueDate,
      priority: deadlineForm.priority,
      notes: deadlineForm.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    if (deliverable) {
      // Atualizar o prazo do deliverable específico
      const updatedVideos = project.videos?.map(v => 
        v.id === deliverableId 
          ? {...v, deadline: newDeadline, lastUpdated: new Date().toISOString()} 
          : v
      );
      
      updateProject(projectId, {
        videos: updatedVideos,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Atualizar o prazo do projeto inteiro
      updateProject(projectId, {
        deadline: newDeadline,
        updatedAt: new Date().toISOString()
      });
    }
    
    addNotification('Prazo atualizado com sucesso');
    setIsDialogOpen(false);
  };
  
  // Preparar formulário ao abrir dialog
  const handleOpenDialog = () => {
    if (currentDeadline?.dueDate) {
      setDeadlineForm({
        dueDate: currentDeadline.dueDate.split('T')[0], // Formato YYYY-MM-DD
        priority: currentDeadline.priority || 'media',
        notes: currentDeadline.notes || ''
      });
    } else {
      // Default para 7 dias a partir de hoje
      const defaultDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
      setDeadlineForm({
        dueDate: defaultDate,
        priority: 'media',
        notes: ''
      });
    }
    
    setIsDialogOpen(true);
  };
  
  // Renderizar o componente
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Status de Entrega</span>
          {isEditable && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleOpenDialog}
              className="ml-2"
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              {currentDeadline ? 'Alterar Prazo' : 'Definir Prazo'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Status atual */}
        <div className="mb-4">
          <Label className="text-sm text-muted-foreground mb-1">Status Atual</Label>
          <div className="flex items-center">
            <Badge className={`${getStatusColor(currentStatus)} mr-2`}>
              {getStatusLabel(currentStatus)}
            </Badge>
            
            {dueDate && (
              <span className="text-sm text-muted-foreground">
                {isLate 
                  ? `Atrasado por ${Math.abs(daysRemaining || 0)} dias` 
                  : `${daysRemaining} dias restantes`}
              </span>
            )}
          </div>
        </div>
        
        {/* Prazo */}
        {currentDeadline && (
          <div className="mb-4">
            <Label className="text-sm text-muted-foreground mb-1">Prazo de Entrega</Label>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-sm">
                {format(parseISO(currentDeadline.dueDate), "dd 'de' MMMM 'de' yyyy", { locale: pt })}
              </span>
              
              <Badge 
                variant="outline" 
                className={`ml-2 ${
                  currentDeadline.priority === 'urgente' ? 'border-red-500 text-red-500' :
                  currentDeadline.priority === 'alta' ? 'border-orange-500 text-orange-500' :
                  currentDeadline.priority === 'media' ? 'border-yellow-500 text-yellow-500' :
                  'border-blue-500 text-blue-500'
                }`}
              >
                Prioridade {currentDeadline.priority}
              </Badge>
            </div>
            
            {currentDeadline.notes && (
              <div className="mt-2 text-sm text-muted-foreground">
                <Label className="text-xs">Observações:</Label>
                <p className="italic">{currentDeadline.notes}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Progresso */}
        {dueDate && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progresso</span>
              <span>{isLate ? '100%' : Math.min(100, Math.max(0, 100 - ((daysRemaining || 0) * 100 / (differenceInDays(dueDate, parseISO(currentDeadline?.createdAt || new Date().toISOString())) || 1)))).toFixed(0)}%</span>
            </div>
            <Progress 
              value={isLate ? 100 : Math.min(100, Math.max(0, 100 - ((daysRemaining || 0) * 100 / (differenceInDays(dueDate, parseISO(currentDeadline?.createdAt || new Date().toISOString())) || 1))))} 
              className={isLate ? 'bg-red-200' : ''}
            />
          </div>
        )}
        
        {/* Controles de status (somente se editável) */}
        {isEditable && (
          <>
            <Separator className="my-3" />
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => updateStatus(DeliveryStatus.EM_PROGRESSO)}
                className="justify-start"
              >
                <Clock className="h-4 w-4 mr-1" />
                Em Progresso
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => updateStatus(DeliveryStatus.AGUARDANDO_APROVACAO)}
                className="justify-start"
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                Aguardando Aprovação
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => updateStatus(DeliveryStatus.APROVADO)}
                className="justify-start text-green-600"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Aprovado
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => updateStatus(DeliveryStatus.ALTERACOES_SOLICITADAS)}
                className="justify-start text-orange-600"
              >
                <X className="h-4 w-4 mr-1" />
                Solicitar Alterações
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => updateStatus(DeliveryStatus.CONCLUIDO)}
                className="justify-start text-emerald-600"
                style={{ gridColumn: '1 / -1' }}
              >
                <Check className="h-4 w-4 mr-1" />
                Marcar como Concluído
              </Button>
            </div>
          </>
        )}
      </CardContent>
      
      {/* Dialog para definir/alterar prazo */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentDeadline ? 'Alterar Prazo de Entrega' : 'Definir Prazo de Entrega'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Data de Entrega</Label>
              <Input
                id="dueDate"
                type="date"
                value={deadlineForm.dueDate}
                onChange={(e) => setDeadlineForm({...deadlineForm, dueDate: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select 
                value={deadlineForm.priority} 
                onValueChange={(value: any) => setDeadlineForm({...deadlineForm, priority: value})}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                placeholder="Observações sobre o prazo (opcional)"
                value={deadlineForm.notes}
                onChange={(e) => setDeadlineForm({...deadlineForm, notes: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={updateDeadline}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DeliveryWidget;
