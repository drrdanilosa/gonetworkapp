"use client";

import { useEffect } from "react";
import { useProjectsStore } from "@/store/useProjectsStoreExtended";
import { DeliverableActions } from "@/components/video/DeliverableActions";
import { CommentItem } from "@/components/video/CommentItem";
import { TaskList } from "@/components/widgets/TaskList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import type { TaskStatus } from "@/types/project";

// Componente para adicionar na página de eventos
export function ProjectWorkflowPanel({
  projectId,
  deliverableId,
}: {
  projectId: string;
  deliverableId?: string;
}) {  const [activeTab, setActiveTab] = useState("tasks");
  const [commentText, setCommentText] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [commentFilter, setCommentFilter] = useState<"all" | "unresolved" | "resolved">("all");
    const { projects } = useProjectsStore();
  const user = useAuthStore((state) => state.user);
  const { updateProject } = useProjectsStore();
  
  // Verificar se o usuário é editor
  const isEditor = user?.role === 'editor';
  
  // Obter o projeto pelo ID
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    return <div>Projeto não encontrado</div>;
  }
  
  // Obter o deliverable selecionado (se houver)
  const selectedDeliverable = deliverableId
    ? project.videos.find(v => v.id === deliverableId)
    : project.videos[0];
    
  // Obter os comentários do deliverable
  const comments = selectedDeliverable?.comments || [];
    // Função para adicionar uma nova tarefa
  const handleAddTask = () => {
    if (!taskTitle.trim()) return;
    
    // Criar uma nova tarefa
    const newTask = {
      id: `task-${Date.now()}`,
      title: taskTitle,
      status: 'pending' as TaskStatus
    };
    
    // Adicionar a tarefa ao projeto
    const updatedTasks = [...(project.tasks || []), newTask];
    
    // Atualizar o projeto
    updateProject(projectId, { tasks: updatedTasks });
    
    // Limpar o formulário e fechar
    setTaskTitle("");
    setShowAddTaskForm(false);
    
    // Notificar
    useUIStore.getState().addNotification('Nova tarefa adicionada', 'success');
  };
  
  // Função para adicionar um comentário
  const handleAddComment = () => {
    if (!commentText.trim() || !user || !selectedDeliverable) return;
    
    // Criar um novo comentário
    const newComment = {
      id: `comment-${Date.now()}`,
      projectId,
      userId: user.id,
      content: commentText,
      timestamp: 0, // Pode ser substituído pela posição atual do vídeo
      createdAt: new Date().toISOString(),
      resolved: false,
      authorName: user.name,
    };
    
    // Adicionar o comentário diretamente ao deliverable
    const updatedVideos = project.videos.map(video => {
      if (video.id === selectedDeliverable.id) {
        return {
          ...video,
          comments: [...(video.comments || []), newComment]
        };
      }
      return video;
    });
    
    // Atualizar o projeto com os novos comentários
    updateProject(projectId, { videos: updatedVideos });
    
    // Limpar o formulário
    setCommentText("");
  };
  
  return (
    <div className="mt-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Workflow do Projeto</CardTitle>
          {project.tasks && project.tasks.length > 0 && (
            <div className="flex items-center mt-1">
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ 
                    width: `${Math.round((project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100)}%` 
                  }} 
                />
              </div>
              <span className="text-sm ml-2 text-muted-foreground">
                {Math.round((project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100)}%
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="w-full">
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
              <TabsTrigger value="actions">Ações</TabsTrigger>
              <TabsTrigger value="comments">Comentários</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks" className="pt-4">
              <TaskList projectId={projectId} />
              
              {/* Formulário para adicionar tarefas */}
              {isEditor && (
                <div className="mt-4">
                  {!showAddTaskForm ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAddTaskForm(true)}
                      className="w-full"
                    >
                      + Adicionar nova tarefa
                    </Button>
                  ) : (
                    <div className="space-y-2 p-3 border rounded-lg">
                      <label htmlFor="task-title" className="text-sm font-medium">
                        Nova tarefa
                      </label>
                      <input
                        id="task-title"
                        type="text"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="Digite o título da tarefa..."
                        className="w-full p-2 border rounded-md bg-background"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setTaskTitle("");
                            setShowAddTaskForm(false);
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          size="sm"
                          onClick={handleAddTask}
                          disabled={taskTitle.trim().length === 0}
                        >
                          Adicionar
                        </Button>
                      </div>
                    </div>
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
                <p>Selecione um vídeo para ver as ações disponíveis.</p>
              )}
            </TabsContent>
            
            <TabsContent value="comments" className="pt-4">
              <div className="space-y-4">
                {selectedDeliverable ? (
                  <>
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Adicionar comentário</h3>
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Escreva seu comentário..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <Button
                          onClick={handleAddComment}
                          disabled={!commentText.trim()}
                        >
                          Enviar comentário
                        </Button>
                      </div>
                    </div>                    <div className="space-y-3 mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">Comentários</h3>
                        <select 
                          className="text-xs border rounded px-2 py-1 bg-background"
                          value={commentFilter}
                          onChange={(e) => setCommentFilter(e.target.value as any)}
                        >
                          <option value="all">Todos</option>
                          <option value="unresolved">Não resolvidos</option>
                          <option value="resolved">Resolvidos</option>
                        </select>
                      </div>
                      {comments.length > 0 ? (
                        // Filtrar e ordenar comentários
                        [...comments]
                          .filter(comment => {
                            if (commentFilter === "all") return true;
                            if (commentFilter === "resolved") return comment.resolved;
                            return !comment.resolved;
                          })
                          .sort((a, b) => {
                          if (a.resolved === b.resolved) {
                            // Se ambos têm o mesmo status de resolução, ordena pelo mais recente
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                          }
                          return a.resolved ? 1 : -1;
                        }).map(comment => (
                          <CommentItem 
                            key={comment.id}
                            projectId={projectId}
                            deliverableId={selectedDeliverable.id}
                            comment={comment}
                          />
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Nenhum comentário ainda. Seja o primeiro a comentar!
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p>Selecione um vídeo para ver os comentários.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
