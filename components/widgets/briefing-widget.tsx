import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, Save } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import GeneralInfoTab from "@/features/briefing/components/GeneralInfoTab"
import { useUIStore } from "@/store/useUIStore"

type Event = {
  id: string;
  name: string;
  date: string;
}

export default function BriefingWidget() {
  // Usar o ID do evento selecionado do useUIStore
  const selectedEventId = useUIStore((state) => state.selectedEventId);
  const setSelectedEventId = useUIStore((state) => state.setSelectedEventId);
  
  // Estado local para seleção de evento como fallback
  const [selectedEvent, setSelectedEvent] = useState<string>("123")
  
  // Usar o ID do evento do useUIStore se disponível, caso contrário usar o estado local
  const effectiveEventId = selectedEventId || selectedEvent;
  
  const [events, setEvents] = useState<Event[]>([
    { id: "123", name: "Festival de Música", date: "18-20 Mai 2025" },
    { id: "456", name: "Lançamento de Produto", date: "25 Mai 2025" },
    { id: "789", name: "Conferência Tech", date: "01 Jun 2025" }
  ])
  
  // Isso seria substituído por uma chamada real à API em um ambiente de produção
  useEffect(() => {
    // Simulação de carregamento de eventos da API
    // setEvents([...]) seria chamado aqui em um ambiente real
  }, [])
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Briefing</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>Evento:</Label>
            <Select 
              value={effectiveEventId} 
              onValueChange={(value) => {
                setSelectedEvent(value);
                setSelectedEventId(value);
              }}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecione um evento" />
              </SelectTrigger>
              <SelectContent>
                {events.map(event => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name} - {event.date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>

          <Button>
            <Clock className="h-4 w-4 mr-2" />
            Gerar Timeline
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="info">Informações Gerais</TabsTrigger>
          <TabsTrigger value="style">Estilo</TabsTrigger>
          <TabsTrigger value="references">Referências</TabsTrigger>
          <TabsTrigger value="sponsors">Patrocinadores</TabsTrigger>
          <TabsTrigger value="schedule">Programação</TabsTrigger>
          <TabsTrigger value="deliveries">Entregas</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <GeneralInfoTab eventId={effectiveEventId} />
        </TabsContent>

        <TabsContent value="style" className="mt-6">
          <Textarea placeholder="Descreva o estilo visual desejado para as produções..." className="min-h-[400px]" />
        </TabsContent>

        <TabsContent value="references" className="mt-6">
          <Textarea placeholder="Links e referências para o estilo visual..." className="min-h-[400px]" />
        </TabsContent>

        <TabsContent value="sponsors" className="mt-6 space-y-6">
          <p>Adicione patrocinadores e suas ações/ativações durante o evento:</p>

          <Button>+ Novo Patrocinador</Button>

          <Card className="border-border">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label>Patrocinador:</Label>
                  <Select defaultValue="patrocinadorA">
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Selecione um patrocinador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patrocinadorA">Patrocinador A</SelectItem>
                      <SelectItem value="patrocinadorB">Patrocinador B</SelectItem>
                      <SelectItem value="patrocinadorC">Patrocinador C</SelectItem>
                      <SelectItem value="novo">+ Novo patrocinador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" size="icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <Card className="bg-secondary/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-primary">Ação / Ativação</h3>
                      <Button variant="outline" size="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="action-name">Ação / Ativação:</Label>
                        <Input id="action-name" placeholder="Nome da ação/ativação" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="action-time">Horário de captação:</Label>
                        <div className="flex items-center gap-2">
                          <Input id="action-time" type="time" />
                          <div className="flex items-center gap-2">
                            <Checkbox id="free-time" />
                            <Label htmlFor="free-time">Horário Livre</Label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="responsible">Responsável pela captação:</Label>
                        <Select>
                          <SelectTrigger id="responsible">
                            <SelectValue placeholder="Selecionar responsável" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="joao">João Silva</SelectItem>
                            <SelectItem value="maria">Maria Souza</SelectItem>
                            <SelectItem value="carlos">Carlos Lima</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 h-10">
                          <Checkbox id="realtime" />
                          <Label htmlFor="realtime">Entrega Real Time?</Label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rt-time">Horário da entrega RT:</Label>
                        <Input id="rt-time" type="time" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editor">Editor responsável:</Label>
                        <Select>
                          <SelectTrigger id="editor">
                            <SelectValue placeholder="Selecionar editor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maria">Maria Souza</SelectItem>
                            <SelectItem value="pedro">Pedro Alves</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="instructions">Orientações:</Label>
                        <Textarea
                          id="instructions"
                          placeholder="Orientações específicas..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-primary">Ação / Ativação</h3>
                      <Button variant="outline" size="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="action-name-2">Ação / Ativação:</Label>
                        <Input id="action-name-2" placeholder="Nome da ação/ativação" defaultValue="Stand promocional" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="action-time-2">Horário de captação:</Label>
                        <div className="flex items-center gap-2">
                          <Input id="action-time-2" type="time" defaultValue="14:30" />
                          <div className="flex items-center gap-2">
                            <Checkbox id="free-time-2" />
                            <Label htmlFor="free-time-2">Horário Livre</Label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="responsible-2">Responsável pela captação:</Label>
                        <Select defaultValue="joao">
                          <SelectTrigger id="responsible-2">
                            <SelectValue placeholder="Selecionar responsável" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="joao">João Silva</SelectItem>
                            <SelectItem value="maria">Maria Souza</SelectItem>
                            <SelectItem value="carlos">Carlos Lima</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button variant="outline">+ Nova Ação</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6 space-y-6">
          <p>Adicione a programação completa do evento, organizada por palco:</p>

          <Button>+ Novo Palco</Button>

          <Card className="border-border">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label>Palco:</Label>
                  <Input className="w-[250px]" defaultValue="Palco Principal" />
                </div>

                <Button variant="outline" size="icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <Card className="bg-secondary/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Atração</h3>
                      <Button variant="outline" size="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="artist">Artista:</Label>
                        <Input id="artist" placeholder="Nome do artista/atração" defaultValue="Banda XYZ" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="showtime">Horário:</Label>
                        <Input id="showtime" type="time" defaultValue="20:30" />
                      </div>

                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="notes">Observações:</Label>
                        <Textarea id="notes" placeholder="Observações (opcional)..." className="min-h-[80px]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Atração</h3>
                      <Button variant="outline" size="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="artist-2">Artista:</Label>
                        <Input id="artist-2" placeholder="Nome do artista/atração" defaultValue="DJ ABC" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="showtime-2">Horário:</Label>
                        <Input id="showtime-2" type="time" defaultValue="22:00" />
                      </div>

                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="notes-2">Observações:</Label>
                        <Textarea
                          id="notes-2"
                          placeholder="Observações (opcional)..."
                          className="min-h-[80px]"
                          value="Preparar iluminação especial"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button variant="outline">+ Nova Atração</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliveries" className="mt-6 space-y-6">
          <div className="space-y-6">
            <div className="bg-background border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium text-primary">Entregas Real Time</h3>

              <div className="space-y-4">
                <Card className="bg-secondary/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Entrega Real Time</h3>
                      <Button variant="outline" size="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="delivery-title">Título/Descrição:</Label>
                        <Input
                          id="delivery-title"
                          placeholder="Título/descrição da entrega"
                          defaultValue="Stories - Abertura"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="delivery-time">Horário de entrega:</Label>
                        <Input id="delivery-time" type="time" defaultValue="12:30" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="delivery-editor">Editor responsável:</Label>
                        <Select defaultValue="maria">
                          <SelectTrigger id="delivery-editor">
                            <SelectValue placeholder="Selecionar editor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maria">Maria Souza</SelectItem>
                            <SelectItem value="pedro">Pedro Alves</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Plataforma de destino:</Label>
                        <div className="flex items-center gap-4 h-10">
                          <div className="flex items-center gap-2">
                            <Checkbox id="reels" />
                            <Label htmlFor="reels">Reels</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox id="stories" checked />
                            <Label htmlFor="stories">Stories</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox id="feed" />
                            <Label htmlFor="feed">Feed</Label>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="delivery-instructions">Orientações:</Label>
                        <Textarea
                          id="delivery-instructions"
                          placeholder="Orientações específicas..."
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Entrega Real Time</h3>
                      <Button variant="outline" size="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="delivery-title-2">Título/Descrição:</Label>
                        <Input
                          id="delivery-title-2"
                          placeholder="Título/descrição da entrega"
                          value="Reels - Patrocinador"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="delivery-time-2">Horário de entrega:</Label>
                        <Input id="delivery-time-2" type="time" defaultValue="15:00" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button>+ Nova Entrega Real Time</Button>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="teaser-time">Horário do teaser final:</Label>
                  <Input id="teaser-time" type="time" defaultValue="21:00" />
                </div>
              </div>
            </div>

            <div className="bg-background border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium text-cyan-500">Entregas Pós-Evento</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo de entrega:</Label>
                  <div className="flex items-center gap-2">
                    <Input id="deadline" type="number" min="1" max="30" defaultValue="7" className="w-20" />
                    <Select defaultValue="dias">
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="horas">horas</SelectItem>
                        <SelectItem value="dias">dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-md p-4 space-y-2">
                <Label>Opções de pacote:</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="aftermovie" checked />
                    <Label htmlFor="aftermovie">Aftermovie</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="highlights" checked />
                    <Label htmlFor="highlights">Vídeo de melhores momentos</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="sponsor-versions" />
                    <Label htmlFor="sponsor-versions">Versões individuais por patrocinador</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-notes">Anotações:</Label>
                <Textarea
                  id="post-notes"
                  placeholder="Anotações adicionais para entregas pós-evento..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
