'use client'

import { TaskCard } from "@/components/ui/task-card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { MobileMenu } from "@/components/ui/mobile-menu"
import Link from "next/link"
import { Plus, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input" 
import { useMobile } from "@/hooks/use-mobile"

export default function ExamplePage() {
  const isMobile = useMobile()
  const mockTasks = [
    {
      title: "Desenvolver tela de login",
      description: "Criar uma tela de login responsiva utilizando NextJS e o tema Dracula",
      status: "completed" as const,
      tags: ["frontend", "ui", "auth"],
      dueDate: "21 de maio, 2025",
      assignedTo: {
        name: "Ana Silva",
      }
    },
    {
      title: "Implementar API de autenticação",
      description: "Desenvolver endpoints para autenticação de usuários com JWT",
      status: "in-progress" as const,
      tags: ["backend", "api", "auth"],
      dueDate: "25 de maio, 2025",
      assignedTo: {
        name: "Carlos Mendes",
      }
    },
    {
      title: "Configurar banco de dados",
      description: "Configurar e migrar o banco de dados para a nova versão",
      status: "pending" as const,
      tags: ["devops", "database"],
      dueDate: "30 de maio, 2025",
    },
    {
      title: "Otimizar performance",
      description: "Identificar e corrigir problemas de performance na aplicação",
      status: "pending" as const,
      tags: ["performance", "optimization"],
      dueDate: "05 de junho, 2025",
    },
    {
      title: "Testes unitários",
      description: "Implementar testes unitários para os principais componentes",
      status: "in-progress" as const,
      tags: ["testing", "quality"],
      dueDate: "28 de maio, 2025",
      assignedTo: {
        name: "Renata Oliveira",
      }
    },
    {
      title: "Documentação da API",
      description: "Criar documentação detalhada para todos os endpoints da API",
      status: "completed" as const,
      tags: ["documentation", "api"],
      dueDate: "15 de maio, 2025",
      assignedTo: {
        name: "Pedro Costa",
      }
    },
  ]
  return (
    <div className="container py-4 md:py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tarefas do Projeto</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
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
                <Plus className="mr-1 h-4 w-4" />
                Nova Tarefa
              </Button>
            </>
          ) : (
            <>
              <MobileMenu />
              <Button size="icon" className="dracula-gradient">
                <Plus className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar tarefas..." 
            className="pl-9 bg-background"
          />
        </div>
        <Button variant="outline" className="flex gap-2">
          <Filter className="h-4 w-4" />
          Filtrar
        </Button>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
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
        <div className="fixed bottom-4 right-4 left-4 flex justify-between">
          <Link href="/" className="w-1/2 mr-2">
            <Button variant="outline" className="w-full">Voltar</Button>
          </Link>
          <Button className="dracula-gradient w-1/2">
            <Plus className="mr-1 h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>
      )}
    </div>
  )
}
