'use client'

'use client'

"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MainWindow from '@/components/main-window'
import { useAuthStore } from '@/store/useAuthStore'
import { EditingApprovalTab } from '@/features/projects/EditingApproval'

export default function Home() {
  const user = useAuthStore(state => state.user)
  const router = useRouter()

  const projects = useProjectsStore(state => state.projects)
  const currentProject = useProjectsStore(state => state.currentProject)
  const createProject = useProjectsStore(state => state.createProject)
  const selectProject = useProjectsStore(state => state.selectProject)

  // Criar um projeto de exemplo se não houver projetos
  useEffect(() => {
    if (projects.length === 0) {
      createProject('Projeto Demonstração')
    }
  }, [projects.length, createProject])

  // Sem autenticação, vamos direto para a interface principal
  return (
    <main className="min-h-screen">
      <MainWindow
        currentUser={user}
        onLogout={() => {
          // Lógica de logout
          useAuthStore.setState({ user: undefined })
          router.push('/login')
        }}
      >
        {currentProject ? (
          // Mostrar interface de edição se um projeto estiver selecionado
          <EditingApprovalTab />
        ) : (
          // Mostrar lista de projetos se nenhum projeto estiver selecionado
          <div className="p-4">
            <h1 className="text-2xl font-bold">Seus Projetos</h1>
            <ul>
              {projects.map(project => (
                <li
                  key={project.id}
                  className="flex items-center justify-between p-4 bg-card rounded-lg mb-3 shadow-sm"
                >
                  <span className="font-medium">{project.name}</span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      onClick={() => router.push(`/eventos/${project.id}/gerenciar`)}
                    >
                      Gerenciar
                    </Button>
                    <Button onClick={() => selectProject(project.id)}>
                      Selecionar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => createProject('Novo Projeto')}
              className="mt-4"
            >
              <Plus className="mr-2" /> Criar Novo Projeto
            </Button>
          </div>
        )}
      </MainWindow>
    </main>
  )
}
