'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import GeneralInfoTab from '@/features/briefing/components/GeneralInfoTab'
import TimelineTab from '@/features/briefing/components/TimelineTab'

export default function BriefingPage() {
  const params = useParams()
  const eventId = Array.isArray(params.eventId)
    ? params.eventId[0]
    : (params.eventId as string)
  const [activeTab, setActiveTab] = useState('general-info')

  return (
    <div className="min-h-screen w-full bg-[#282A36] p-4 text-[#F8F8F2] md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#8BE9FD]">
          Briefing do Evento
        </h1>
        <p className="text-lg text-[#6272A4]">
          Gerencie todas as informações essenciais do evento
        </p>
      </div>{' '}
      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto border-b border-[#44475A] bg-[#21222C]">
          <TabsTrigger
            value="general-info"
            className="data-[state=active]:bg-[#44475A] data-[state=active]:text-[#F8F8F2]"
          >
            Informações Gerais
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="data-[state=active]:bg-[#44475A] data-[state=active]:text-[#F8F8F2]"
          >
            Timeline
          </TabsTrigger>
          <TabsTrigger
            value="technical"
            className="data-[state=active]:bg-[#44475A] data-[state=active]:text-[#F8F8F2]"
          >
            Requisitos Técnicos
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="data-[state=active]:bg-[#44475A] data-[state=active]:text-[#F8F8F2]"
          >
            Cronograma
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="data-[state=active]:bg-[#44475A] data-[state=active]:text-[#F8F8F2]"
          >
            Recursos
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="data-[state=active]:bg-[#44475A] data-[state=active]:text-[#F8F8F2]"
          >
            Equipe
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {' '}
          <TabsContent value="general-info">
            <GeneralInfoTab eventId={eventId} />
          </TabsContent>
          <TabsContent value="timeline">
            <TimelineTab eventId={eventId} />
          </TabsContent>
          <TabsContent value="technical">
            <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
              <h2 className="mb-6 text-2xl font-bold text-[#BD93F9]">
                Requisitos Técnicos
              </h2>
              <p className="text-[#F8F8F2]">
                Funcionalidade em desenvolvimento...
              </p>
            </div>
          </TabsContent>
          <TabsContent value="schedule">
            <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
              <h2 className="mb-6 text-2xl font-bold text-[#BD93F9]">
                Cronograma
              </h2>
              <p className="text-[#F8F8F2]">
                Funcionalidade em desenvolvimento...
              </p>
            </div>
          </TabsContent>
          <TabsContent value="resources">
            <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
              <h2 className="mb-6 text-2xl font-bold text-[#BD93F9]">
                Recursos
              </h2>
              <p className="text-[#F8F8F2]">
                Funcionalidade em desenvolvimento...
              </p>
            </div>
          </TabsContent>
          <TabsContent value="team">
            <div className="rounded-xl bg-[#282A36] p-6 text-[#F8F8F2]">
              <h2 className="mb-6 text-2xl font-bold text-[#BD93F9]">Equipe</h2>
              <p className="text-[#F8F8F2]">
                Funcionalidade em desenvolvimento...
              </p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
