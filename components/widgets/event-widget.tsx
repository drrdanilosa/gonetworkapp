import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Plus, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useUIStore } from "@/store/useUIStore"

export default function EventWidget() {
  // Usar o setCurrentPage do store
  const setCurrentPage = useUIStore((state) => state.setCurrentPage);
  
  const events = [
    {
      id: 1,
      name: "Festival de Música",
      date: "18-20 Mai 2025",
      location: "Parque da Cidade",
      client: "Empresa XYZ",
      status: "Em andamento",
      team: 8,
      deliveries: 12,
      completed: 5,
    },
    {
      id: 2,
      name: "Lançamento de Produto",
      date: "25 Mai 2025",
      location: "Hotel Central",
      client: "Tech Solutions",
      status: "Planejamento",
      team: 5,
      deliveries: 8,
      completed: 0,
    },
    {
      id: 3,
      name: "Conferência Tech",
      date: "01 Jun 2025",
      location: "Centro de Convenções",
      client: "Associação de Tecnologia",
      status: "Planejamento",
      team: 6,
      deliveries: 10,
      completed: 0,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Eventos</h1>
        <div className="space-x-2">
          <Button asChild variant="outline">
            <a href="/events">
              Ver Todos
            </a>
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <div className="h-3 bg-primary w-full"></div>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-start">
                <span>{event.name}</span>
                <Badge variant={event.status === "Em andamento" ? "default" : "secondary"}>{event.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Cliente: {event.client}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                <div className="text-center">
                  <div className="text-xl font-bold">{event.team}</div>
                  <div className="text-xs text-muted-foreground">Equipe</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{event.deliveries}</div>
                  <div className="text-xs text-muted-foreground">Entregas</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{event.completed}</div>
                  <div className="text-xs text-muted-foreground">Concluídas</div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/events/${event.id}`}>
                    Detalhes
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Usar diretamente o setCurrentPage do useUIStore
                    setCurrentPage(3); // 3 é o índice da aba Briefing
                  }}
                >
                  Briefing
                </Button>
                <Button variant="outline" size="sm">
                  Timeline
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed flex flex-col items-center justify-center p-6 h-full">
          <Plus className="h-12 w-12 text-muted-foreground mb-4" />
          <Button variant="outline">Adicionar Evento</Button>
        </Card>
      </div>
    </div>
  )
}
