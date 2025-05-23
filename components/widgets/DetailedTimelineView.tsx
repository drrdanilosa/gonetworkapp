"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Tipos
interface DetailedTimelineViewProps {
  selectedProject: any
}

// Dados mockados para demonstração (em uma implementação real, viriam do projeto)
const mockMembers = [
  { id: "joao", name: "João Silva", role: "Cinegrafia" },
  { id: "maria", name: "Maria Souza", role: "Edição" },
  { id: "carlos", name: "Carlos Lima", role: "Drone" },
  { id: "ana", name: "Ana Costa", role: "Coordenação" }
]

const mockTasks = [
  // João
  {
    id: "task1",
    memberId: "joao",
    name: "Captação - Palco Principal",
    start: "12:00",
    end: "14:00",
    type: "captacao",
    status: "andamento"
  },
  {
    id: "task2",
    memberId: "joao",
    name: "Patrocinador A - Stand",
    start: "14:00",
    end: "15:00",
    type: "captacao",
    status: "pendente"
  },
  {
    id: "task3",
    memberId: "joao",
    name: "Captação - Backstage",
    start: "17:00",
    end: "19:00",
    type: "captacao",
    status: "pendente"
  },
  
  // Maria
  {
    id: "task4",
    memberId: "maria",
    name: "Edição - Abertura",
    start: "12:30",
    end: "14:30",
    type: "edicao",
    status: "andamento"
  },
  {
    id: "task5",
    memberId: "maria",
    name: "Entrega - Reels",
    start: "15:00",
    end: "15:30",
    type: "entrega",
    status: "pendente"
  },
  {
    id: "task6",
    memberId: "maria",
    name: "Edição - Teaser Final",
    start: "18:00",
    end: "20:00",
    type: "edicao",
    status: "andamento"
  },
  
  // Carlos
  {
    id: "task7",
    memberId: "carlos",
    name: "Captação Drone - Área Externa",
    start: "13:00",
    end: "14:00",
    type: "captacao",
    status: "pendente"
  },
  {
    id: "task8",
    memberId: "carlos",
    name: "Captação Drone - Vista Geral",
    start: "16:00",
    end: "16:30",
    type: "captacao",
    status: "atrasado"
  },
  
  // Ana
  {
    id: "task9",
    memberId: "ana",
    name: "Aprovação - Material Inicial",
    start: "12:50",
    end: "13:20",
    type: "aprovacao",
    status: "concluido"
  },
  {
    id: "task10",
    memberId: "ana",
    name: "Entrega - Stories",
    start: "14:30",
    end: "15:00",
    type: "entrega",
    status: "concluido"
  },
  {
    id: "task11",
    memberId: "ana",
    name: "Aprovação - Teaser",
    start: "19:00",
    end: "20:00",
    type: "aprovacao",
    status: "pendente"
  }
]

export default function DetailedTimelineView({ selectedProject }: DetailedTimelineViewProps) {
  const [selectedMember, setSelectedMember] = useState<string>("all")
  const [selectedActivity, setSelectedActivity] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  
  // Em uma implementação real, você extrairia as tarefas do projeto
  // Por agora, usamos dados mockados que serão substituídos pelos dados reais
  const allTasks = selectedProject?.teamMembers ? 
    // Se o projeto tem membros reais, usar dados reais (ainda não implementado)
    mockTasks : 
    // Senão, usar dados mockados
    mockTasks
  
  const members = selectedProject?.teamMembers || mockMembers
  
  // Filtrar tarefas com base nos filtros selecionados
  const filteredTasks = allTasks.filter(task => {
    if (selectedMember !== "all" && task.memberId !== selectedMember) return false
    if (selectedActivity !== "all" && task.type !== selectedActivity) return false
    if (selectedStatus !== "all" && task.status !== selectedStatus) return false
    return true
  })
  
  // Helper para obter a posição e largura das tarefas
  const calculatePosition = (start: string, end: string) => {
    // Converte horários para porcentagens da largura total
    // Assume escala de 10:00 às 22:00 (12 horas)
    const startParts = start.split(':').map(Number)
    const endParts = end.split(':').map(Number)
    
    const startHour = startParts[0]
    const startMin = startParts[1] / 60
    const endHour = endParts[0]
    const endMin = endParts[1] / 60
    
    const totalHours = 12 // 10:00 - 22:00
    const startTime = startHour + startMin - 10 // Normalizado para começar às 10h
    const endTime = endHour + endMin - 10 // Normalizado para começar às 10h
    
    const left = Math.max(0, (startTime / totalHours) * 100)
    const width = Math.max(1, ((endTime - startTime) / totalHours) * 100)
    
    return { left: `${left}%`, width: `${width}%` }
  }
  
  // Helper para obter classe de cor com base no tipo e status
  const getTaskClass = (task: any) => {
    if (task.status === "concluido") return "bg-green-500 text-white"
    if (task.status === "atrasado") return "bg-red-500 text-white"
    
    switch (task.type) {
      case "captacao": return "bg-blue-500 text-white"
      case "edicao": return "bg-orange-500 text-white"
      case "entrega": return "bg-gray-500 text-white"
      case "aprovacao": return "bg-cyan-500 text-white"
      default: return "bg-gray-400 text-white"
    }
  }
  
  // Helper para obter texto do status
  const getStatusText = (status: string) => {
    const statusMap = {
      pendente: "Pendente",
      andamento: "Em andamento", 
      concluido: "Concluído",
      atrasado: "Atrasado"
    }
    return statusMap[status] || status
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Detalhada por Membro</CardTitle>
        
        {/* Filtros */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Label>Membro:</Label>
            <Select 
              value={selectedMember} 
              onValueChange={setSelectedMember}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por membro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Membros</SelectItem>
                {members.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label>Atividade:</Label>
            <Select 
              value={selectedActivity}
              onValueChange={setSelectedActivity}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por atividade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Atividades</SelectItem>
                <SelectItem value="captacao">Captação</SelectItem>
                <SelectItem value="edicao">Edição</SelectItem>
                <SelectItem value="entrega">Entrega</SelectItem>
                <SelectItem value="aprovacao">Aprovação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label>Status:</Label>
            <Select 
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="andamento">Em andamento</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="border rounded-md overflow-hidden">
          {/* Cabeçalho com horários */}
          <div className="bg-muted/30 p-2 border-b">
            <div className="grid grid-cols-12 gap-2 text-sm font-medium">
              <div className="col-span-2">Membro</div>
              <div className="col-span-10 flex">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex-1 text-center">
                    {10 + i}:00
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Linhas dos membros */}
          <div className="bg-background">
            {members
              .filter(member => 
                selectedMember === "all" || selectedMember === member.id
              )
              .filter(member => 
                // Verificar se o membro tem tarefas que correspondem aos filtros
                filteredTasks.some(task => task.memberId === member.id)
              )
              .map(member => {
                // Obter todas as tarefas deste membro que correspondem aos filtros
                const memberTasks = filteredTasks.filter(
                  task => task.memberId === member.id
                )
                
                return (
                  <div key={member.id} className="border-b last:border-b-0">
                    <div className="grid grid-cols-12 gap-2 p-2">
                      <div className="col-span-2 text-sm">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">({member.role})</div>
                      </div>
                      <div className="col-span-10 relative h-16">
                        {memberTasks.map(task => {
                          const position = calculatePosition(task.start, task.end)
                          
                          return (
                            <div
                              key={task.id}
                              className={`absolute h-12 top-2 rounded-md flex items-center justify-center text-xs px-2 cursor-pointer transition-all hover:scale-105 ${getTaskClass(task)}`}
                              style={{ 
                                left: position.left, 
                                width: position.width,
                                minWidth: '60px' // Garante uma largura mínima para tarefas muito curtas
                              }}
                              title={`${task.name}\n${task.start} - ${task.end}\nStatus: ${getStatusText(task.status)}`}
                            >
                              <span className="truncate">
                                {task.name}
                                {task.status === "concluido" && " ✓"}
                                {task.status === "atrasado" && " ⚠"}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })
            }
            
            {/* Mensagem para quando não há resultados */}
            {filteredTasks.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-lg">Nenhuma tarefa encontrada</p>
                <p className="text-sm">Ajuste os filtros para ver mais resultados</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Legenda */}
        <div className="flex flex-wrap gap-4 text-xs mt-6 pt-4 border-t">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Captação</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Edição</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>Entrega</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <span>Aprovação</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Concluído ✓</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Atrasado ⚠</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}