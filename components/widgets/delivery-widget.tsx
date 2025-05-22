import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Clock, Download, FileText, Plus, Upload, Video } from "lucide-react"

export default function DeliveryWidget() {
  const pendingDeliveries = [
    {
      id: 1,
      title: "Teaser - Festival de Música",
      event: "Festival de Música",
      deadline: "Hoje, 18:00",
      status: "Pendente",
      editor: "Maria Souza",
      type: "Teaser",
      urgent: true,
    },
    {
      id: 2,
      title: "Stories - Patrocinador A",
      event: "Festival de Música",
      deadline: "Amanhã, 10:00",
      status: "Em edição",
      editor: "Pedro Alves",
      type: "Stories",
      urgent: false,
    },
    {
      id: 3,
      title: "Reels - Abertura",
      event: "Festival de Música",
      deadline: "20/05/2025, 14:00",
      status: "Em edição",
      editor: "Maria Souza",
      type: "Reels",
      urgent: false,
    },
  ]

  const completedDeliveries = [
    {
      id: 4,
      title: "Stories - Abertura",
      event: "Festival de Música",
      completedDate: "19/05/2025, 12:30",
      editor: "Maria Souza",
      type: "Stories",
    },
    {
      id: 5,
      title: "Reels - Patrocinador B",
      event: "Festival de Música",
      completedDate: "19/05/2025, 15:00",
      editor: "Pedro Alves",
      type: "Reels",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Entregas</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>Evento:</Label>
            <Select defaultValue="festival">
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecione um evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="festival">Festival de Música - 18-20 Mai 2025</SelectItem>
                <SelectItem value="lancamento">Lançamento de Produto - 25 Mai 2025</SelectItem>
                <SelectItem value="conferencia">Conferência Tech - 01 Jun 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Entrega
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingDeliveries.map((delivery) => (
              <Card key={delivery.id} className={delivery.urgent ? "border-destructive" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-start">
                    <span>{delivery.title}</span>
                    {delivery.urgent && <Badge variant="destructive">Urgente</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Evento: {delivery.event}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Prazo: {delivery.deadline}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Video className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Editor: {delivery.editor}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        delivery.status === "Pendente"
                          ? "outline"
                          : delivery.status === "Em edição"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {delivery.status}
                    </Badge>
                    <Badge variant="outline">{delivery.type}</Badge>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm">
                      Detalhes
                    </Button>
                    <Button size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Entregar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedDeliveries.map((delivery) => (
              <Card key={delivery.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-start">
                    <span>{delivery.title}</span>
                    <Badge variant="success">Concluída</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Evento: {delivery.event}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Entregue em: {delivery.completedDate}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Video className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Editor: {delivery.editor}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{delivery.type}</Badge>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm">
                      Detalhes
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
