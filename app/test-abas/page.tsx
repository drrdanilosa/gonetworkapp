'use client'

import React from 'react'
import EventTabsManager from '@/components/EventTabsManager'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TestPage() {
  // ID de teste para facilitar os experimentos
  const testEventId = 'test-123'
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/">
            <Button variant="outline" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar à Página Inicial
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Página de Teste de Abas</h1>
          <p className="text-muted-foreground">ID do evento: {testEventId}</p>
        </div>
      </div>
      
      <EventTabsManager eventId={testEventId} />
    </div>
  )
}
