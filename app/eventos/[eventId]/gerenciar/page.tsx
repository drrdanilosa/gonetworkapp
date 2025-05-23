'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import EventTabsManager from '@/components/EventTabsManager'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function GerenciarEventoPage() {
  const params = useParams()
  const eventId = params?.eventId as string
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // Simulação de carregamento (remover em produção)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (!eventId) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6 bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>ID do evento não especificado.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar à página inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6">
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6 bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Erro ao carregar evento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar à página inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Gerenciar Evento</h1>
          <p className="text-muted-foreground">ID: {eventId}</p>
        </div>
      </div>
      
      <EventTabsManager eventId={eventId} />
    </div>
  )
}
