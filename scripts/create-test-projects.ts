// Criação de projetos de teste para o watcher de vídeos
import { useProjectsStore } from '@/store/useProjectsStoreUnified'

// Garante que os projetos de teste existam
function createTestProjects() {
  const store = useProjectsStore.getState()
  const projects = store.projects

  // Verificar se já existe o projeto-1
  if (!projects.find(p => p.id === 'projeto-1')) {
    console.log('Criando projeto de teste: projeto-1')
    store.createProject({
      title: 'Projeto de Teste 1',
      description: 'Projeto para teste do watcher de vídeos',
      client: 'Cliente Teste',
      status: 'active',
      thumbnailUrl: '/placeholder.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias no futuro
      videos: [],
      tasks: [],
    })
  }

  // Verificar se já existe o projeto-2
  if (!projects.find(p => p.id === 'projeto-2')) {
    console.log('Criando projeto de teste: projeto-2')
    store.createProject({
      title: 'Projeto de Teste 2',
      description: 'Segundo projeto para teste do watcher de vídeos',
      client: 'Cliente Teste 2',
      status: 'active',
      thumbnailUrl: '/placeholder.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 dias no futuro
      videos: [],
      tasks: [],
    })
  }

  console.log('Projetos de teste verificados/criados com sucesso')
  return { projeto1: 'projeto-1', projeto2: 'projeto-2' }
}

// Exportar a função para uso
export default createTestProjects
