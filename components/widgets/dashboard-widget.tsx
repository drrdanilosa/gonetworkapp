import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, FileText, Users, Video } from "lucide-react"

export default function DashboardWidget() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Eventos Ativos</CardTitle>
            <CardDescription>Eventos em andamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">3</div>
            <Button variant="link" className="p-0 h-auto">
              Ver todos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Edições Pendentes</CardTitle>
            <CardDescription>Aguardando aprovação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">5</div>
            <Button variant="link" className="p-0 h-auto">
              Ver todas
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Entregas Hoje</CardTitle>
            <CardDescription>Entregas programadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">2</div>
            <Button variant="link" className="p-0 h-auto">
              Ver detalhes
            </Button>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8">Atividades Recentes</h2>
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-primary/20 p-2 rounded-full">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Nova edição enviada</h3>
              <p className="text-sm text-muted-foreground">Festival de Música - Teaser Dia 1</p>
            </div>
            <div className="text-sm text-muted-foreground">Há 2 horas</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-success/20 p-2 rounded-full">
              <FileText className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Briefing atualizado</h3>
              <p className="text-sm text-muted-foreground">Lançamento de Produto - 25 Mai 2025</p>
            </div>
            <div className="text-sm text-muted-foreground">Há 5 horas</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-warning/20 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Novo evento criado</h3>
              <p className="text-sm text-muted-foreground">Conferência Tech - 01 Jun 2025</p>
            </div>
            <div className="text-sm text-muted-foreground">Há 1 dia</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-muted/20 p-2 rounded-full">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Membro adicionado à equipe</h3>
              <p className="text-sm text-muted-foreground">Carlos Lima - Drone</p>
            </div>
            <div className="text-sm text-muted-foreground">Há 2 dias</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8">Próximos Prazos</h2>
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-destructive/20 p-2 rounded-full">
              <Clock className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Entrega de Teaser</h3>
              <p className="text-sm text-muted-foreground">Festival de Música</p>
            </div>
            <div className="text-sm font-medium text-destructive">Hoje, 18:00</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-warning/20 p-2 rounded-full">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Aprovação de Material</h3>
              <p className="text-sm text-muted-foreground">Lançamento de Produto</p>
            </div>
            <div className="text-sm font-medium text-warning">Amanhã, 10:00</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
