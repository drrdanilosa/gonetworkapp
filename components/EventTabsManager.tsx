'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BriefingTab from '@/components/BriefingTab'
import EquipeTab from '@/components/EquipeTab'
import EntregasTab from '@/components/EntregasTab'
import { Card } from '@/components/ui/card'
import { UsersRound, FileText, ClipboardList } from 'lucide-react'

interface EventTabsManagerProps {
  eventId: string
}

export default function EventTabsManager({ eventId }: EventTabsManagerProps) {
  const [activeTab, setActiveTab] = useState('briefing')

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <Tabs defaultValue="briefing" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="briefing" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Briefing</span>
            </TabsTrigger>
            <TabsTrigger value="equipe" className="flex items-center gap-2">
              <UsersRound className="h-4 w-4" />
              <span>Equipe</span>
            </TabsTrigger>
            <TabsTrigger value="entregas" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span>Entregas</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="briefing">
            <BriefingTab eventId={eventId} />
          </TabsContent>
          
          <TabsContent value="equipe">
            <EquipeTab eventId={eventId} />
          </TabsContent>
          
          <TabsContent value="entregas">
            <EntregasTab eventId={eventId} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
