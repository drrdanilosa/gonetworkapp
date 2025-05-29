import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Comment } from '@/types/project'

interface VideoVersion {
  id: string
  name: string
  url: string
  uploadedAt: string
  active: boolean
  approved: boolean
  approvedBy?: string
  approvalNotes?: string
  approvedAt?: string
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
  videos: VideoDeliverable[]
}

interface ProjectsState {
  updateProject: (id: string, data: Omit<Project, 'id'>) => void
  projects: Project[]
  currentProject: Project | null
  createProject: (name: string) => void
  selectProject: (projectId: string) => void
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

      updateProject: (id, data) => {
        set(state => {
          const updatedProject: Project = {
            id,
            ...data,
          }
          return {
            projects: state.projects.map(p =>
              p.id === id ? updatedProject : p
            ),
            currentProject:
              state.currentProject?.id === id
                ? updatedProject
                : state.currentProject,
          }
        })
      },

      createProject: name => {
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
        set(state => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
        }))
      },

      selectProject: projectId => {
        set(state => {
          const proj = state.projects.find(p => p.id === projectId) || null
          return { currentProject: proj }
        })
      },

      addVideoVersion: (projectId, deliverableId, file) => {
        set(state => {
          const project = state.projects.find(p => p.id === projectId)
          if (!project) return state

          const deliverable =
            project.videos.find(v => v.id === deliverableId) ||
            project.videos[0]

          const versionId = Date.now().toString()
          const newVersion: VideoVersion = {
            id: versionId,
            name: file.name,
            url: URL.createObjectURL(file),
            uploadedAt: new Date().toISOString(),
            active: deliverable.versions.length === 0,
            approved: false,
          }

          const updatedDeliverable = {
            ...deliverable,
            versions: [...deliverable.versions, newVersion],
          }

          const updatedVideos = project.videos.map(d =>
            d.id === deliverable.id ? updatedDeliverable : d
          )

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
        })
      },

      setActiveVideoVersion: (projectId, deliverableId, versionId) => {
        set(state => {
          const project = state.projects.find(p => p.id === projectId)
          if (!project) return state

          const updatedVideos = project.videos.map(deliv => {
            if (deliv.id !== deliverableId) return deliv
            return {
              ...deliv,
              versions: deliv.versions.map(v => ({
                ...v,
                active: v.id === versionId,
              })),
            }
          })

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
        })
      },

      approveVideoVersion: (
        projectId,
        deliverableId,
        versionId,
        approverName
      ) => {
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
              state.currentProject?.id === projectId
                ? updatedProject
                : state.currentProject,
          }
        })
      },

      addComment: comment => {
        set(state => {
          const { projectId, deliverableId = '' } = comment
          const project = state.projects.find(p => p.id === projectId)
          if (!project) return state

          const deliverable = project.videos.find(d => d.id === deliverableId)
          if (!deliverable) return state

          if (!deliverable.comments) deliverable.comments = []

          const updatedDeliverable = {
            ...deliverable,
            comments: [...deliverable.comments, comment],
          }

          const updatedVideos = project.videos.map(d =>
            d.id === deliverableId ? updatedDeliverable : d
          )

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
        })
      },

      markCommentResolved: (projectId, deliverableId, commentId) => {
        set(state => {
          const project = state.projects.find(p => p.id === projectId)
          if (!project) return state

          const deliverable = project.videos.find(d => d.id === deliverableId)
          if (!deliverable || !deliverable.comments) return state

          const updatedComments = deliverable.comments.map(comment =>
            comment.id === commentId ? { ...comment, resolved: true } : comment
          )

          const updatedDeliverable = {
            ...deliverable,
            comments: updatedComments,
          }

          const updatedVideos = project.videos.map(d =>
            d.id === deliverableId ? updatedDeliverable : d
          )

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
        })
      },

      requestChanges: (projectId, deliverableId, commentText) => {
        set(state => {
          const project = state.projects.find(p => p.id === projectId)
          if (!project) return state

          const deliverable = project.videos.find(d => d.id === deliverableId)
          if (!deliverable) return state

          const updatedDeliverable = { ...deliverable }

          if (commentText) {
            const newComment: Comment = {
              id: `comment_${Date.now()}`,
              projectId,
              deliverableId,
              userId: 'client',
              userName: 'Cliente',
              content: commentText,
              timestamp: 0,
              createdAt: new Date().toISOString(),
              resolved: false,
            }

            updatedDeliverable.comments = [
              ...(deliverable.comments || []),
              newComment,
            ]
          }

          updatedDeliverable.status = 'changes_requested'

          const updatedVideos = project.videos.map(d =>
            d.id === deliverableId ? updatedDeliverable : d
          )

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
        })
      },

      markVideoReady: (projectId, deliverableId) => {
        set(state => {
          const project = state.projects.find(p => p.id === projectId)
          if (!project) return state

          const updatedVideos = project.videos.map(d =>
            d.id === deliverableId ? { ...d, status: 'ready_for_review' } : d
          )

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
        })
      },
    }),
    {
      name: 'projects-storage',
    }
  )
)
