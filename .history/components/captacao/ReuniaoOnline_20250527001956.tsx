'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCaptacaoStore } from '@/store/useCaptacaoStore'
import {
  Plus,
  Video,
  Calendar,
  Users,
  ExternalLink,
  Upload,
  FileText,
  Trash2,
  Clock,
  Link as LinkIcon,
} from 'lucide-react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'

interface ReuniaoOnlineProps {
  eventId: string
}

// Plataformas suportadas
const plataformas = [
  { id: 'meet', name: 'Google Meet', icon: '🎥', color: 'bg-blue-500' },
  { id: 'zoom', name: 'Zoom', icon: '💻', color: 'bg-blue-600' },
  { id: 'teams', name: 'Microsoft Teams', icon: '👥', color: 'bg-purple-500' },
  { id: 'other', name: 'Outra', icon: '🔗', color: 'bg-gray-500' },
]

export function ReuniaoOnline({ eventId }: ReuniaoOnlineProps) {
  const {
    getReunioesByEvent,
    addReuniao,
    updateReuniao,
    deleteReuniao,
    addArquivoReuniao,
    removeArquivoReuniao,
  } = useCaptacaoStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState('nova')
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null)

  const [newMeeting, setNewMeeting] = useState({
    titulo: '',
    plataforma: 'meet' as const,
    linkReuniao: '',
    dataHora: '',
    duracao: 60,
    participantes: [] as string[],
    observacoes: '',
  })

  const [participantInput, setParticipantInput] = useState('')
  const reunioes = getReunioesByEvent(eventId)

  // Função para extrair informações do link (simulada)
  const extractMeetingInfo = (link: string) => {
    try {
      // Esta é uma implementação simplificada
      // Em um caso real, você faria requests para APIs das plataformas
      const url = new URL(link)

      if (url.hostname.includes('meet.google.com')) {
        return { plataforma: 'meet', titulo: 'Reunião Google Meet' }
      } else if (url.hostname.includes('zoom.us')) {
        return { plataforma: 'zoom', titulo: 'Reunião Zoom' }
      } else if (url.hostname.includes('teams.microsoft.com')) {
        return { plataforma: 'teams', titulo: 'Reunião Teams' }
      }

      return { plataforma: 'other', titulo: 'Reunião Online' }
    } catch {
      return { plataforma: 'other', titulo: 'Reunião Online' }
    }
  }

  const handleLinkChange = (link: string) => {
    setNewMeeting(prev => ({ ...prev, linkReuniao: link }))

    if (link) {
      const info = extractMeetingInfo(link)
      setNewMeeting(prev => ({
        ...prev,
        plataforma: info.plataforma as any,
        titulo: prev.titulo || info.titulo,
      }))
    }
  }

  const addParticipant = () => {
    if (
      participantInput.trim() &&
      !newMeeting.participantes.includes(participantInput.trim())
    ) {
      setNewMeeting(prev => ({
        ...prev,
        participantes: [...prev.participantes, participantInput.trim()],
      }))
      setParticipantInput('')
    }
  }

  const removeParticipant = (email: string) => {
    setNewMeeting(prev => ({
      ...prev,
      participantes: prev.participantes.filter(p => p !== email),
    }))
  }

  const handleCreateMeeting = () => {
    if (!newMeeting.titulo || !newMeeting.linkReuniao) {
      alert('Preencha pelo menos o título e o link da reunião.')
      return
    }

    addReuniao({
      eventId,
      ...newMeeting,
      status: 'agendada',
      criadoPor: 'Usuário Atual', // Em um app real, viria do store de auth
      arquivos: [],
    })

    // Reset form
    setNewMeeting({
      titulo: '',
      plataforma: 'meet',
      linkReuniao: '',
      dataHora: '',
      duracao: 60,
      participantes: [],
      observacoes: '',
    })
    setIsDialogOpen(false)
  }

  const handleFileUpload = (reuniaoId: string, files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        addArquivoReuniao(reuniaoId, {
          nome: file.name,
          url: reader.result as string,
          tipo: file.type,
          tamanho: file.size,
          uploadedBy: 'Usuário Atual',
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const openMeetingLink = (link: string) => {
    window.open(link, '_blank')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'bg-blue-100 text-blue-800'
      case 'em_andamento':
        return 'bg-green-100 text-green-800'
      case 'finalizada':
        return 'bg-gray-100 text-gray-800'
      case 'cancelada':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'Agendada'
      case 'em_andamento':
        return 'Em Andamento'
      case 'finalizada':
        return 'Finalizada'
      case 'cancelada':
        return 'Cancelada'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Reuniões Online</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie reuniões online para o evento
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="size-4" />
              Nova Reunião
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-4xl">
            <DialogHeader>
              <DialogTitle>Nova Reunião Online</DialogTitle>
            </DialogHeader>

            <ScrollArea className="max-h-[80vh] pr-4">
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="nova">Criar Nova</TabsTrigger>
                  <TabsTrigger value="plataformas">Plataformas</TabsTrigger>
                </TabsList>

                <TabsContent value="nova" className="space-y-6">
                  {/* Seleção de Plataforma */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Escolha a Plataforma
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {plataformas.map(plat => (
                          <button
                            key={plat.id}
                            onClick={() =>
                              setNewMeeting(prev => ({
                                ...prev,
                                plataforma: plat.id as any,
                              }))
                            }
                            className={`rounded-lg border-2 p-4 text-center transition-colors ${
                              newMeeting.plataforma === plat.id
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="mb-2 text-2xl">{plat.icon}</div>
                            <div className="text-sm font-medium">
                              {plat.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detalhes da Reunião */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Detalhes da Reunião
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="link">Link da Reunião *</Label>
                        <Input
                          id="link"
                          value={newMeeting.linkReuniao}
                          onChange={e => handleLinkChange(e.target.value)}
                          placeholder="Cole o link da reunião aqui"
                        />
                      </div>

                      <div>
                        <Label htmlFor="titulo">Título da Reunião *</Label>
                        <Input
                          id="titulo"
                          value={newMeeting.titulo}
                          onChange={e =>
                            setNewMeeting(prev => ({
                              ...prev,
                              titulo: e.target.value,
                            }))
                          }
                          placeholder="Digite o título da reunião"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="dataHora">Data e Hora</Label>
                          <Input
                            id="dataHora"
                            type="datetime-local"
                            value={newMeeting.dataHora}
                            onChange={e =>
                              setNewMeeting(prev => ({
                                ...prev,
                                dataHora: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="duracao">Duração (minutos)</Label>
                          <Input
                            id="duracao"
                            type="number"
                            value={newMeeting.duracao}
                            onChange={e =>
                              setNewMeeting(prev => ({
                                ...prev,
                                duracao: parseInt(e.target.value) || 60,
                              }))
                            }
                            min="15"
                            step="15"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                          id="observacoes"
                          value={newMeeting.observacoes}
                          onChange={e =>
                            setNewMeeting(prev => ({
                              ...prev,
                              observacoes: e.target.value,
                            }))
                          }
                          placeholder="Observações sobre a reunião"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Participantes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Participantes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={participantInput}
                          onChange={e => setParticipantInput(e.target.value)}
                          placeholder="Email do participante"
                          onKeyPress={e =>
                            e.key === 'Enter' && addParticipant()
                          }
                        />
                        <Button onClick={addParticipant} variant="outline">
                          Adicionar
                        </Button>
                      </div>

                      {newMeeting.participantes.length > 0 && (
                        <div className="space-y-2">
                          {newMeeting.participantes.map(
                            (participant, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between rounded bg-gray-50 p-2"
                              >
                                <span className="text-sm">{participant}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeParticipant(participant)}
                                >
                                  <Trash2 className="size-3" />
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateMeeting}>Criar Reunião</Button>
                  </div>
                </TabsContent>

                <TabsContent value="plataformas" className="space-y-4">
                  <div className="grid gap-4">
                    {plataformas.map(plat => (
                      <Card key={plat.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <div
                              className={`size-12 ${plat.color} flex items-center justify-center rounded-lg text-xl text-white`}
                            >
                              {plat.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{plat.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {plat.id === 'meet' &&
                                  'Integração com Google Meet para reuniões rápidas'}
                                {plat.id === 'zoom' &&
                                  'Suporte completo para reuniões Zoom'}
                                {plat.id === 'teams' &&
                                  'Compatível com Microsoft Teams'}
                                {plat.id === 'other' &&
                                  'Qualquer outra plataforma de reunião'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Reuniões */}
      <div className="grid gap-4">
        {reunioes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <Video className="mx-auto mb-4 size-12 opacity-50" />
                <p>Nenhuma reunião cadastrada ainda.</p>
                <p className="text-sm">
                  Clique em "Nova Reunião" para começar.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          reunioes.map(reuniao => (
            <Card key={reuniao.id}>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{reuniao.titulo}</h4>
                      <Badge className={getStatusColor(reuniao.status)}>
                        {getStatusText(reuniao.status)}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-1">
                        <LinkIcon className="size-3" />
                        {
                          plataformas.find(p => p.id === reuniao.plataforma)
                            ?.name
                        }
                      </p>

                      {reuniao.dataHora && (
                        <p className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {format(
                            new Date(reuniao.dataHora),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: pt }
                          )}
                        </p>
                      )}

                      <p className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {reuniao.duracao} minutos
                      </p>

                      {reuniao.participantes.length > 0 && (
                        <p className="flex items-center gap-1">
                          <Users className="size-3" />
                          {reuniao.participantes.length} participante(s)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openMeetingLink(reuniao.linkReuniao)}
                    >
                      <ExternalLink className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteReuniao(reuniao.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Arquivos da reunião */}
                {reuniao.arquivos.length > 0 && (
                  <div className="border-t pt-4">
                    <h5 className="mb-2 text-sm font-medium">
                      Arquivos da Reunião
                    </h5>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {reuniao.arquivos.map(arquivo => (
                        <div
                          key={arquivo.id}
                          className="flex items-center gap-2 rounded bg-gray-50 p-2 text-sm"
                        >
                          <FileText className="size-4" />
                          <span className="flex-1 truncate">
                            {arquivo.nome}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeArquivoReuniao(reuniao.id, arquivo.id)
                            }
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload de arquivos */}
                <div className="mt-4 border-t pt-4">
                  <input
                    type="file"
                    multiple
                    onChange={e =>
                      e.target.files &&
                      handleFileUpload(reuniao.id, e.target.files)
                    }
                    className="hidden"
                    id={`upload-${reuniao.id}`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById(`upload-${reuniao.id}`)?.click()
                    }
                    className="flex items-center gap-2"
                  >
                    <Upload className="size-4" />
                    Adicionar Arquivos
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
