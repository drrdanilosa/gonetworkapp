import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Mail, Phone, Camera, Edit3, DrillIcon as Drone, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function TeamWidget() {
  const team = [
    {
      id: 1,
      name: "João Silva",
      role: "Cinegrafista",
      email: "joao@gonetwork.ai",
      phone: "(11) 98765-4321",
      avatar: "/placeholder.svg?key=rrhki",
      events: 8,
      icon: <Camera className="h-4 w-4" />,
    },
    {
      id: 2,
      name: "Maria Souza",
      role: "Editora",
      email: "maria@gonetwork.ai",
      phone: "(11) 91234-5678",
      avatar: "/placeholder.svg?key=r3e0i",
      events: 12,
      icon: <Edit3 className="h-4 w-4" />,
    },
    {
      id: 3,
      name: "Carlos Lima",
      role: "Drone",
      email: "carlos@gonetwork.ai",
      phone: "(11) 99876-5432",
      avatar: "/placeholder.svg?key=bmikw",
      events: 6,
      icon: <Drone className="h-4 w-4" />,
    },
    {
      id: 4,
      name: "Ana Costa",
      role: "Coordenadora",
      email: "ana@gonetwork.ai",
      phone: "(11) 95678-1234",
      avatar: "/placeholder.svg?key=cevbo",
      events: 15,
      icon: <Users className="h-4 w-4" />,
    },
  ]

  const clients = [
    {
      id: 1,
      name: "Empresa XYZ",
      contact: "Roberto Almeida",
      email: "roberto@xyz.com",
      phone: "(11) 3456-7890",
      avatar: "/placeholder.svg?key=mu66s",
      events: 3,
    },
    {
      id: 2,
      name: "Tech Solutions",
      contact: "Carla Mendes",
      email: "carla@techsolutions.com",
      phone: "(11) 2345-6789",
      avatar: "/placeholder.svg?key=zpgwo",
      events: 2,
    },
    {
      id: 3,
      name: "Associação de Tecnologia",
      contact: "Paulo Ferreira",
      email: "paulo@assoctec.org",
      phone: "(11) 3456-7891",
      avatar: "/placeholder.svg?key=v506w",
      events: 1,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Equipe</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Membro
        </Button>
      </div>

      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger value="team">Equipe</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-4 mt-6 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." className="pl-8" />
          </div>

          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as funções</SelectItem>
              <SelectItem value="camera">Cinegrafista</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="drone">Drone</SelectItem>
              <SelectItem value="coord">Coordenação</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="team" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{member.name}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            {member.icon}
                            <span className="ml-1">{member.role}</span>
                          </div>
                        </div>
                        <Badge variant="outline">{member.events} eventos</Badge>
                      </div>

                      <div className="mt-4 space-y-1 text-sm">
                        <div className="flex items-center">
                          <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                          <span>{member.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                          <span>{member.phone}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          Detalhes
                        </Button>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed flex flex-col items-center justify-center p-6 h-full">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <Button variant="outline">Adicionar Membro</Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <Card key={client.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={client.avatar || "/placeholder.svg"} alt={client.name} />
                      <AvatarFallback>
                        {client.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{client.name}</h3>
                          <div className="text-sm text-muted-foreground">Contato: {client.contact}</div>
                        </div>
                        <Badge variant="outline">{client.events} eventos</Badge>
                      </div>

                      <div className="mt-4 space-y-1 text-sm">
                        <div className="flex items-center">
                          <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                          <span>{client.phone}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          Detalhes
                        </Button>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed flex flex-col items-center justify-center p-6 h-full">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <Button variant="outline">Adicionar Cliente</Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
