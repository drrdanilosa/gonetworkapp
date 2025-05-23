'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { DeliverableActions } from '@/components/video/DeliverableActions'
import { CommentItem } from '@/components/video/CommentItem'
import { TaskList } from '@/components/widgets/TaskList'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import { Plus, MessageSquare, ListTodo, Settings } from 'lucide-react'
import type { TaskStatus, Comment, Task } from '@/types/project'

interface ProjectWorkflowPanelProps {
  projectId: string
  deliverableId?: string
}

type CommentFilter = 'all' | 'unresolved' | 'resolved'
type TabValue = 'tasks' | 'actions' | 'comments'

export function ProjectWorkflowPanel({
  projectId,
  deliverableId,
}: ProjectWorkflowPanelProps) {
  // Estados do componente
  const [activeTab, setActiveTab] = useState<TabValue>('tasks')
  const [commentText, setCommentText] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [showAddTaskForm, setShowAddTaskForm] = useState(false)
  const [commentFilter, setCommentFilter] = useState<CommentFilter>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Stores
  const { projects, updateProject } = useProjectsStore()
  const user = useAuthStore(state => state.user)
  const { addNotification } = useUIStore()

  // Verificações de permissão
  const isEditor = useMemo(() => user?.role === 'editor', [user?.role])
  const isAuthenticated = useMemo(() => !!user, [user])

  // Obter o projeto
  const project = useMemo(
    () => projects.find(p => p.id === projectId),
    [projects, projectId]
  )

  // Obter o deliverable selecionado
  const selectedDeliverable = useMemo(() => {
    if (!project?.videos) return null
    return deliverableId
      ? project.videos.find(v => v.id === deliverableId)
      : project.videos[0]
  }, [project?.videos, deliverableId])

  // Estado derivado dos comentários
  const comments = useMemo(
    () => selectedDeliverable?.comments || [],
    [selectedDeliverable?.comments]
  )

  // Comentários filtrados e ordenados
  const filteredComments = useMemo(() => {
    return [...comments]
      .filter(comment => {
        switch (commentFilter) {
          case 'resolved':
            return comment.resolved
          case 'unresolved':
            return !comment.resolved
          default:
            return true
        }
      })
      .sort((a, b) => {
        // Primeiro ordena por status de resolução (não resolvidos primeiro)
        if (a.resolved !== b.resolved) {
          return a.resolved ? 1 : -1
        }
        // Depois por data (mais recentes primeiro)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [comments, commentFilter])

  // Progresso das tarefas
  const tasksProgress = useMemo(() => {
    const tasks = project?.tasks || []
    if (tasks.length === 0) return { completed: 0, total: 0, percentage: 0 }
    
    const completed = tasks.filter(t => t.status === 'completed').length
    return {
      completed,
      total: tasks.length,
      percentage: Math.round((completed / tasks.length) * 100)
    }
  }, [project?.tasks])

  // Contadores de comentários
  const commentCounts = useMemo(() => {
    const total = comments.length
    const unresolved = comments.filter(c => !c.resolved).length
    const resolved = comments.filter(c => c.resolved).length
    
    return { total, unresolved, resolved }
  }, [comments])

  // Função para validar entrada de tarefa
  const isValidTaskTitle = useCallback((title: string) => {
    return title.trim().length >= 3 && title.trim().length <= 100
  }, [])

  // Função para adicionar uma nova tarefa
  const handleAddTask = useCallback(async () => {
    if (!isValidTaskTitle(taskTitle) || !project || isSubmitting) return

    setIsSubmitting(true)
    
    try {
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: taskTitle.trim(),
        status: 'pending' as TaskStatus,
        createdAt: new Date().toISOString(),
        assignedTo: user?.id,
      }

      const updatedTasks = [...(project.tasks || []), newTask]
      await updateProject(projectId, { tasks: updatedTasks })

      // Reset form
      setTaskTitle('')
      setShowAddTaskForm(false)
      
      addNotification('Nova tarefa adicionada com sucesso', 'success')
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error)
      addNotification('Erro ao adicionar tarefa', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }, [taskTitle, project, isSubmitting, projectId, user?.id, updateProject, addNotification, isValidTaskTitle])

  // Função para adicionar um comentário
  const handleAddComment = useCallback(async () => {
    if (!commentText.trim() || !user || !selectedDeliverable || isSubmitting) return

    const trimmedComment = commentText.trim()
    if (trimmedComment.length < 1 || trimmedComment.length > 1000) {
      addNotification('Comentário deve ter entre 1 e 1000 caracteres', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      const newComment: Comment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        userId: user.id,
        content: trimmedComment,
        timestamp: 0, // Pode ser substituído pela posição atual do vídeo
        createdAt: new Date().toISOString(),
        resolved: false,
        authorName: user.name,
      }

      const updatedVideos = project!.videos.map(video => {
        if (video.id === selectedDeliverable.id) {
          return {
            ...video,
            comments: [...(video.comments || []), newComment],
          }
        }
        return video
      })

      await updateProject(projectId, { videos: updatedVideos })
      
      setCommentText('')
      addNotification('Comentário adicionado com sucesso', 'success')
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
      addNotification('Erro ao adicionar comentário', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }, [commentText, user, selectedDeliverable, isSubmitting, projectId, project, updateProject, addNotification])

  // Função para cancelar adição de tarefa
  const handleCancelAddTask = useCallback(() => {
    setTaskTitle('')
    setShowAddTaskForm(false)
  }, [])

  // Função para lidar com mudança de tab
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as TabValue)
  }, [])

  // Early returns para casos de erro
  if (!project) {
    return (
      <Card className="mt-8">
        <CardContent className="p-6">
          <p className="text-destructive">Projeto não encontrado</p>
        </CardContent>
      </Card>
    )
  }

  if (!isAuthenticated) {
    return (
      <Card className="mt-8">
        <CardContent className="p-6">
          <p className="text-muted-foreground">Faça login para acessar o workflow do projeto</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mt-8">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              Workflow do Projeto
            </CardTitle>
            {tasksProgress.total > 0 && (
              <Badge variant="secondary" className="ml-2">
                {tasksProgress.completed}/{tasksProgress.total} tarefas
              </Badge>
            )}
          </div>
          
          {tasksProgress.total > 0 && (
            <div className="flex items-center mt-3 gap-3">
              <Progress value={tasksProgress.percentage} className="flex-1" />
              <span className="text-sm text-muted-foreground font-medium min-w-[45px]">
                {tasksProgress.percentage}%
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                Tarefas
                {tasksProgress.total > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 text-xs">
                    {tasksProgress.total}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Ações
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comentários
                {commentCounts.total > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 text-xs">
                    {commentCounts.unresolved}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="pt-4 space-y-4">
              <TaskList projectId={projectId} />

              {isEditor && (
                <div className="mt-4">
                  {!showAddTaskForm ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddTaskForm(true)}
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar nova tarefa
                    </Button>
                  ) : (
                    <Card className="p-4">
                      <div className="space-y-3">
                        <Label htmlFor="task-title" className="text-sm font-medium">
                          Nova tarefa
                        </Label>
                        <Input
                          id="task-title"
                          type="text"
                          value={taskTitle}
                          onChange={e => setTaskTitle(e.target.value)}
                          placeholder="Digite o título da tarefa (3-100 caracteres)..."
                          maxLength={100}
                          disabled={isSubmitting}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelAddTask}
                            disabled={isSubmitting}
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleAddTask}
                            disabled={!isValidTaskTitle(taskTitle) || isSubmitting}
                          >
                            {isSubmitting ? 'Adicionando...' : 'Adicionar'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="actions" className="pt-4">
              {selectedDeliverable ? (
                <DeliverableActions
                  projectId={projectId}
                  deliverable={selectedDeliverable}
                />
              ) : (
                <Card className="p-6">
                  <p className="text-muted-foreground text-center">
                    Selecione um vídeo para ver as ações disponíveis.
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="comments" className="pt-4 space-y-4">
              {selectedDeliverable ? (
                <>
                  {/* Formulário para adicionar comentário */}
                  <Card className="p-4">
                    <div className="space-y-3">
                      <Label htmlFor="comment-text" className="text-sm font-medium">
                        Adicionar comentário
                      </Label>
                      <Textarea
                        id="comment-text"
                        placeholder="Escreva seu comentário..."
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        className="min-h-[100px]"
                        maxLength={1000}
                        disabled={isSubmitting}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {commentText.length}/1000 caracteres
                        </span>
                        <Button
                          onClick={handleAddComment}
                          disabled={!commentText.trim() || isSubmitting}
                          size="sm"
                        >
                          {isSubmitting ? 'Enviando...' : 'Enviar comentário'}
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Lista de comentários */}
                  <Card className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">
                          Comentários ({commentCounts.total})
                        </h3>
                        <Select value={commentFilter} onValueChange={(value: CommentFilter) => setCommentFilter(value)}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              Todos ({commentCounts.total})
                            </SelectItem>
                            <SelectItem value="unresolved">
                              Não resolvidos ({commentCounts.unresolved})
                            </SelectItem>
                            <SelectItem value="resolved">
                              Resolvidos ({commentCounts.resolved})
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        {filteredComments.length > 0 ? (
                          filteredComments.map(comment => (
                            <CommentItem
                              key={comment.id}
                              projectId={projectId}
                              deliverableId={selectedDeliverable.id}
                              comment={comment}
                            />
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">
                              {commentFilter === 'all'
                                ? 'Nenhum comentário ainda. Seja o primeiro a comentar!'
                                : `Nenhum comentário ${commentFilter === 'resolved' ? 'resolvido' : 'não resolvido'}.`}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </>
              ) : (
                <Card className="p-6">
                  <p className="text-muted-foreground text-center">
                    Selecione um vídeo para ver os comentários.
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}