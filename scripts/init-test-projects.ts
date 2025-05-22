// Script para inicializar os projetos de teste para o watcher
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { v4 as uuidv4 } from 'uuid'

// Função para criar os IDs dos projetos com o formato exato necessário
function createTestProjects() {
  try {
    const store = useProjectsStore.getState()
    const existingProjects = store.projects || []

    // Verificar e criar projeto-1 se não existir
    if (!existingProjects.find(p => p.id === 'projeto-1')) {
      console.log('Criando projeto de teste: projeto-1')
      const projeto1 = {
        id: 'projeto-1', // ID EXATO necessário para o watcher
        title: 'Projeto de Teste 1',
        description: 'Projeto para teste do watcher de vídeos',
        client: 'Cliente Teste',
        status: 'active',
        thumbnailUrl: '/placeholder.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        videos: [],
        tasks: [],
      }
      store.addProject(projeto1)
    } // Verificar e criar projeto-2 se não existir
    if (!existingProjects.find(p => p.id === 'projeto-2')) {
      console.log('Criando projeto de teste: projeto-2')
      const projeto2 = {
        id: 'projeto-2', // ID EXATO necessário para o watcher
        title: 'Projeto de Teste 2',
        description: 'Segundo projeto para teste do watcher de vídeos',
        client: 'Cliente Teste 2',
        status: 'active',
        thumbnailUrl: '/placeholder.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        videos: [],
        tasks: [],
      }
      store.addProject(projeto2)
    }

    console.log('Projetos de teste verificados/criados com sucesso')
    return existingProjects.length > 0
  } catch (error) {
    console.error('Erro ao criar projetos de teste:', error)
    return false
  }
}

export default createTestProjects
