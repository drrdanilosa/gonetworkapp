'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CaptacaoStats } from '@/components/captacao/CaptacaoStats'
import {
  Calendar,
  Users,
  Video,
  FileText,
  Megaphone,
  TrendingUp,
} from 'lucide-react'

export default function DashboardWidget() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral de todos os seus projetos e atividades
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="captacao">Captação</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Cards de estatísticas gerais */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Eventos Ativos
                </CardTitle>
                <Calendar className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  +1 desde o último mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Vídeos Produzidos
                </CardTitle>
                <Video className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+4 esta semana</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Equipe Ativa
                </CardTitle>
                <Users className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  5 editores, 3 coordenadores
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Aprovação
                </CardTitle>
                <TrendingUp className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94%</div>
                <p className="text-xs text-muted-foreground">
                  +2% desde o último mês
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Seção de atividades recentes */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex size-2 rounded-full bg-blue-500"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Novo vídeo aprovado - Evento Corporativo XYZ
                      </p>
                      <p className="text-sm text-muted-foreground">
                        há 2 horas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex size-2 rounded-full bg-green-500"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Reunião de briefing finalizada
                      </p>
                      <p className="text-sm text-muted-foreground">
                        há 4 horas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex size-2 rounded-full bg-orange-500"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Autorização de uso de imagem coletada
                      </p>
                      <p className="text-sm text-muted-foreground">
                        há 6 horas
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Calendar className="size-4 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Workshop de Marketing Digital
                      </p>
                      <p className="text-sm text-muted-foreground">
                        15/06/2024
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Calendar className="size-4 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Conferência Anual
                      </p>
                      <p className="text-sm text-muted-foreground">
                        20/06/2024
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="captacao" className="space-y-4">
          <div className="mb-4 flex items-center gap-2">
            <Megaphone className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">Ferramentas de Captação</h3>
          </div>

          {/* Estatísticas da Captação */}
          <CaptacaoStats />

          {/* Cards informativos sobre as funcionalidades */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-5" />
                  Autorização de Uso de Imagem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Digitalize o processo de autorização de uso de imagem com
                  assinatura digital e armazenamento seguro.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-xs text-muted-foreground">
                    ✓ Upload de documentos base
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    ✓ Assinatura digital touch
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    ✓ Geração automática de PDF
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="size-5" />
                  Reuniões Online
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Integre e gerencie reuniões de múltiplas plataformas com
                  compartilhamento de arquivos.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-xs text-muted-foreground">
                    ✓ Suporte a Meet, Zoom, Teams
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    ✓ Extração automática de dados
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    ✓ Compartilhamento de arquivos
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Detalhado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Análises detalhadas estarão disponíveis em futuras versões.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
