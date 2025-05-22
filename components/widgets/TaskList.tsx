"use client";

import { useAuthStore } from '@/store/useAuthStore';
import { useProjectsStore } from '@/store/useProjectsStoreExtended';
import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskListProps {
  projectId: string;
}

export function TaskList({ projectId }: TaskListProps) {
  const tasks = useProjectsStore(state => {
    const project = state.projects.find(p => p.id === projectId);
    return project?.tasks || [];
  });
  const toggleTaskCompletion = useProjectsStore(state => state.toggleTaskCompletion);
  const currentUser = useAuthStore(state => state.user);
  const isEditor = currentUser?.role === 'editor';
  
  // Calcular progresso das tarefas
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-card rounded-lg p-4 mb-4 shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">Tarefas do Projeto</h3>
        <span className="text-sm text-muted-foreground">{completedTasks}/{totalTasks} concluídas</span>
      </div>
      
      <div className="w-full bg-muted h-2 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-primary transition-all duration-500" 
          style={{ width: `${progressPercentage}%` }} 
        />
      </div>
        {tasks.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma tarefa para este projeto.</p>
      ) : (
        <ul className="space-y-2">
          {/* Ordenar tarefas: pendentes primeiro, depois concluídas */}
          {[...tasks].sort((a, b) => {
            if (a.status === b.status) return 0;
            return a.status === 'pending' ? -1 : 1;
          }).map(task => (
            <li key={task.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <div 
                  onClick={() => {
                    if (isEditor) toggleTaskCompletion(projectId, task.id);
                  }}
                  className={cn(
                    "w-5 h-5 rounded flex items-center justify-center",
                    task.status === 'completed' ? "bg-green-600" : "border border-muted-foreground",
                    isEditor && "cursor-pointer hover:bg-muted"
                  )}
                >
                  {task.status === 'completed' && <Check size={14} className="text-white" />}
                </div>
                <span 
                  className={cn(
                    "text-sm",
                    task.status === 'completed' && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </span>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={14} />
                {task.status === 'completed' ? 'Concluído' : 'Pendente'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
