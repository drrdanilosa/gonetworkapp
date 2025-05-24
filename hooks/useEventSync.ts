// hooks/useEventSync.ts
import { useEffect } from 'react'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'

/**
 * Hook para sincronizar os eventos do Zustand com o sistema de persistência baseado em arquivos.
 * 
 * Isso garante que os eventos criados no cliente estejam disponíveis para as APIs do servidor,
 * resolvendo o problema onde eventos criados não apareciam na aba BRIEFING.
 */
export function useEventSync() {
  const projects = useProjectsStore(state => state.projects)

  useEffect(() => {
    // Sincronizar eventos com o servidor quando houver mudanças
    const syncEvents = async () => {
      for (const project of projects) {
        try {
          // Verificar se o evento já existe no servidor
          const response = await fetch(`/api/events/${project.id}`)
          
          if (response.status === 404) {
            // Evento não existe no servidor, criar
            console.log(`🔄 Sincronizando evento: ${project.title}`)
            
            await fetch('/api/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: project.id,
                title: project.title,
                client: project.client,
                date: project.date,
                createdAt: project.createdAt,
                team: project.team,
                briefing: project.briefing,
                description: project.description,
                tags: project.tags,
                status: project.status,
                videos: project.videos,
                assets: project.assets,
                tasks: project.tasks,
                deadline: project.deadline,
                thumbnail: project.thumbnail,
                deliverySettings: project.deliverySettings
              })
            })
            
            console.log(`✅ Evento sincronizado: ${project.title}`)
          }
        } catch (error) {
          console.error(`❌ Erro ao sincronizar evento ${project.title}:`, error)
        }
      }
    }

    if (projects.length > 0) {
      syncEvents()
    }
  }, [projects])
}
