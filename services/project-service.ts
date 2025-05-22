import { Project, Comment, Annotation, Asset } from '@/types/project';
import { API_URL, getHeaders, handleApiError } from './api-config';

// Funções para gerenciamento de projetos

export async function getProjects(token: string): Promise<Project[]> {
  try {
    // Simulação de obtenção de projetos (em produção, isso seria uma chamada real à API)
    // Remova esta simulação e descomente o código abaixo para produção
    return simulateGetProjects();
    
    // Código de produção para obter projetos reais
    /*
    const response = await fetch(`${API_URL}/projects`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    
    if (!response.ok) {
      throw response;
    }
    
    const data = await response.json();
    return data.projects;
    */
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getProjectById(id: string, token: string): Promise<Project> {
  try {
    // Simulação de obtenção de um projeto específico (em produção, isso seria uma chamada real à API)
    // Remova esta simulação e descomente o código abaixo para produção
    return simulateGetProjectById(id);
    
    // Código de produção para obter um projeto específico real
    /*
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    
    if (!response.ok) {
      throw response;
    }
    
    const data = await response.json();
    return data.project;
    */
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function createProject(projectData: Partial<Project>, token: string): Promise<Project> {
  try {
    // Simulação de criação de projeto (em produção, isso seria uma chamada real à API)
    // Remova esta simulação e descomente o código abaixo para produção
    return simulateCreateProject(projectData);
    
    // Código de produção para criar um projeto real
    /*
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(projectData),
    });
    
    if (!response.ok) {
      throw response;
    }
    
    const data = await response.json();
    return data.project;
    */
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function updateProject(id: string, projectData: Partial<Project>, token: string): Promise<Project> {
  try {
    // Simulação de atualização de projeto (em produção, isso seria uma chamada real à API)
    // Remova esta simulação e descomente o código abaixo para produção
    return simulateUpdateProject(id, projectData);
    
    // Código de produção para atualizar um projeto real
    /*
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(projectData),
    });
    
    if (!response.ok) {
      throw response;
    }
    
    const data = await response.json();
    return data.project;
    */
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function deleteProject(id: string, token: string): Promise<void> {
  try {
    // Simulação de exclusão de projeto (em produção, isso seria uma chamada real à API)
    // Remova esta simulação e descomente o código abaixo para produção
    simulateDeleteProject(id);
    
    // Código de produção para excluir um projeto real
    /*
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    
    if (!response.ok) {
      throw response;
    }
    */
    
    return;
  } catch (error) {
    throw handleApiError(error);
  }
}

// Comentários

export async function getCommentsByProject(projectId: string, token: string): Promise<Comment[]> {
  try {
    // Simulação de obtenção de comentários (em produção, isso seria uma chamada real à API)
    // Remova esta simulação e descomente o código abaixo para produção
    return simulateGetCommentsByProject(projectId);
    
    // Código de produção para obter comentários reais
    /*
    const response = await fetch(`${API_URL}/projects/${projectId}/comments`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    
    if (!response.ok) {
      throw response;
    }
    
    const data = await response.json();
    return data.comments;
    */
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function createComment(commentData: Partial<Comment>, token: string): Promise<Comment> {
  try {
    // Simulação de criação de comentário (em produção, isso seria uma chamada real à API)
    // Remova esta simulação e descomente o código abaixo para produção
    return simulateCreateComment(commentData);
    
    // Código de produção para criar um comentário real
    /*
    const response = await fetch(`${API_URL}/projects/${commentData.projectId}/comments`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(commentData),
    });
    
    if (!response.ok) {
      throw response;
    }
    
    const data = await response.json();
    return data.comment;
    */
  } catch (error) {
    throw handleApiError(error);
  }
}

// Funções de simulação para facilitar o desenvolvimento

function simulateGetProjects(): Project[] {
  return [
    {
      id: 'proj_1',
      title: 'Vídeo de Casamento João e Maria',
      description: 'Vídeo de casamento realizado em 10/05/2025',
      clientId: 'client_1',
      editorId: 'editor_1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'review',
      videoUrl: 'https://www.example.com/video.mp4',
      thumbnailUrl: '/placeholder.jpg',
      deadline: new Date(2025, 5, 30).toISOString(),
    },
    {
      id: 'proj_2',
      title: 'Vídeo Corporativo Empresa XYZ',
      description: 'Vídeo institucional da empresa XYZ',
      clientId: 'client_2',
      editorId: 'editor_1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      videoUrl: 'https://www.example.com/video2.mp4',
      thumbnailUrl: '/placeholder.jpg',
      deadline: new Date(2025, 6, 15).toISOString(),
    },
  ];
}

function simulateGetProjectById(id: string): Project {
  const projects = simulateGetProjects();
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    throw new Error(`Project with id ${id} not found`);
  }
  
  return project;
}

function simulateCreateProject(projectData: Partial<Project>): Project {
  return {
    id: 'proj_' + Math.random().toString(36).substr(2, 9),
    title: projectData.title || 'Novo Projeto',
    description: projectData.description || '',
    clientId: projectData.clientId || 'client_1',
    editorId: projectData.editorId || 'editor_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    videoUrl: projectData.videoUrl,
    thumbnailUrl: projectData.thumbnailUrl || '/placeholder.jpg',
    deadline: projectData.deadline,
  };
}

function simulateUpdateProject(id: string, projectData: Partial<Project>): Project {
  const project = simulateGetProjectById(id);
  
  return {
    ...project,
    ...projectData,
    updatedAt: new Date().toISOString(),
  };
}

function simulateDeleteProject(id: string): void {
  // Simulação de exclusão não faz nada além de verificar se o projeto existe
  simulateGetProjectById(id);
}

function simulateGetCommentsByProject(projectId: string): Comment[] {
  return [
    {
      id: 'comment_1',
      projectId,
      userId: 'client_1',
      timestamp: 15, // 15 segundos no vídeo
      content: 'Este trecho está muito escuro',
      createdAt: new Date().toISOString(),
      resolved: false,
    },
    {
      id: 'comment_2',
      projectId,
      userId: 'editor_1',
      timestamp: 45, // 45 segundos no vídeo
      content: 'Podemos adicionar uma transição aqui',
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
      resolved: true,
    },
  ];
}

function simulateCreateComment(commentData: Partial<Comment>): Comment {
  return {
    id: 'comment_' + Math.random().toString(36).substr(2, 9),
    projectId: commentData.projectId || 'unknown_project',
    userId: commentData.userId || 'unknown_user',
    timestamp: commentData.timestamp || 0,
    content: commentData.content || '',
    createdAt: new Date().toISOString(),
    resolved: false,
  };
}
