import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Definição de tipos
export interface VideoMetadata {
  duration?: number;
  resolution?: string;
  fileSize?: number;
  codec?: string;
  [key: string]: any;
}

export interface Video {
  id: string;
  projectId: string;
  filename: string;
  url: string;
  createdAt: string;
  updatedAt?: string;
  status: 'editing' | 'review' | 'approved' | 'changes_requested' | 'archived';
  version?: number;
  comments?: Comment[];
  metadata?: VideoMetadata;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp?: number; // Posição no vídeo em segundos
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  editorId?: string;
  eventDate?: string;
  finalDueDate?: string;
  createdAt: string;
  updatedAt?: string;
  status: 'draft' | 'in_progress' | 'review' | 'completed' | 'archived';
  numVideos?: number;
}

interface ProjectsState {
  projects: Project[];
  videos: Video[];
  comments: Comment[];
  
  // Getters/Seletores
  getProjectById: (projectId: string) => Project | undefined;
  getVideoById: (videoId: string) => Video | undefined;
  getVideosByProjectId: (projectId: string) => Video[];
  getCommentsByVideoId: (videoId: string) => Comment[];
  
  // Projetos
  addProject: (project: Project) => void;
  updateProject: (projectId: string, data: Partial<Project>) => void;
  removeProject: (projectId: string) => void;
  
  // Vídeos
  addVideo: (video: Video) => void;
  updateVideo: (videoId: string, data: Partial<Video>) => void;
  updateVideoStatus: (videoId: string, status: Video['status']) => void;
  removeVideo: (videoId: string) => void;
  removeVideosByProjectId: (projectId: string) => void;
  registerWatcherVideo: (projectId: string, videoUrl: string, filename: string, metadata?: VideoMetadata) => void;
  
  // Comentários
  addComment: (comment: Comment) => void;
  updateComment: (commentId: string, text: string) => void;
  removeComment: (commentId: string) => void;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: [],
      videos: [],
      comments: [],
      
      // Getters/Seletores
      getProjectById: (projectId) => {
        return get().projects.find(p => p.id === projectId);
      },
      
      getVideoById: (videoId) => {
        return get().videos.find(v => v.id === videoId);
      },
      
      getVideosByProjectId: (projectId) => {
        return get().videos.filter(v => v.projectId === projectId);
      },
      
      getCommentsByVideoId: (videoId) => {
        return get().comments.filter(c => c.videoId === videoId);
      },
      
      // Projetos
      addProject: (project) => set((state) => ({ 
        projects: [...state.projects, project] 
      })),
      
      updateProject: (projectId, data) => set((state) => ({
        projects: state.projects.map(p => 
          p.id === projectId ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
        )
      })),
      
      removeProject: (projectId) => set((state) => {
        // Primeiro verifica se o projeto existe
        const projectExists = state.projects.some(p => p.id === projectId);
        if (!projectExists) {
          console.error(`Projeto com ID ${projectId} não encontrado`);
          return state;
        }
        
        // Remove o projeto e seus vídeos relacionados
        const filteredProjects = state.projects.filter(p => p.id !== projectId);
        const filteredVideos = state.videos.filter(v => v.projectId !== projectId);
        const videoIdsToRemove = state.videos
          .filter(v => v.projectId === projectId)
          .map(v => v.id);
        const filteredComments = state.comments.filter(c => !videoIdsToRemove.includes(c.videoId));
        
        return {
          projects: filteredProjects,
          videos: filteredVideos,
          comments: filteredComments
        };
      }),
      
      // Vídeos
      addVideo: (video) => set((state) => ({
        videos: [...state.videos, video]
      })),
      
      updateVideo: (videoId, data) => set((state) => ({
        videos: state.videos.map(v => 
          v.id === videoId 
            ? { ...v, ...data, updatedAt: new Date().toISOString() } 
            : v
        )
      })),
      
      updateVideoStatus: (videoId, status) => set((state) => ({
        videos: state.videos.map(v => 
          v.id === videoId 
            ? { ...v, status, updatedAt: new Date().toISOString() } 
            : v
        )
      })),
      
      removeVideo: (videoId) => set((state) => {
        // Verifica se o vídeo existe
        const videoExists = state.videos.some(v => v.id === videoId);
        if (!videoExists) {
          console.error(`Vídeo com ID ${videoId} não encontrado`);
          return state;
        }
        
        // Remove o vídeo e seus comentários
        const filteredVideos = state.videos.filter(v => v.id !== videoId);
        const filteredComments = state.comments.filter(c => c.videoId !== videoId);
        
        return {
          videos: filteredVideos,
          comments: filteredComments
        };
      }),
      
      removeVideosByProjectId: (projectId) => set((state) => {
        // Verifica se o projeto existe
        const projectExists = state.projects.some(p => p.id === projectId);
        if (!projectExists) {
          console.error(`Projeto com ID ${projectId} não encontrado`);
          return state;
        }
        
        // Remove todos os vídeos do projeto e seus comentários
        const videoIdsToRemove = state.videos
          .filter(v => v.projectId === projectId)
          .map(v => v.id);
        const filteredVideos = state.videos.filter(v => v.projectId !== projectId);
        const filteredComments = state.comments.filter(c => !videoIdsToRemove.includes(c.videoId));
        
        return {
          videos: filteredVideos,
          comments: filteredComments
        };
      }),
      
      registerWatcherVideo: (projectId, videoUrl, filename, metadata) => set((state) => {
        // Verifica se o projeto existe
        const projectExists = state.projects.some(p => p.id === projectId);
        if (!projectExists) {
          console.error(`Projeto com ID ${projectId} não encontrado`);
          return state;
        }
        
        // Extrai o número de versão do nome do arquivo, se existir
        // Exemplo: "video_v2.mp4" -> versão 2
        const versionMatch = filename.match(/v(\d+)/i);
        const version = versionMatch ? parseInt(versionMatch[1], 10) : 1;
        
        // Cria novo vídeo
        const now = new Date().toISOString();
        const newVideo: Video = {
          id: `video_${Date.now()}`,
          projectId,
          filename,
          url: videoUrl,
          createdAt: now,
          updatedAt: now,
          status: 'editing',
          version,
          metadata: metadata || {},
        };
        
        return {
          videos: [...state.videos, newVideo]
        };
      }),
      
      // Comentários
      addComment: (comment) => set((state) => ({
        comments: [...state.comments, comment]
      })),
      
      updateComment: (commentId, text) => set((state) => ({
        comments: state.comments.map(c => 
          c.id === commentId ? { ...c, text, updatedAt: new Date().toISOString() } : c
        )
      })),
      
      removeComment: (commentId) => set((state) => ({
        comments: state.comments.filter(c => c.id !== commentId)
      }))
    }),
    {
      name: 'projects-storage',
    }
  )
);
