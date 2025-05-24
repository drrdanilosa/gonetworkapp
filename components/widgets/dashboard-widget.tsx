"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, FileText, Users, Video } from 'lucide-react'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { useUIStore } from '@/store/useUIStore'
import { format, formatDistance } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function DashboardWidget() {
  // Obter dados dinâmicos das stores
  const { projects } = useProjectsStore()
  
  // Calcular métricas com base nos dados reais
  const activeProjects = projects.filter(p => p.status !== 'completed' && p.status !== 'archived').length
  const pendingDeliverables = projects.flatMap(p => p.videos?.filter(v => v.status !== 'approved') || []).length
  const teamMembers = projects.flatMap(p => p.teamMembers || [])
  const uniqueTeamMembers = teamMembers.length > 0 ? [...new Set(teamMembers.map(m => m.id))].length : 0
  
  // Gerar atividades recentes com base nos projetos reais da store
  const recentActivities = projects
    .flatMap(project => {
      const activities = []
      
      // Verificar vídeos recentes
      if (project.videos && project.videos.length > 0) {
        project.videos.forEach(video => {
          if (video.lastUpdated) {
            activities.push({
              type: 'video',
              title: 'Nova edição enviada',
              project: project.name,
              description: video.title,
              date: new Date(video.lastUpdated),
              icon: <Video className="h-5 w-5 text-primary" />,
              bgColor: 'bg-primary/20'
            })
          }
        })
      }
      
      // Verificar atualizações de briefing
      if (project.briefing?.createdAt) {
        activities.push({
          type: 'briefing',
          title: 'Briefing atualizado',
          project: project.name,
          description: 'Detalhes do evento atualizados',
          date: new Date(project.briefing.createdAt),
          icon: <FileText className="h-5 w-5 text-success" />,
          bgColor: 'bg-success/20'
        })
      }
      
      // Evento criado
      activities.push({
        type: 'created',
        title: 'Novo evento criado',
        project: project.name,
        description: project.startDate ? `Data: ${format(new Date(project.startDate), 'dd MMM yyyy', { locale: ptBR })}` : 'Data não definida',
        date: new Date(project.createdAt),
        icon: <Calendar className="h-5 w-5 text-warning" />,
        bgColor: 'bg-warning/20'
      })
      
      // Membros da equipe
      if (project.teamMembers && project.teamMembers.length > 0) {
        const latestMember = project.teamMembers.sort((a, b) => {
          if (!a.addedAt || !b.addedAt) return 0
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        })[0]
        
        if (latestMember) {
          activities.push({
            type: 'team',
            title: 'Membro adicionado à equipe',
            project: project.name,
            description: `${latestMember.name} - ${latestMember.role || 'Membro da equipe'}`,
            date: latestMember.addedAt ? new Date(latestMember.addedAt) : new Date(project.updatedAt),
            icon: <Users className="h-5 w-5 text-muted-foreground" />,
            bgColor: 'bg-muted/20'
          })
        }
      }
      
      return activities
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 4) // Limitar a 4 atividades recentes
  
  // Encontrar próximos prazos
  const upcomingDeadlines = projects
    .flatMap(project => {
      return (project.videos || [])
        .filter(video => video.dueDate && new Date(video.dueDate) > new Date())
        .map(video => ({
          title: `Entrega de ${video.title}`,
          project: project.name,
          date: new Date(video.dueDate),
          urgent: new Date(video.dueDate).getTime() - Date.now() < 24 * 60 * 60 * 1000
        }))
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 2) // Limitar a 2 prazos

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
            <div className="text-3xl font-bold text-primary">{activeProjects}</div>
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
            <div className="text-3xl font-bold text-warning">{pendingDeliverables}</div>
            <Button variant="link" className="p-0 h-auto">
              Ver todas
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Membros da Equipe</CardTitle>
            <CardDescription>Em todos os projetos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{uniqueTeamMembers}</div>
            <Button variant="link" className="p-0 h-auto">
              Ver detalhes
            </Button>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8">Atividades Recentes</h2>
      <div className="space-y-4">
        {recentActivities.length > 0 ? (
          recentActivities.map((activity, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`${activity.bgColor} p-2 rounded-full`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{activity.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {activity.project} - {activity.description}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDistance(activity.date, new Date(), { addSuffix: true, locale: ptBR })}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              Nenhuma atividade recente encontrada.
            </CardContent>
          </Card>
        )}
      </div>

      <h2 className="text-xl font-bold mt-8">Próximos Prazos</h2>
      <div className="space-y-4">
        {upcomingDeadlines.length > 0 ? (
          upcomingDeadlines.map((deadline, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`${deadline.urgent ? 'bg-destructive/20' : 'bg-warning/20'} p-2 rounded-full`}>
                  <Clock className={`h-5 w-5 ${deadline.urgent ? 'text-destructive' : 'text-warning'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{deadline.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {deadline.project}
                  </p>
                </div>
                <div className={`text-sm font-medium ${deadline.urgent ? 'text-destructive' : 'text-warning'}`}>
                  {format(deadline.date, "dd MMM, HH:mm", { locale: ptBR })}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              Nenhum prazo próximo encontrado.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
