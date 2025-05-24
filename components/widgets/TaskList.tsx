'use client'

'use client'

'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { Check, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskListProps {
  projectId: string
}

export function TaskList({ projectId }: TaskListProps) {
  // Corrigido para resolver o problema de loop infinito:
  // Em vez de retornar um array derivado na callback do selector,
  // apenas selecionamos o projeto e extraímos tarefas fora da callback
  const project = useProjectsStore(state =>
    state.projects.find(p => p.id === projectId)
  )
  const tasks = project?.tasks || []
  const toggleTaskCompletion = useProjectsStore(
    state => state.toggleTaskCompletion
  )
  const currentUser = useAuthStore(state => state.user)
  const isEditor = currentUser?.role === 'editor'

  // Calcular progresso das tarefas
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const totalTasks = tasks.length
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="mb-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tarefas do Projeto</h3>
        <span className="text-sm text-muted-foreground">
          {completedTasks}/{totalTasks} concluídas
        </span>
      </div>

      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      {tasks.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhuma tarefa para este projeto.
        </p>
      ) : (
        <ul className="space-y-2">
          {/* Ordenar tarefas: pendentes primeiro, depois concluídas */}
          {[...tasks]
            .sort((a, b) => {
              if (a.status === b.status) return 0
              return a.status === 'pending' ? -1 : 1
            })
            .map(task => (
              <li
                key={task.id}
                className="group flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    onClick={() => {
                      if (isEditor) toggleTaskCompletion(projectId, task.id)
                    }}
                    className={cn(
                      'flex size-5 items-center justify-center rounded',
                      task.status === 'completed'
                        ? 'bg-green-600'
                        : 'border border-muted-foreground',
                      isEditor && 'cursor-pointer hover:bg-muted'
                    )}
                  >
                    {task.status === 'completed' && (
                      <Check size={14} className="text-white" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm',
                      task.status === 'completed' &&
                        'text-muted-foreground line-through'
                    )}
                  >
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={14} />
                  {task.status === 'completed' ? 'Concluído' : 'Pendente'}
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
