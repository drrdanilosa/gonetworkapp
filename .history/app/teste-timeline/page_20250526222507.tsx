// Arquivo de teste para validar o fluxo completo de geração de timeline
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import GenerateTimelineButton from '@/features/briefing/components/GenerateTimelineButtonNew'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { toast } from '@/components/ui/use-toast'

export default function TestTimelineGeneration() {
  // Estados
  const [eventId, setEventId] = useState('')
  const [lastGeneratedTimeline, setLastGeneratedTimeline] = useState(null)
  const [testFormData, setTestFormData] = useState({
    eventName: 'Evento de Teste',
    eventDate: new Date().toISOString().split('T')[0],
    deliverables: [
      {
        id: '1',
        name: 'Entrega 1',
        type: 'video',
      },
      {
        id: '2',
        name: 'Entrega 2',
        type: 'video',
      },
    ],
  })

  // Acessar o store de projetos
  const { projects, addProject, updateProject } = useProjectsStore()

  // Criar um projeto de teste se não existir
  const createTestProject = () => {
    const testProjectId = 'test-project-' + Date.now()

    addProject({
      id: testProjectId,
      name: 'Projeto de Teste',
      description: 'Projeto criado para testar a geração de timeline',
      client: 'Cliente Teste',
      startDate: new Date().toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      videos: [
        {
          id: '1',
          name: 'Vídeo 1',
          type: 'aftermovie',
        },
        {
          id: '2',
          name: 'Vídeo 2',
          type: 'highlights',
        },
      ],
    })

    setEventId(testProjectId)
    toast({
      title: 'Projeto de teste criado',
      description: `ID do projeto: ${testProjectId}`,
    })
  }

  // Observar mudanças nos projetos
  useEffect(() => {
    if (eventId) {
      const currentProject = projects.find(p => p.id === eventId)
      if (currentProject?.timeline) {
        setLastGeneratedTimeline(currentProject.timeline)
      }
    }
  }, [projects, eventId])

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Teste de Geração de Timeline</h1>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">
          1. Criar Projeto de Teste
        </h2>
        <Button onClick={createTestProject} variant="outline">
          Criar Projeto de Teste
        </Button>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">
          2. Modificar Dados do Formulário
        </h2>
        <div className="mb-4 space-y-4">
          <div>
            <label className="mb-2 block">Nome do Evento:</label>
            <input
              type="text"
              value={testFormData.eventName}
              onChange={e =>
                setTestFormData({ ...testFormData, eventName: e.target.value })
              }
              className="w-full rounded border p-2"
            />
          </div>
          <div>
            <label className="mb-2 block">Data do Evento:</label>
            <input
              type="date"
              value={testFormData.eventDate}
              onChange={e =>
                setTestFormData({ ...testFormData, eventDate: e.target.value })
              }
              className="w-full rounded border p-2"
            />
          </div>
          <div>
            <label className="mb-2 block">Número de Vídeos:</label>
            <input
              type="number"
              value={testFormData.deliverables.length}
              onChange={e => {
                const numVideos = parseInt(e.target.value) || 0
                const newDeliverables = Array(numVideos)
                  .fill(0)
                  .map((_, i) => ({
                    id: `${i + 1}`,
                    name: `Entrega ${i + 1}`,
                    type: 'video',
                  }))
                setTestFormData({
                  ...testFormData,
                  deliverables: newDeliverables,
                })
              }}
              className="w-full rounded border p-2"
            />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">3. Gerar Timeline</h2>
        <div className="mb-4">
          ID do evento atual: <strong>{eventId || 'Nenhum'}</strong>
        </div>{' '}
        <GenerateTimelineButton
          eventId={eventId}
          formData={testFormData}
          disabled={!eventId}
        />
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">
          4. Última Timeline Gerada
        </h2>
        {lastGeneratedTimeline ? (
          <div className="rounded border p-4">
            <h3 className="mb-2 font-medium">
              Fases ({lastGeneratedTimeline.length}):
            </h3>
            <ul className="space-y-2">
              {lastGeneratedTimeline.map(phase => (
                <li key={phase.id} className="rounded bg-secondary/20 p-2">
                  <strong>{phase.name}</strong>
                  <div>
                    Início: {new Date(phase.startDate).toLocaleDateString()}
                  </div>
                  <div>Fim: {new Date(phase.endDate).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded border border-dashed p-4 text-center text-muted-foreground">
            Nenhuma timeline gerada ainda
          </div>
        )}
      </div>
    </div>
  )
}
