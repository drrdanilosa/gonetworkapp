'use client'

import React, { useState } from 'react'
import { useBriefing } from '../hooks/useBriefing'
import { Skeleton } from './ui/skeleton'
import { Button } from './ui/button'
import { Card } from './ui/card'
import {
  AlertCircle,
  RefreshCw,
  PlusCircle,
  Trash2,
} from 'lucide-react'
import { Input } from './ui/input'
import { useToast } from '@/hooks/use-toast'
import { TeamMember } from '@/types/briefing'
import { v4 as uuidv4 } from 'uuid'

interface EquipeTabProps {
  eventId: string
}

export default function EquipeTab({ eventId }: EquipeTabProps) {
  const { briefing, loading, error, saveBriefing, fetchBriefing } =
    useBriefing(eventId)
  const { toast } = useToast()
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: '',
    role: '',
    email: '',
    skills: [],
  })

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.role || !newMember.email) {
      toast({
        title: 'Erro',
        description:
          'Preencha pelo menos nome, função e email do membro da equipe',
        variant: 'destructive',
      })
      return
    }

    const teamMember: TeamMember = {
      id: uuidv4(),
      name: newMember.name,
      role: newMember.role,
      email: newMember.email,
      skills: newMember.skills || [],
      availability: [],
      phone: newMember.phone || '',
    }

    const updatedTeam = [...(briefing?.team || []), teamMember]

    try {
      await saveBriefing({ team: updatedTeam })
      setNewMember({
        name: '',
        role: '',
        email: '',
        skills: [],
      })
      toast({
        title: 'Sucesso',
        description: 'Membro adicionado à equipe com sucesso',
      })
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o membro à equipe',
        variant: 'destructive',
      })
    }
  }

  const handleRemoveMember = async (id: string) => {
    if (!briefing?.team) return

    const updatedTeam = briefing.team.filter(member => member.id !== id)

    try {
      await saveBriefing({ team: updatedTeam })
      toast({
        title: 'Sucesso',
        description: 'Membro removido da equipe',
      })
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o membro da equipe',
        variant: 'destructive',
      })
    }
  }

  const handleSkillChange = (value: string) => {
    setNewMember(prev => ({
      ...prev,
      skills: value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-10 w-1/4" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <Card className="space-y-4 border-destructive bg-destructive/10 p-6 text-center">
          <AlertCircle className="mx-auto size-10 text-destructive" />
          <h3 className="text-xl font-bold">Erro ao carregar briefing</h3>
          <p>{error}</p>
          <Button variant="outline" onClick={() => fetchBriefing()}>
            <RefreshCw className="mr-2 size-4" />
            Tentar novamente
          </Button>
        </Card>
      </div>
    )
  }

  // Se não tem briefing, redirecionar para criar primeiro o briefing
  if (!briefing) {
    return (
      <div className="p-8 text-center">
        <Card className="space-y-4 p-6 text-center">
          <h3 className="text-xl font-bold">Briefing não encontrado</h3>
          <p>
            É necessário criar um briefing básico antes de adicionar a equipe
          </p>
          <Button variant="default" onClick={() => saveBriefing({ eventId })}>
            Criar Briefing
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">Equipe do Evento</h2>

      <div className="space-y-8">
        {/* Formulário para adicionar novo membro */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Adicionar Novo Membro</h3>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Nome</label>
              <Input
                value={newMember.name}
                onChange={e =>
                  setNewMember(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Função</label>
              <Input
                value={newMember.role}
                onChange={e =>
                  setNewMember(prev => ({ ...prev, role: e.target.value }))
                }
                placeholder="Ex: Diretor, Produtor, Editor"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={newMember.email}
                onChange={e =>
                  setNewMember(prev => ({ ...prev, email: e.target.value }))
                }
                placeholder="contato@exemplo.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Telefone (opcional)
              </label>
              <Input
                value={newMember.phone || ''}
                onChange={e =>
                  setNewMember(prev => ({ ...prev, phone: e.target.value }))
                }
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Habilidades (separadas por vírgula)
              </label>
              <Input
                value={newMember.skills?.join(', ') || ''}
                onChange={e => handleSkillChange(e.target.value)}
                placeholder="Ex: Edição, Roteiro, Câmera, Iluminação"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddMember}>
              <PlusCircle className="mr-2 size-4" />
              Adicionar Membro
            </Button>
          </div>
        </Card>

        {/* Lista de membros da equipe */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Membros da Equipe</h3>

          {briefing.team && briefing.team.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {briefing.team.map(member => (
                <Card key={member.id} className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="text-sm">
                    <p>Email: {member.email}</p>
                    {member.phone && <p>Telefone: {member.phone}</p>}
                    {member.skills && member.skills.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium">
                          Habilidades:
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {member.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="rounded-md bg-secondary px-2 py-1 text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-muted/50 py-8 text-center">
              <p className="text-muted-foreground">
                Nenhum membro adicionado à equipe
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => fetchBriefing()}>
            <RefreshCw className="mr-2 size-4" />
            Atualizar Dados
          </Button>
        </div>
      </div>
    </div>
  )
}
