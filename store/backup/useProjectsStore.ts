import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Define types for video timeline and versions
interface VideoVersion {
  id: string
  name: string // e.g. file name or version label
  url: string // URL or blob URL of the video
  uploadedAt: string // ISO date string
  active: boolean // whether this is the selected/active version
  approved: boolean // whether this version has been approved
  approvedBy?: string // who approved it (if any)
  approvalNotes?: string // optional notes from approver
  approvedAt?: string // ISO date of approval
}

interface VideoDeliverable {
  id: string
  title: string
  versions: VideoVersion[]
  status?: 'editing' | 'ready_for_review' | 'changes_requested' | 'approved'
  comments?: Comment[]
}

interface Project {
  id: string
  name: string
  description?: string
  clientId?: string
  eventDate?: string
  finalDueDate?: string
  createdAt: string
  updatedAt?: string
  status: 'draft' | 'in_progress' | 'review' | 'completed' | 'archived'
  videos: VideoDeliverable[] // list of video deliverables for the project
}

// Importando tipos de comentários
import type { Comment } from '@/types/project'

interface ProjectsState {
  projects: Project[]
  currentProject: Project | null

  // Create or select a project
  createProject: (name: string) => void
  selectProject: (projectId: string) => void

  // New actions for video versions:
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

  // Comentários e funções de workflow
  addComment: (comment: Comment) => void
  markCommentResolved: (
    projectId: string,
    deliverableId: string,
    commentId: string
  ) => void
  requestChanges: (
    projectId: string,
    deliverableId: string,
    commentText?: string
  ) => void
  markVideoReady: (projectId: string, deliverableId: string) => void
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,

      createProject: name =>
        set(state => {
          const newId = Date.now().toString()
          const now = new Date().toISOString()
          const newProject: Project = {
            id: newId,
            name,
            createdAt: now,
            status: 'draft',
            videos: [
              {
                id: 'video-1',
                title: 'Vídeo Principal',
                versions: [],
              },
            ],
          }
          return {
            projects: [...state.projects, newProject],
            currentProject: newProject,
          }
        }),

      selectProject: projectId =>
        set(state => {
          const proj = state.projects.find(p => p.id === projectId) || null
          return { currentProject: proj }
        }),

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
            uploadedAt: new Date().toISOString(),
            active: deliverable.versions.length === 0, // Set as active if it's the first version
            approved: false,
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

      approveVideoVersion: (
        projectId,
        deliverableId,
        versionId,
        approverName
      ) =>
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

      // Função para adicionar um comentário
      addComment: comment =>
        set(state => {
          const { projectId, deliverableId = '' } = comment

          // Procura o projeto
          const project = state.projects.find(p => p.id === projectId)
          if (!project) return state

          // Procura o deliverable
          const deliverable = project.videos.find(d => d.id === deliverableId)
          if (!deliverable) return state

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
          }
        }),

      // Marcar um comentário como resolvido
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

      // Solicitar alterações no vídeo
      requestChanges: (projectId, deliverableId, commentText) =>
        set(state => {
          const project = state.projects.find(p => p.id === projectId)
          if (!project) return state

          const deliverable = project.videos.find(d => d.id === deliverableId)
          if (!deliverable) return state

          // Se um comentário foi fornecido, adiciona-o
          let updatedDeliverable = { ...deliverable }

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

      // Marcar vídeo como pronto para revisão
      markVideoReady: (projectId, deliverableId) =>
        set(state => {
          const project = state.projects.find(p => p.id === projectId)
          if (!project) return state

          const deliverable = project.videos.find(d => d.id === deliverableId)
          if (!deliverable) return state

          // Atualiza o status do deliverable como 'pronto para revisão'
          const updatedDeliverable = {
            ...deliverable,
            status: 'ready_for_review',
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
    }),
    {
      name: 'projects-storage', // persist in localStorage
    }
  )
)
