import { create } from 'zustand'

export const useProjectsStore = create(set => ({
  // Lista de projetos/eventos
  projects: [],

  // Adicionar novo projeto (limitado a 2 conforme orientação)
  addProject: project =>
    set(state => {
      // Limitar a 2 projetos conforme a orientação
      const newProjects = [project, ...state.projects].slice(0, 2)
      return { projects: newProjects }
    }),

  // Atualizar projeto existente
  updateProject: (projectId, data) =>
    set(state => ({
      projects: state.projects.map(project =>
        project.id === projectId ? { ...project, ...data } : project
      ),
    })),

  // Remover projeto
  removeProject: projectId =>
    set(state => ({
      projects: state.projects.filter(project => project.id !== projectId),
    })),

  // Adicionar ou atualizar briefing
  updateBriefing: (projectId, briefingData) =>
    set(state => ({
      projects: state.projects.map(project =>
        project.id === projectId
          ? { ...project, briefing: { ...project.briefing, ...briefingData } }
          : project
      ),
    })),

  // Gerar timeline a partir do briefing
  generateScheduleFromBriefing: projectId =>
    set(state => {
      const project = state.projects.find(p => p.id === projectId)
      if (!project) return state

      // Lógica para gerar timeline a partir do briefing
      const timeline = []

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
      }
    }),

  // Adicionar vídeo a um projeto
  addVideoToProject: (projectId, videoData) =>
    set(state => {
      const project = state.projects.find(p => p.id === projectId)
      if (!project) return state

      const newDeliverables = [
        ...(project.deliverables || []),
        {
          id: `video-${Date.now()}`,
          type: 'video',
          ...videoData,
          status: 'draft',
          createdAt: new Date().toISOString(),
        },
      ]

      return {
        projects: state.projects.map(p =>
          p.id === projectId
            ? {
                ...p,
                deliverables: newDeliverables,
                deliveries: (p.deliveries || 0) + 1,
              }
            : p
        ),
      }
    }),

  // Atualizar status de entrega de vídeo
  updateDeliverableStatus: (projectId, deliverableId, status) =>
    set(state => {
      const project = state.projects.find(p => p.id === projectId)
      if (!project || !project.deliverables) return state

      const wasCompleted =
        project.deliverables.find(d => d.id === deliverableId)?.status ===
        'approved'

      const isCompleted = status === 'approved'

      // Atualizar contador de concluídos
      let completedDelta = 0
      if (isCompleted && !wasCompleted) completedDelta = 1
      if (!isCompleted && wasCompleted) completedDelta = -1

      return {
        projects: state.projects.map(p =>
          p.id === projectId
            ? {
                ...p,
                deliverables: p.deliverables.map(d =>
                  d.id === deliverableId ? { ...d, status } : d
                ),
                completed: Math.max(0, (p.completed || 0) + completedDelta),
              }
            : p
        ),
      }
    }),

  // Adicionar membro à equipe do projeto
  addTeamMember: (projectId, member) =>
    set(state => {
      const project = state.projects.find(p => p.id === projectId)
      if (!project) return state

      const teamMembers = [
        ...(project.teamMembers || []),
        {
          id: member.id || `member-${Date.now()}`,
          ...member,
          addedAt: new Date().toISOString(),
        },
      ]

      return {
        projects: state.projects.map(p =>
          p.id === projectId
            ? {
                ...p,
                teamMembers,
                team: teamMembers.length,
              }
            : p
        ),
      }
    }),

  // Remover membro da equipe
  removeTeamMember: (projectId, memberId) =>
    set(state => {
      const project = state.projects.find(p => p.id === projectId)
      if (!project || !project.teamMembers) return state

      const updatedMembers = project.teamMembers.filter(m => m.id !== memberId)

      return {
        projects: state.projects.map(p =>
          p.id === projectId
            ? {
                ...p,
                teamMembers: updatedMembers,
                team: updatedMembers.length,
              }
            : p
        ),
      }
    }),
}))
