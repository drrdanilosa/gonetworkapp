'use client'

import { TaskCard } from '@/components/ui/task-card'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { MobileMenu } from '@/components/ui/mobile-menu'
import Link from 'next/link'
import { Plus, Filter, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useMobile } from '@/hooks/use-mobile'

export default function ExamplePage() {
  const isMobile = useMobile()
  const mockTasks = [
    {
      title: 'Desenvolver tela de login',
      description:
        'Criar uma tela de login responsiva utilizando NextJS e o tema Dracula',
      status: 'completed' as const,
      tags: ['frontend', 'ui', 'auth'],
      dueDate: '21 de maio, 2025',
      assignedTo: {
        name: 'Ana Silva',
      },
    },
    {
      title: 'Implementar API de autenticação',
      description:
        'Desenvolver endpoints para autenticação de usuários com JWT',
      status: 'in-progress' as const,
      tags: ['backend', 'api', 'auth'],
      dueDate: '25 de maio, 2025',
      assignedTo: {
        name: 'Carlos Mendes',
      },
    },
    {
      title: 'Configurar banco de dados',
      description: 'Configurar e migrar o banco de dados para a nova versão',
      status: 'pending' as const,
      tags: ['devops', 'database'],
      dueDate: '30 de maio, 2025',
    },
    {
      title: 'Otimizar performance',
      description:
        'Identificar e corrigir problemas de performance na aplicação',
      status: 'pending' as const,
      tags: ['performance', 'optimization'],
      dueDate: '05 de junho, 2025',
    },
    {
      title: 'Testes unitários',
      description:
        'Implementar testes unitários para os principais componentes',
      status: 'in-progress' as const,
      tags: ['testing', 'quality'],
      dueDate: '28 de maio, 2025',
      assignedTo: {
        name: 'Renata Oliveira',
      },
    },
    {
      title: 'Documentação da API',
      description:
        'Criar documentação detalhada para todos os endpoints da API',
      status: 'completed' as const,
      tags: ['documentation', 'api'],
      dueDate: '15 de maio, 2025',
      assignedTo: {
        name: 'Pedro Costa',
      },
    },
  ]
  return (
    <div className="container py-4 md:py-10">
      <div className="mb-6 flex flex-col justify-between gap-4 md:mb-8 md:flex-row md:items-center md:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Tarefas do Projeto
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            Gerenciamento de tarefas utilizando o tema Dracula
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          {!isMobile ? (
            <>
              <Link href="/">
                <Button variant="outline">Voltar</Button>
              </Link>
              <Button className="dracula-gradient">
                <Plus className="mr-1 size-4" />
                Nova Tarefa
              </Button>
            </>
          ) : (
            <>
              <MobileMenu />
              <Button size="icon" className="dracula-gradient">
                <Plus className="size-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar tarefas..."
            className="bg-background pl-9"
          />
        </div>
        <Button variant="outline" className="flex gap-2">
          <Filter className="size-4" />
          Filtrar
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {mockTasks.map((task, index) => (
          <TaskCard
            key={index}
            title={task.title}
            description={task.description}
            status={task.status}
            tags={task.tags}
            dueDate={task.dueDate}
            assignedTo={task.assignedTo}
            isMobile={isMobile}
          />
        ))}
      </div>

      {isMobile && (
        <div className="fixed inset-x-4 bottom-4 flex justify-between">
          <Link href="/" className="mr-2 w-1/2">
            <Button variant="outline" className="w-full">
              Voltar
            </Button>
          </Link>
          <Button className="dracula-gradient w-1/2">
            <Plus className="mr-1 size-4" />
            Nova Tarefa
          </Button>
        </div>
      )}
    </div>
  )
}
