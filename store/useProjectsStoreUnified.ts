// store/useProjectsStoreUnified.ts
import { create } from 'zustand'
import type {
  Project,
  Comment,
  Annotation,
  Asset,
  VideoVersion,
  VideoDeliverable,
  Task,
  TaskStatus,
  DeliverableStatus,
  TeamMember,
  Phase,
} from '@/types/project'
import { useUIStore } from '@/store/useUIStore'

// Tarefas padrão para novos projetos
const defaultTaskTitles: string[] = [
  'Planejamento do projeto',
  'Gravação/Produção do vídeo',
  'Edição do vídeo',
  'Revisão do cliente',
  'Aprovação final',
]

interface ProjectsState {
  projects: Project[]
  currentProject: Project | null
  comments: Comment[]
  annotations: Annotation[]
  assets: Asset[]
  isLoading: boolean
  eventTypes: { value: string; label: string }[]
}

interface ProjectsStore extends ProjectsState {
  // Funções gerais de gerenciamento de projetos
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  addProject: (project: Project) => void
  updateProject: (id: string, projectData: Partial<Project>) => void
  deleteProject: (id: string) => void
  createProject: (nameOrData: string | Omit<Project, 'id'>) => void
  selectProject: (projectId: string) => void
  // Função para geração de timeline a partir do briefing
  generateScheduleFromBriefing: (projectId: string) => void

  // Gerenciamento de vídeo
  addVideoVersion: (
    projectId: string,
    deliverableId: string,
    file: File
  ) => void
  setActiveVideoVersion: (
    projectId: string,
    deliverableId: string,
    versionId: string
  ) => void
  approveVideoVersion: (
    projectId: string,
    deliverableId: string,
    versionId: string,
    approverName?: string
  ) => void

  // Gerenciamento de comentários
  addComment: (comment: Comment) => void
  updateComment: (id: string, commentData: Partial<Comment>) => void
  deleteComment: (id: string) => void
  resolveComment: (id: string, resolved: boolean) => void
  markCommentResolved: (
    projectId: string,
    deliverableId: string,
    commentId: string
  ) => void

  // Gerenciamento de anotações
  addAnnotation: (annotation: Annotation) => void
  updateAnnotation: (id: string, annotationData: Partial<Annotation>) => void
  deleteAnnotation: (id: string) => void

  // Gerenciamento de assets
  addAsset: (asset: Asset) => void
  updateAsset: (id: string, assetData: Partial<Asset>) => void
  deleteAsset: (id: string) => void

  // Funções de gerenciamento de equipe
  addTeamMember: (
    projectId: string,
    member: Omit<TeamMember, 'addedAt'>
  ) => void
  removeTeamMember: (projectId: string, memberId: string) => void

  // Funções do workflow
  markVideoReady: (projectId: string, deliverableId: string) => void
  approveDeliverable: (projectId: string, deliverableId: string) => void
  requestChanges: (
    projectId: string,
    deliverableId: string,
    commentText?: string
  ) => void
  toggleTaskCompletion: (projectId: string, taskId: string) => void
}

export const useProjectsStore = create<ProjectsStore>()(set => ({
  projects: [],
  currentProject: null,
  comments: [],
  annotations: [],
  assets: [],
  isLoading: false,
  eventTypes: [
    { value: 'festival', label: 'Festival' },
    { value: 'conferencia', label: 'Conferência' },
    { value: 'feira', label: 'Feira' },
    { value: 'corporativo', label: 'Evento Corporativo' },
    { value: 'outro', label: 'Outro' },
  ],

  setProjects: projects => set({ projects }),

  setCurrentProject: currentProject => set({ currentProject }),

  addProject: project =>
    set(state => ({
      projects: [...state.projects, project],
    })),

  // Implementação unificada de createProject
  createProject: nameOrData =>
    set(state => {
      const newId = Date.now().toString()

      // Verifica se o parâmetro é uma string (nome) ou um objeto (dados do projeto)
      let project: Project

      if (typeof nameOrData === 'string') {
        // Método simples para criação rápida de projeto com apenas o nome
        const initialDeliverable: VideoDeliverable = {
          id: `${newId}-vid1`,
          title: 'Vídeo Principal',
          versions: [],
          status: 'editing' as DeliverableStatus,
          comments: [],
        }

        project = {
          id: newId,
          name: nameOrData,
          title: nameOrData,
          description: '',
          clientId: '',
          editorId: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'draft',
          videos: [initialDeliverable],
          timeline: [],
          tasks: [],
        }
      } else {
        // Método avançado para criação com dados completos
        // Inicializa tarefas padrão
        const initialTasks: Task[] = defaultTaskTitles.map((title, index) => ({
          id: `task-${newId}-${index}`,
          title,
          status: 'pending' as TaskStatus,
        }))

        // Se nenhum vídeo foi fornecido, inicializa com um deliverable padrão
        const initialVideos: VideoDeliverable[] =
          nameOrData.videos && nameOrData.videos.length > 0
            ? nameOrData.videos
            : [
                {
                  id: `${newId}-vid1`,
                  title: 'Vídeo 1',
                  versions: [],
                  status: 'editing' as DeliverableStatus,
                  comments: [],
                },
              ]

        project = {
          id: newId,
          ...nameOrData,
          videos: initialVideos,
          tasks: initialTasks,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }

      return {
        projects: [...state.projects, project],
        currentProject: project,
      }
    }),

  selectProject: projectId =>
    set(state => {
      const project = state.projects.find(p => p.id === projectId) || null
      return { currentProject: project }
    }),

  updateProject: (id, projectData) =>
    set(state => ({
      projects: state.projects.map(project =>
        project.id === id ? { ...project, ...projectData } : project
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...projectData }
          : state.currentProject,
    })),

  deleteProject: id =>
    set(state => ({
      projects: state.projects.filter(project => project.id !== id),
      currentProject:
        state.currentProject?.id === id ? null : state.currentProject,
    })),

  // Implementação unificada de addVideoVersion
  addVideoVersion: (projectId, deliverableId, file) =>
    set(state => {
      const project = state.projects.find(p => p.id === projectId)
      if (!project) return state

      // Find the deliverable (fallback to first video if not found)
      let deliverable = project.videos.find(v => v.id === deliverableId)
      if (!deliverable) {
        // If deliverableId not found, use first or create a new one
        deliverable = project.videos[0]
      }

      // Create version object
      const versionId = Date.now().toString()
      const newVersion: VideoVersion = {
        id: versionId,
        name: file.name,
        url: URL.createObjectURL(file),
        uploadedAt: new Date(),
        active: deliverable.versions.length === 0, // Set as active if it's the first version
      }

      // Copy the deliverable and add the new version
      const updatedDeliverable = {
        ...deliverable,
        versions: [...deliverable.versions, newVersion],
      }

      // Update the project with the new deliverable
      const updatedVideos = project.videos.map(d =>
        d.id === deliverableId ? updatedDeliverable : d
      )

      // Create updated project
      const updatedProject: Project = {
        ...project,
        videos: updatedVideos,
        updatedAt: new Date().toISOString(),
      }

      return {
        projects: state.projects.map(p =>
          p.id === projectId ? updatedProject : p
        ),
        currentProject:
          project.id === (state.currentProject?.id || '')
            ? updatedProject
            : state.currentProject,
      }
    }),

  setActiveVideoVersion: (projectId, deliverableId, versionId) =>
    set(state => {
      const project = state.projects.find(p => p.id === projectId)
      if (!project) return state

      const updatedVideos = project.videos.map(deliv => {
        if (deliv.id !== deliverableId) return deliv

        // Mark selected version as active, others as inactive
        const updatedVersions = deliv.versions.map(v => ({
          ...v,
          active: v.id === versionId,
        }))

        return { ...deliv, versions: updatedVersions }
      })

      const updatedProject: Project = {
        ...project,
        videos: updatedVideos,
        updatedAt: new Date().toISOString(),
      }

      return {
        projects: state.projects.map(p =>
          p.id === projectId ? updatedProject : p
        ),
        currentProject:
          project.id === (state.currentProject?.id || '')
            ? updatedProject
            : state.currentProject,
      }
    }),

  approveVideoVersion: (projectId, deliverableId, versionId, approverName) =>
    set(state => {
      const project = state.projects.find(p => p.id === projectId)
      if (!project) return state

      const updatedVideos = project.videos.map(deliv => {
        if (deliv.id !== deliverableId) return deliv

        const updatedVersions = deliv.versions.map(v => {
          if (v.id === versionId) {
            return {
              ...v,
              approved: true,
              approvedBy: approverName || 'Editor',
              approvedAt: new Date().toISOString(),
            }
          }
          return v
        })

        return { ...deliv, versions: updatedVersions }
      })

      const updatedProject: Project = {
        ...project,
        videos: updatedVideos,
        updatedAt: new Date().toISOString(),
      }

      // Notificar
      try {
        useUIStore
          .getState()
          .addNotification('Versão aprovada com sucesso!', 'success')
      } catch (error) {
        console.error('Erro ao enviar notificação:', error)
      }

      return {
        projects: state.projects.map(p =>
          p.id === projectId ? updatedProject : p
        ),
        currentProject:
          project.id === (state.currentProject?.id || '')
            ? updatedProject
            : state.currentProject,
      }
    }),

  // Gerenciamento de Comentários
  addComment: comment =>
    set(state => {
      // Se o comentário tem projectId e deliverableId, adicionamos ao projeto
      if (comment.projectId && comment.deliverableId) {
        const { projectId, deliverableId } = comment

        // Procura o projeto
        const project = state.projects.find(p => p.id === projectId)
        if (!project)
          return { ...state, comments: [...state.comments, comment] }

        // Procura o deliverable
        const deliverable = project.videos.find(d => d.id === deliverableId)
        if (!deliverable)
          return { ...state, comments: [...state.comments, comment] }

        // Se o deliverable não tem uma array de comentários, cria uma
        if (!deliverable.comments) {
          deliverable.comments = []
        }

        // Adiciona o comentário ao deliverable
        const updatedDeliverable = {
          ...deliverable,
          comments: [...deliverable.comments, comment],
        }

        // Atualiza o deliverable no projeto
        const updatedVideos = project.videos.map(d =>
          d.id === deliverableId ? updatedDeliverable : d
        )

        // Atualiza o projeto
        const updatedProject = {
          ...project,
          videos: updatedVideos,
          updatedAt: new Date().toISOString(),
        }

        return {
          projects: state.projects.map(p =>
            p.id === projectId ? updatedProject : p
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? updatedProject
              : state.currentProject,
          comments: [...state.comments, comment],
        }
      }

      // Caso contrário, apenas adicionamos ao array global de comentários
      return {
        comments: [...state.comments, comment],
      }
    }),

  updateComment: (id, commentData) =>
    set(state => ({
      comments: state.comments.map(comment =>
        comment.id === id ? { ...comment, ...commentData } : comment
      ),
    })),

  deleteComment: id =>
    set(state => ({
      comments: state.comments.filter(comment => comment.id !== id),
    })),

  resolveComment: (id, resolved) =>
    set(state => ({
      comments: state.comments.map(comment =>
        comment.id === id ? { ...comment, resolved } : comment
      ),
    })),

  markCommentResolved: (projectId, deliverableId, commentId) =>
    set(state => {
      const project = state.projects.find(p => p.id === projectId)
      if (!project) return state

      const deliverable = project.videos.find(d => d.id === deliverableId)
      if (!deliverable || !deliverable.comments) return state

      // Atualiza o status do comentário para resolvido
      const updatedComments = deliverable.comments.map(comment =>
        comment.id === commentId ? { ...comment, resolved: true } : comment
      )

      // Atualiza o deliverable com os comentários atualizados
      const updatedDeliverable = {
        ...deliverable,
        comments: updatedComments,
      }

      // Atualiza o deliverable no projeto
      const updatedVideos = project.videos.map(d =>
        d.id === deliverableId ? updatedDeliverable : d
      )

      // Atualiza o projeto
      const updatedProject = {
        ...project,
        videos: updatedVideos,
        updatedAt: new Date().toISOString(),
      }

      return {
        projects: state.projects.map(p =>
          p.id === projectId ? updatedProject : p
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? updatedProject
            : state.currentProject,
      }
    }),

  // Gerenciamento de Anotações
  addAnnotation: annotation =>
    set(state => ({
      annotations: [...state.annotations, annotation],
    })),

  updateAnnotation: (id, annotationData) =>
    set(state => ({
      annotations: state.annotations.map(annotation =>
        annotation.id === id ? { ...annotation, ...annotationData } : annotation
      ),
    })),

  deleteAnnotation: id =>
    set(state => ({
      annotations: state.annotations.filter(annotation => annotation.id !== id),
    })),

  // Gerenciamento de Assets
  addAsset: asset =>
    set(state => ({
      assets: [...state.assets, asset],
    })),

  updateAsset: (id, assetData) =>
    set(state => ({
      assets: state.assets.map(asset =>
        asset.id === id ? { ...asset, ...assetData } : asset
      ),
    })),

  deleteAsset: id =>
    set(state => ({
      assets: state.assets.filter(asset => asset.id !== id),
    })),

  // Gerar timeline a partir do briefing
  generateScheduleFromBriefing: projectId =>
    set(state => {
      const project = state.projects.find(p => p.id === projectId)
      if (!project) return state

      // Lógica para gerar timeline a partir do briefing
      const timeline: Phase[] = []

      // Usar datas do projeto se disponíveis
      const startDate = project.startDate || new Date().toISOString()
      const endDate =
        project.endDate ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      // Fase de preparação (anterior ao evento)
      timeline.push({
        id: `phase-prep-${Date.now()}`,
        name: 'Preparação',
        start: new Date(
          new Date(startDate).getTime() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        end: startDate,
        completed: false,
        duration: 20, // percentual da duração total
      })

      // Fase do evento
      timeline.push({
        id: `phase-event-${Date.now()}`,
        name: 'Evento',
        start: startDate,
        end: endDate,
        completed: false,
        duration: 30,
      })

      // Fase de pós-produção
      timeline.push({
        id: `phase-post-${Date.now()}`,
        name: 'Pós-Produção',
        start: endDate,
        end: new Date(
          new Date(endDate).getTime() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
        completed: false,
        duration: 50,
      })

      return {
        projects: state.projects.map(p =>
          p.id === projectId ? { ...p, timeline } : p
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? { ...state.currentProject, timeline }
            : state.currentProject,
      }
    }),

  // Funções de workflow

  // Função para marcar um vídeo como pronto para revisão
  markVideoReady: (projectId, deliverableId) =>
    set(state => {
      const project = state.projects.find(p => p.id === projectId)
      if (!project) return state

      const deliverable = project.videos.find(d => d.id === deliverableId)
      if (!deliverable) return state

      // Atualiza o status do deliverable como 'pronto para revisão'
      const updatedDeliverable = {
        ...deliverable,
        status: 'ready_for_review' as DeliverableStatus,
      }

      // Atualiza o deliverable no projeto
      const updatedVideos = project.videos.map(d =>
        d.id === deliverableId ? updatedDeliverable : d
      )

      // Adicionar tarefa de revisão se não existir
      const updatedTasks = [...(project.tasks || [])]
      const reviewTaskExists = updatedTasks.some(
        task => task.title.includes('Revisão') && task.status === 'pending'
      )

      if (!reviewTaskExists) {
        updatedTasks.push({
          id: Date.now().toString(),
          title: 'Revisão do vídeo pelo cliente',
          status: 'pending' as TaskStatus,
        })
      }

      // Atualiza o projeto
      const updatedProject = {
        ...project,
        videos: updatedVideos,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
      }

      // Notificar
      try {
        useUIStore
          .getState()
          .addNotification('Vídeo marcado como pronto para revisão', 'info')
      } catch (error) {
        console.error('Erro ao enviar notificação:', error)
      }

      return {
        projects: state.projects.map(p =>
          p.id === projectId ? updatedProject : p
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? updatedProject
            : state.currentProject,
      }
    }),

  // Aprovar um entregável
  approveDeliverable: (projectId, deliverableId) =>
    set(state => {
      const project = state.projects.find(p => p.id === projectId)
      if (!project) return state

      const updatedVideos = project.videos.map(video => {
        if (video.id !== deliverableId) return video
        return { ...video, status: 'approved' as DeliverableStatus }
      })

      // Marcar tarefas de revisão como concluídas
      const updatedTasks = (project.tasks || []).map(task => {
        if (task.title.includes('Revisão') && task.status === 'pending') {
          return { ...task, status: 'completed' as TaskStatus }
        }
        return task
      })

      const updatedProject = {
        ...project,
        videos: updatedVideos,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
      }

      // Notificar
      try {
        useUIStore
          .getState()
          .addNotification('Entrega aprovada com sucesso!', 'success')
      } catch (error) {
        console.error('Erro ao enviar notificação:', error)
      }

      return {
        projects: state.projects.map(p =>
          p.id === projectId ? updatedProject : p
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? updatedProject
            : state.currentProject,
      }
    }),

  // Solicitar alterações em um entregável
  requestChanges: (projectId, deliverableId, commentText) =>
    set(state => {
      const project = state.projects.find(p => p.id === projectId)
      if (!project) return state

      const deliverable = project.videos.find(d => d.id === deliverableId)
      if (!deliverable) return state

      // Se um comentário foi fornecido e o deliverable existe, adiciona-o
      const updatedDeliverable = { ...deliverable }

      if (commentText) {
        const newComment: Comment = {
          id: `comment_${Date.now()}`,
          projectId,
          deliverableId,
          userId: 'client', // Normalmente viria do Auth Store
          userName: 'Cliente', // Normalmente viria do Auth Store
          content: commentText,
          timestamp: 0, // Início do vídeo
          createdAt: new Date().toISOString(),
          resolved: false,
        }

        updatedDeliverable.comments = [
          ...(deliverable.comments || []),
          newComment,
        ]
      }

      // Marca o status do deliverable como 'alterações solicitadas'
      updatedDeliverable.status = 'changes_requested'

      // Atualiza o deliverable no projeto
      const updatedVideos = project.videos.map(d =>
        d.id === deliverableId ? updatedDeliverable : d
      )

      // Adicionar tarefa de alterações
      const updatedTasks = [...(project.tasks || [])]
      updatedTasks.push({
        id: Date.now().toString(),
        title: 'Implementar alterações solicitadas',
        status: 'pending' as TaskStatus,
      })

      // Atualiza o projeto
      const updatedProject = {
        ...project,
        videos: updatedVideos,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
      }

      // Notificar
      try {
        useUIStore
          .getState()
          .addNotification('Solicitação de alterações registrada', 'warning')
      } catch (error) {
        console.error('Erro ao enviar notificação:', error)
      }

      return {
        projects: state.projects.map(p =>
          p.id === projectId ? updatedProject : p
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? updatedProject
            : state.currentProject,
      }
    }),

  // Alternar o status de uma tarefa
  toggleTaskCompletion: (projectId, taskId) =>
    set(state => {
      const project = state.projects.find(p => p.id === projectId)
      if (!project) return state

      const updatedTasks = (project.tasks || []).map(task => {
        if (task.id === taskId) {
          const newStatus: TaskStatus =
            task.status === 'pending' ? 'completed' : 'pending'
          return { ...task, status: newStatus }
        }
        return task
      })

      // Verificar se todas as tarefas foram concluídas
      const allTasksCompleted =
        updatedTasks.length > 0 &&
        updatedTasks.every(task => task.status === 'completed')

      // Se todas as tarefas foram concluídas, mostrar notificação
      if (allTasksCompleted) {
        setTimeout(() => {
          try {
            useUIStore
              .getState()
              .addNotification(
                'Todas as tarefas do projeto foram concluídas!',
                'success'
              )
          } catch (error) {
            console.error('Erro ao enviar notificação:', error)
          }
        }, 500)
      }

      const updatedProject = { ...project, tasks: updatedTasks }

      return {
        projects: state.projects.map(p =>
          p.id === projectId ? updatedProject : p
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? updatedProject
            : state.currentProject,
      }
    }),

  // Adicionar membro à equipe do projeto
  addTeamMember: (projectId, member) =>
    set(state => {
      const project = state.projects.find(p => p.id === projectId)
      if (!project) return state

      const teamMember: TeamMember = {
        ...member,
        addedAt: new Date().toISOString(),
      }

      const teamMembers = [...(project.teamMembers || []), teamMember]

      const updatedProject = {
        ...project,
        teamMembers,
        team: teamMembers.length,
      }

      return {
        projects: state.projects.map(p =>
          p.id === projectId ? updatedProject : p
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? updatedProject
            : state.currentProject,
      }
    }),

  // Remover membro da equipe
  removeTeamMember: (projectId, memberId) =>
    set(state => {
      const project = state.projects.find(p => p.id === projectId)
      if (!project || !project.teamMembers) return state

      const updatedMembers = project.teamMembers.filter(m => m.id !== memberId)

      const updatedProject = {
        ...project,
        teamMembers: updatedMembers,
        team: updatedMembers.length,
      }

      return {
        projects: state.projects.map(p =>
          p.id === projectId ? updatedProject : p
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? updatedProject
            : state.currentProject,
      }
    }),
}))
