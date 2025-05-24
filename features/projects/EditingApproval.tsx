// features/projects/EditingApproval.tsx
'use client'

import React from 'react'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { Button } from '@/components/ui/button'
import { VideoImport } from './components/VideoImport'

export function EditingApprovalTab() {
  const {
    currentProject,
    addVideoVersion,
    setActiveVideoVersion,
    approveVideoVersion,
  } = useProjectsStore()

  // Definindo handleFileChange fora do condicional
  const deliverable = currentProject?.videos?.[0]

  const handleFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || !currentProject || !deliverable) return
      Array.from(files).forEach(file => {
        addVideoVersion(currentProject.id, deliverable.id, file)
      })
      e.target.value = '' // Reset the input
    },
    [addVideoVersion, currentProject, deliverable]
  )

  // Verificação antes do retorno
  if (
    !currentProject ||
    !currentProject.videos ||
    currentProject.videos.length === 0 ||
    !deliverable
  ) {
    return (
      <div className="p-4">
        Por favor, selecione ou crie um projeto com vídeos.
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Edição/Aprovação</h2>
      {/* File input for manual import */}
      <div className="mt-4">
        <label
          className="block text-sm font-medium text-gray-700"
          htmlFor="video-upload"
        >
          Importar arquivos de vídeo (.mp4):
        </label>
        <input
          id="video-upload"
          type="file"
          accept="video/mp4"
          multiple
          onChange={handleFileChange}
          className="mt-1"
          aria-label="Importar arquivos de vídeo em formato MP4"
        />
        <div className="mt-2">
          <VideoImport
            projectId={currentProject.id}
            deliverableId={deliverable.id}
          />
        </div>
      </div>

      {/* List of video versions */}
      <div className="mt-6">
        <h3 className="text-lg font-medium">
          Versões do vídeo para &quot;{deliverable.title}&quot;
        </h3>
        {deliverable.versions.length === 0 && (
          <p className="mt-2 text-gray-500">Nenhum vídeo carregado ainda.</p>
        )}
        <div className="mt-4 space-y-4">
          {deliverable.versions.map(version => (
            <div key={version.id} className="rounded-lg border p-4">
              <p className="font-semibold">{version.name}</p>
              <p className="text-sm text-gray-500">
                Carregado em: {new Date(version.uploadedAt).toLocaleString()}
              </p>
              {/* Video player */}
              <video
                src={version.url}
                controls
                className="mt-2 w-full max-w-md"
              />
              <div className="mt-2 flex items-center space-x-2">
                <Button
                  variant={version.active ? 'outline' : 'secondary'}
                  onClick={() =>
                    setActiveVideoVersion(
                      currentProject.id,
                      deliverable.id,
                      version.id
                    )
                  }
                >
                  {version.active ? 'Versão Ativa' : 'Tornar Ativa'}
                </Button>
                <Button
                  variant={version.approved ? 'outline' : 'default'}
                  onClick={() =>
                    approveVideoVersion(
                      currentProject.id,
                      deliverable.id,
                      version.id,
                      'Editor'
                    )
                  }
                  disabled={version.approved}
                >
                  {version.approved ? 'Aprovado' : 'Aprovar Versão'}
                </Button>
              </div>
              {version.approved && (
                <div className="mt-2 text-sm text-green-600">
                  Aprovado por {version.approvedBy} em{' '}
                  {new Date(version.approvedAt!).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
