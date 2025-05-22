// features/projects/components/VideoImport.tsx
'use client'

"use client"

import React, { useState } from 'react'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { Button } from '@/components/ui/button'

export function VideoImport({
  projectId,
  deliverableId,
}: {
  projectId: string
  deliverableId: string
}) {
  const { addVideoVersion } = useProjectsStore()
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(false)

  const handleImport = async () => {
    setImporting(true)
    try {
      const res = await fetch(`/api/exports/${projectId}`)
      if (!res.ok) throw new Error('Falha ao buscar vídeos')

      const data = await res.json()

      if (data.videos && data.videos.length > 0) {
        const videoPromises = data.videos.map(
          async (vid: { url: string; name: string }) => {
            const response = await fetch(vid.url)
            const blob = await response.blob()
            const file = new File([blob], vid.name, { type: 'video/mp4' })
            addVideoVersion(projectId, deliverableId, file)
          }
        )

        await Promise.all(videoPromises)
        setImported(true)
      } else {
        alert('Nenhum vídeo encontrado para importação')
      }
    } catch (err) {
      console.error('Erro de importação:', err)
      alert('Falha ao importar vídeos')
    } finally {
      setImporting(false)
    }
  }

  if (imported) {
    return (
      <p className="text-sm text-green-600">Vídeos importados com sucesso.</p>
    )
  }

  return (
    <Button
      onClick={handleImport}
      disabled={importing}
      variant="outline"
      className="mt-2"
      aria-busy={importing}
    >
      {importing ? 'Importando...' : 'Importar Vídeos Existentes'}
    </Button>
  )
}
