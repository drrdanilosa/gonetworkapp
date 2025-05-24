'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, UserPlus, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { useUIStore } from '@/store/useUIStore'
import EventSelector from '@/components/project/EventSelector'
import { toast } from '@/components/ui/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function EquipePage() {
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '',
    avatar: '',
  })

  const { projects, addTeamMember, removeTeamMember } = useProjectsStore()
  const { selectedEventId } = useUIStore()

  // Encontrar o evento selecionado
  const selectedEvent = projects.find(project => project.id === selectedEventId)
  const teamMembers = selectedEvent?.teamMembers || []

  const handleAddMember = () => {
    if (!selectedEventId) {
      toast({
        title: 'Nenhum evento selecionado',
        description: 'Selecione um evento antes de adicionar membros à equipe.',
        variant: 'destructive',
      })
      return
    }

    if (!newMember.name || !newMember.role) {
      toast({
        title: 'Informações incompletas',
        description: 'Nome e função são campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    // Adicionar o membro ao projeto
    addTeamMember(selectedEventId, {
      ...newMember,
      id: `member-${Date.now()}`,
    })

    // Limpar o formulário e fechar o diálogo
    setNewMember({
      name: '',
      email: '',
      role: '',
      avatar: '',
    })
    setIsAddingMember(false)

    toast({
      title: 'Membro adicionado',
      description: `${newMember.name} foi adicionado à equipe.`,
    })
  }

  const handleRemoveMember = (memberId: string) => {
    if (!selectedEventId) return

    removeTeamMember(selectedEventId, memberId)

    toast({
      title: 'Membro removido',
      description: 'O membro foi removido da equipe.',
    })
  }

  // Determinar o fallback para avatar (iniciais do nome)
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Equipe</h1>

        <div className="flex items-center gap-4">
          <EventSelector label="Evento" />

          <Button onClick={() => setIsAddingMember(true)}>
            <UserPlus className="mr-2 size-4" />
            Novo Membro
          </Button>
        </div>
      </div>

      {!selectedEventId ? (
        <div className="flex flex-col items-center justify-center rounded-lg border p-10">
          <AlertCircle className="mb-4 size-10 text-muted-foreground" />
          <p className="text-xl font-medium">Nenhum evento selecionado</p>
          <p className="mt-2 text-muted-foreground">
            Selecione um evento no menu acima para ver e gerenciar sua equipe.
          </p>
        </div>
      ) : teamMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border p-10">
          <UserPlus className="mb-4 size-10 text-muted-foreground" />
          <p className="text-xl font-medium">Nenhum membro na equipe</p>
          <p className="mb-4 mt-2 text-muted-foreground">
            Adicione membros à equipe para este evento.
          </p>
          <Button onClick={() => setIsAddingMember(true)}>
            Adicionar Membro
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map(member => (
            <Card key={member.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {member.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(member.id)}
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="size-12">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <p className="font-medium">{member.role}</p>
                    {member.email && (
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo para adicionar novo membro */}
      <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Membro à Equipe</DialogTitle>
            <DialogDescription>
              Preencha os dados para adicionar um novo membro à equipe deste
              evento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="member-name">Nome *</Label>
              <Input
                id="member-name"
                value={newMember.name}
                onChange={e =>
                  setNewMember({ ...newMember, name: e.target.value })
                }
                placeholder="Nome do membro"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="member-role">Função *</Label>
              <Input
                id="member-role"
                value={newMember.role}
                onChange={e =>
                  setNewMember({ ...newMember, role: e.target.value })
                }
                placeholder="Ex: Cinegrafista, Editor, Diretor"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                type="email"
                value={newMember.email}
                onChange={e =>
                  setNewMember({ ...newMember, email: e.target.value })
                }
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="member-avatar">URL da Foto (opcional)</Label>
              <Input
                id="member-avatar"
                value={newMember.avatar}
                onChange={e =>
                  setNewMember({ ...newMember, avatar: e.target.value })
                }
                placeholder="https://exemplo.com/foto.jpg"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingMember(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddMember}>
              <Plus className="mr-2 size-4" />
              Adicionar Membro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
