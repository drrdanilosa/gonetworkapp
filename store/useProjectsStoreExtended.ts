// store/useProjectsStoreExtended.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Project, Comment, Annotation, Asset, 
  VideoVersion, VideoDeliverable, Task, 
  TaskStatus, DeliverableStatus, Phase 
} from '@/types/project';
import { useUIStore } from '@/store/useUIStore';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  comments: Comment[];
  annotations: Annotation[];
  assets: Asset[];
  isLoading: boolean;
}

// Tarefas padrão para novos projetos
const defaultTaskTitles: string[] = [
  'Planejamento do projeto',
  'Gravação/Produção do vídeo',
  'Edição do vídeo',
  'Revisão do cliente',
  'Aprovação final'
];

interface ProjectsStore extends ProjectsState {
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, projectData: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  createProject: (data: Omit<Project, "id">) => void;
  addVideoVersion: (file: File, deliverableId?: string) => Promise<void>;
  
  // Comentários
  addComment: (comment: Comment) => void;
  updateComment: (id: string, commentData: Partial<Comment>) => void;
  deleteComment: (id: string) => void;
  resolveComment: (id: string, resolved: boolean) => void;
  
  // Anotações
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, annotationData: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  
  // Assets
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, assetData: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  
  // Funções do workflow
  markVideoReady: (projectId: string, deliverableId: string) => void;
  approveDeliverable: (projectId: string, deliverableId: string) => void;
  requestChanges: (projectId: string, deliverableId: string, commentText?: string) => void;
  markCommentResolved: (projectId: string, deliverableId: string, commentId: string) => void;
  toggleTaskCompletion: (projectId: string, taskId: string) => void;
}

export const useProjectsStore = create<ProjectsStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      comments: [],
      annotations: [],
      assets: [],
      isLoading: false,
      
      setProjects: (projects) => set({ projects }),
      setCurrentProject: (currentProject) => set({ currentProject }),
      addProject: (project) => set((state) => ({ 
        projects: [...state.projects, project] 
      })),
      
      // Nova implementação do createProject
      createProject: (data) => set((state) => {
        const newId = Date.now().toString();  // gera um ID simples (timestamp)
        
        // Inicializa tarefas padrão
        const initialTasks: Task[] = defaultTaskTitles.map((title, index) => ({
          id: `task-${newId}-${index}`,
          title,
          status: 'pending' as TaskStatus
        }));
        
        // Se nenhum vídeo foi fornecido, inicializa com um deliverable padrão
        const initialVideos: VideoDeliverable[] = data.videos && data.videos.length > 0
          ? data.videos
          : [{
              id: `${newId}-vid1`, 
              title: "Vídeo 1", 
              versions: [],
              status: 'editing' as DeliverableStatus,
              comments: []
            }];
        
        const newProject: Project = {
          id: newId,
          ...data,
          videos: initialVideos,
          tasks: initialTasks,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        return { 
          projects: [...state.projects, newProject],
          currentProject: newProject 
        };
      }),
      
      updateProject: (id, projectData) => set((state) => ({
        projects: state.projects.map(project => 
          project.id === id ? { ...project, ...projectData } : project
        ),
        currentProject: state.currentProject?.id === id 
          ? { ...state.currentProject, ...projectData } 
          : state.currentProject
      })),
      
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(project => project.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject
      })),
      
      // Nova implementação de addVideoVersion
      addVideoVersion: async (file, deliverableId) => set((state) => {
        if (!state.currentProject) return state;
        
        // Identifica o deliverable alvo (usa o primeiro vídeo caso não seja especificado)
        const deliverables = state.currentProject.videos;
        if (!deliverables.length) return state;
        
        const targetDeliverable = deliverableId 
          ? deliverables.find(d => d.id === deliverableId)
          : deliverables[0];
        
        if (!targetDeliverable) return state;
        
        // Cria uma URL temporária para o arquivo (simulação de upload)
        const fileUrl = URL.createObjectURL(file);
        
        // Cria objeto da nova versão
        const newVersionNumber = targetDeliverable.versions.length + 1;
        const newVersion: VideoVersion = {
          id: `${targetDeliverable.id}-v${newVersionNumber}`,
          name: `v${newVersionNumber}`,
          url: fileUrl,
          uploadedAt: new Date()
        };
        
        // Atualiza o deliverable com a nova versão
        const updatedDeliverables = deliverables.map(d =>
          d.id === targetDeliverable.id
            ? { ...d, versions: [...d.versions, newVersion] }
            : d
        );
        
        // Atualiza o projeto com os novos deliverables
        const updatedProject = {
          ...state.currentProject,
          videos: updatedDeliverables,
          updatedAt: new Date().toISOString()
        };
        
        return {
          currentProject: updatedProject,
          projects: state.projects.map(p =>
            p.id === updatedProject.id ? updatedProject : p
          )
        };
      }),
      
      // Gerenciamento de Comentários
      addComment: (comment) => set((state) => ({
        comments: [...state.comments, comment]
      })),
      
      updateComment: (id, commentData) => set((state) => ({
        comments: state.comments.map(comment =>
          comment.id === id ? { ...comment, ...commentData } : comment
        )
      })),
      
      deleteComment: (id) => set((state) => ({
        comments: state.comments.filter(comment => comment.id !== id)
      })),
      
      resolveComment: (id, resolved) => set((state) => ({
        comments: state.comments.map(comment =>
          comment.id === id ? { ...comment, resolved } : comment
        )
      })),
      
      // Gerenciamento de Anotações
      addAnnotation: (annotation) => set((state) => ({
        annotations: [...state.annotations, annotation]
      })),
      
      updateAnnotation: (id, annotationData) => set((state) => ({
        annotations: state.annotations.map(annotation => 
          annotation.id === id ? { ...annotation, ...annotationData } : annotation
        )
      })),
      
      deleteAnnotation: (id) => set((state) => ({
        annotations: state.annotations.filter(annotation => annotation.id !== id)
      })),
      
      // Gerenciamento de Assets
      addAsset: (asset) => set((state) => ({
        assets: [...state.assets, asset]
      })),
      
      updateAsset: (id, assetData) => set((state) => ({
        assets: state.assets.map(asset => 
          asset.id === id ? { ...asset, ...assetData } : asset
        )
      })),
      
      deleteAsset: (id) => set((state) => ({
        assets: state.assets.filter(asset => asset.id !== id)
      })),
      
      // Funções de workflow
      
      // Função para marcar um vídeo como pronto para revisão
      markVideoReady: (projectId, deliverableId) => set((state) => {
        const projects = state.projects.map(project => {
          if (project.id !== projectId) return project;
          
          const updatedVideos = project.videos.map(video => {
            if (video.id !== deliverableId) return video;
            return { ...video, status: 'ready_for_review' as DeliverableStatus };
          });
          
          // Adicionar tarefa de revisão se não existir
          let updatedTasks = [...(project.tasks || [])];
          const reviewTaskExists = updatedTasks.some(task => 
            task.title.includes('Revisão') && task.status === 'pending'
          );
          
          if (!reviewTaskExists) {
            updatedTasks.push({
              id: Date.now().toString(),
              title: 'Revisão do vídeo pelo cliente',
              status: 'pending' as TaskStatus
            });
          }
          
          return { 
            ...project, 
            videos: updatedVideos,
            tasks: updatedTasks
          };
        });
          // Notificar
        useUIStore.getState().addNotification('Vídeo marcado como pronto para revisão', 'info');
        
        return { projects };
      }),
      
      // Aprovar um entregável
      approveDeliverable: (projectId, deliverableId) => set((state) => {
        const projects = state.projects.map(project => {
          if (project.id !== projectId) return project;
          
          const updatedVideos = project.videos.map(video => {
            if (video.id !== deliverableId) return video;
            return { ...video, status: 'approved' as DeliverableStatus };
          });
          
          // Marcar tarefas de revisão como concluídas
          const updatedTasks = (project.tasks || []).map(task => {
            if (task.title.includes('Revisão') && task.status === 'pending') {
              return { ...task, status: 'completed' as TaskStatus };
            }
            return task;
          });
          
          return { 
            ...project, 
            videos: updatedVideos,
            tasks: updatedTasks
          };
        });
          // Notificar
        useUIStore.getState().addNotification('Entrega aprovada com sucesso!', 'success');
        
        return { projects };
      }),
      
      // Solicitar alterações em um entregável
      requestChanges: (projectId, deliverableId, commentText) => set((state) => {
        const projects = state.projects.map(project => {
          if (project.id !== projectId) return project;
          
          const updatedVideos = project.videos.map(video => {
            if (video.id !== deliverableId) return video;
            
            // Adicionar comentário se fornecido
            let updatedComments = [...(video.comments || [])];
            if (commentText) {
              updatedComments.push({
                id: Date.now().toString(),
                projectId,
                userId: 'current-user', // Idealmente pegaria do useAuthStore
                content: commentText,
                timestamp: 0, // Posição inicial do vídeo
                createdAt: new Date().toISOString(),
                resolved: false
              });
            }
            
            return { 
              ...video, 
              status: 'changes_requested' as DeliverableStatus,
              comments: updatedComments
            };
          });
          
          // Adicionar tarefa de alterações
          let updatedTasks = [...(project.tasks || [])];
          updatedTasks.push({
            id: Date.now().toString(),
            title: 'Implementar alterações solicitadas',
            status: 'pending' as TaskStatus
          });
          
          return { 
            ...project, 
            videos: updatedVideos,
            tasks: updatedTasks
          };
        });
          // Notificar
        useUIStore.getState().addNotification('Solicitação de alterações registrada', 'warning');
        
        return { projects };
      }),
      
      // Marcar um comentário como resolvido
      markCommentResolved: (projectId, deliverableId, commentId) => set((state) => {
        const projects = state.projects.map(project => {
          if (project.id !== projectId) return project;
          
          const updatedVideos = project.videos.map(video => {
            if (video.id !== deliverableId) return video;
            
            const updatedComments = (video.comments || []).map(comment => {
              if (comment.id === commentId) {
                return { ...comment, resolved: true };
              }
              return comment;
            });
            
            return { ...video, comments: updatedComments };
          });
          
          return { ...project, videos: updatedVideos };
        });
        
        return { projects };
      }),
        // Alternar o status de uma tarefa
      toggleTaskCompletion: (projectId, taskId) => set((state) => {
        const projects = state.projects.map(project => {
          if (project.id !== projectId) return project;
          
          const updatedTasks = (project.tasks || []).map(task => {
            if (task.id === taskId) {
              const newStatus: TaskStatus = task.status === 'pending' ? 'completed' : 'pending';
              return { ...task, status: newStatus };
            }
            return task;
          });
          
          // Verificar se todas as tarefas foram concluídas
          const allTasksCompleted = updatedTasks.length > 0 && 
            updatedTasks.every(task => task.status === 'completed');
          
          // Se todas as tarefas foram concluídas, mostrar notificação
          if (allTasksCompleted) {
            setTimeout(() => {
              useUIStore.getState().addNotification(
                'Todas as tarefas do projeto foram concluídas!', 
                'success'
              );
            }, 500);
          }
          
          return { ...project, tasks: updatedTasks };
        });
        
        return { projects };
      })
    }),
    {
      name: 'projects-storage',
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject,
      }),
    }
  )
);
