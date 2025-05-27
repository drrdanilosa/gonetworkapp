'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AutorizacaoUsoImagem } from '@/components/captacao/AutorizacaoUsoImagem'
import { ReuniaoOnline } from '@/components/captacao/ReuniaoOnline'
import { useCaptacaoStore } from '@/store/useCaptacaoStore'
import { useProjectsStore } from '@/store/useProjectsStore'
import {
  FileImage,
  Video,
  Users,
  Calendar,
  FileText,
  Megaphone,
  Clipboard,
  Settings,
} from 'lucide-react'

interface CaptacaoWidgetProps {
  eventId?: string
}

export default function CaptacaoWidget({ eventId }: CaptacaoWidgetProps) {
  const [activeTab, setActiveTab] = useState('autorizacao')
  const { currentProject } = useProjectsStore()
  const { getAutorizacoesByEvent, getReunioesByEvent } = useCaptacaoStore()

  // Se não há projeto selecionado, usar o eventId passado ou o projeto atual
  const projectId = eventId || currentProject?.id || ''

  // Contadores para badges
  const autorizacoes = getAutorizacoesByEvent(projectId)
  const reunioes = getReunioesByEvent(projectId)

  // Sugestões de outras funcionalidades para implementar futuramente
  const futureFeatures = [
    {
      id: 'contratos',
      title: 'Contratos Digitais',
      description: 'Geração e assinatura de contratos para eventos',
      icon: <FileText className="size-6" />,
      status: 'Em planejamento',
    },
    {
      id: 'questionarios',
      title: 'Questionários Pré-Evento',
      description: 'Formulários customizados para briefing detalhado',
      icon: <Clipboard className="size-6" />,
      status: 'Em planejamento',
    },
    {
      id: 'marketing',
      title: 'Material de Divulgação',
      description: 'Templates e ferramentas para divulgação do evento',
      icon: <Megaphone className="size-6" />,
      status: 'Em planejamento',
    },
    {
      id: 'checklists',
      title: 'Checklists Técnicos',
      description: 'Listas de verificação para equipamentos e setup',
      icon: <Settings className="size-6" />,
      status: 'Em planejamento',
    },
  ]

  if (!projectId) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Calendar className="mx-auto mb-4 size-12 opacity-50" />
            <p>Selecione um evento para acessar as ferramentas de captação.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Ferramentas de Captação</h2>
        <p className="text-muted-foreground">
          Funcionalidades auxiliares para captação e gerenciamento de eventos
        </p>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="autorizacao" className="flex items-center gap-2">
            <FileImage className="size-4" />
            <span>Autorização de Imagem</span>
            {autorizacoes.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {autorizacoes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reunioes" className="flex items-center gap-2">
            <Video className="size-4" />
            <span>Reuniões Online</span>
            {reunioes.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {reunioes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="futuras" className="flex items-center gap-2">
            <Settings className="size-4" />
            <span>Futuras Funcionalidades</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="autorizacao" className="mt-6">
          <AutorizacaoUsoImagem eventId={projectId} />
        </TabsContent>

        <TabsContent value="reunioes" className="mt-6">
          <ReuniaoOnline eventId={projectId} />
        </TabsContent>

        <TabsContent value="futuras" className="mt-6">
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                Próximas Funcionalidades
              </h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Estas funcionalidades estão sendo planejadas para futuras
                versões da aba Captação:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {futureFeatures.map(feature => (
                <Card key={feature.id} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="text-blue-500">{feature.icon}</div>
                      <div>
                        <h4 className="text-base">{feature.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {feature.status}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="text-blue-500">
                    <Users className="size-8" />
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-blue-900">
                      Sua opinião é importante!
                    </h4>
                    <p className="mb-4 text-sm text-blue-800">
                      Você tem sugestões de outras funcionalidades que seriam
                      úteis na aba de Captação? Sua experiência prática é
                      fundamental para priorizarmos o desenvolvimento.
                    </p>
                    <div className="space-y-2 text-sm text-blue-700">
                      <p>
                        <strong>Ideias que estamos considerando:</strong>
                      </p>
                      <ul className="ml-4 list-inside list-disc space-y-1">
                        <li>Sistema de orçamentos automáticos</li>
                        <li>Integração com CRM de clientes</li>
                        <li>Gerador de propostas comerciais</li>
                        <li>Timeline de follow-up pós-evento</li>
                        <li>Análise de ROI e métricas</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
