'use client'

'use client'

"use client"

import { useState, useRef } from 'react'
import { useProjectsStore } from '@/store/useProjectsStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  CheckCircle,
  Upload,
  Play,
  CheckCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileBadge,
  FileVideo2,
  ThumbsDown,
  Calendar,
  Activity,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// Agora usando as funções nativas do useProjectsStore diretamente
// Essas funções já estão implementadas no useProjectsStore.ts

interface VideoListProps {
  projectId: string
  deliverableId: string
  onSelectVersion?: (version: VideoVersion) => void
}

export default function VideoVersionList({
  projectId,
  deliverableId,
  onSelectVersion,
}: VideoListProps) {
  const project = useProjectsStore((s: any) => s.currentProject)
  const addVideoVersion = useProjectsStore((s: any) => s.addVideoVersion)
  const setActiveVideoVersion = useProjectsStore(
    (s: any) => s.setActiveVideoVersion
  )
  const approveVideoVersion = useProjectsStore(
    (s: any) => s.approveVideoVersion
  )
  const rejectVideoVersion = useProjectsStore((s: any) => s.rejectVideoVersion)
  const user = useAuthStore(s => s.user)
  const addNotification = useUIStore(s => s.addNotification)

  const [approvalNote, setApprovalNote] = useState<string>('')
  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isClient = user?.role === 'client'
  const isEditor = user?.role === 'editor'

  if (!project) {
    return <div className="text-muted-foreground">Carregando projeto...</div>
  }

  const deliverable = project.videos.find((v: any) => v.id === deliverableId)
  if (!deliverable) {
    return <div className="text-muted-foreground">Vídeo não encontrado</div>
  }

  const versions = deliverable.versions || []

  // Ordenar: mais recentes primeiro
  const sortedVersions = [...versions].sort((a, b) => {
    const dateA = new Date(a.uploadedAt)
    const dateB = new Date(b.uploadedAt)
    return dateB.getTime() - dateA.getTime()
  })

  // Versão ativa atual (se existir)
  const activeVersion = versions.find((v: any) => v.active)
  // Versão aprovada mais recente (se existir)
  const approvedVersion = [...versions]
    .filter(v => v.approved)
    .sort(
      (a, b) =>
        new Date(b.approvedAt || 0).getTime() -
        new Date(a.approvedAt || 0).getTime()
    )[0]

  const handleFileUpload = async () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      await addVideoVersion(file, deliverableId)
      useUIStore
        .getState()
        .addNotification('Nova versão adicionada com sucesso!', 'success')
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      useUIStore
        .getState()
        .addNotification('Erro ao fazer upload do vídeo', 'error')
    } finally {
      setIsUploading(false)
      e.target.value = '' // Reset do input
    }
  }

  const handleSetActive = (versionId: string) => {
    setActiveVideoVersion(projectId, deliverableId, versionId)
  }

  const canApprove = (user as any)?.permissions?.includes('approve_videos')

  const handleApproveVersion = async (versionId: string) => {
    if (!canApprove) {
      addNotification('Você não tem permissão para aprovar versões.', 'error')
      return
    }

    try {
      approveVideoVersion(
        projectId,
        deliverableId,
        versionId,
        user?.name || 'Desconhecido',
        approvalNote
      )
      addNotification('Versão aprovada com sucesso!', 'success')

      // Adicionar ao histórico de auditoria
      const auditEntry = {
        id: crypto.randomUUID(),
        actionType: 'version_approved',
        entityId: versionId,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        details: {
          projectId,
          deliverableId,
          notes: approvalNote,
        },
      }
      console.log('Histórico de auditoria:', auditEntry)
    } catch (error) {
      addNotification('Erro ao aprovar versão.', 'error')
    }
  }

  // Manipulador para rejeitar uma versão
  const handleReject = () => {
    if (!selectedVersionId) return

    const reason = rejectionReason.trim()
    if (!reason) {
      addNotification('Por favor, informe o motivo da rejeição', 'warning')
      return
    }

    rejectVideoVersion(projectId, deliverableId, selectedVersionId, reason)

    // Registrar ação de auditoria
    const auditEntry = {
      id: Date.now().toString(),
      actionType: 'version_rejected',
      entityId: selectedVersionId,
      userId: user?.name || 'Cliente',
      timestamp: new Date().toISOString(),
      details: {
        projectId,
        deliverableId,
        reason,
      },
    }

    console.log('Registro de auditoria:', auditEntry)

    // Limpar estado
    setRejectionReason('')
    setSelectedVersionId(null)
    setRejectionDialogOpen(false)
  }

  // Abrir diálogo de rejeição
  const openRejectionDialog = (versionId: string) => {
    setSelectedVersionId(versionId)
    setRejectionDialogOpen(true)
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Versões do Vídeo</h3>

        {/* Status summary */}
        <div className="flex items-center gap-2">
          {approvedVersion && (
            <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Aprovado
            </span>
          )}

          {activeVersion && !activeVersion.approved && (
            <span className="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-300">
              <Clock className="h-3 w-3 mr-1" />
              Em revisão
            </span>
          )}
        </div>

        <Button
          onClick={handleFileUpload}
          disabled={isUploading}
          variant="outline"
          size="sm"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? 'Enviando...' : 'Adicionar Versão'}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          accept="video/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <FileVideo2 className="h-4 w-4 mr-1" />
        <span>
          {versions.length} {versions.length === 1 ? 'versão' : 'versões'}
        </span>

        {activeVersion && (
          <>
            <span className="mx-2">•</span>
            <Clock className="h-4 w-4 mr-1" />
            <span>Ativa: {activeVersion.name}</span>
          </>
        )}

        {approvedVersion && (
          <>
            <span className="mx-2">•</span>
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Última aprovada: {approvedVersion.name}</span>
          </>
        )}
      </div>

      {versions.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">Nenhuma versão disponível</p>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditor
              ? 'Faça upload da primeira versão do vídeo'
              : 'Aguardando upload da primeira versão pelo editor'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedVersions.map(version => (
            <div
              key={version.id}
              className={cn(
                'border p-4 rounded-md shadow-sm transition-colors duration-200',
                version.status === 'approved'
                  ? 'border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-950/10'
                  : version.status === 'rejected'
                    ? 'border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/10'
                    : version.active
                      ? 'border-yellow-200 dark:border-yellow-900 bg-yellow-50/30 dark:bg-yellow-950/10'
                      : 'border-muted'
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{version.name}</h4>
                    {version.active &&
                      version.status !== 'approved' &&
                      version.status !== 'rejected' && (
                        <span className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 text-xs px-2 py-0.5 rounded flex items-center">
                          <Activity className="h-3 w-3 mr-1" />
                          Em revisão
                        </span>
                      )}
                    {version.status === 'approved' && (
                      <span className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs px-2 py-0.5 rounded flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Aprovada
                      </span>
                    )}
                    {version.status === 'rejected' && (
                      <span className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 text-xs px-2 py-0.5 rounded flex items-center">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejeitada
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Enviada em{' '}
                      {format(
                        new Date(version.uploadedAt),
                        "dd/MM/yyyy 'às' HH:mm",
                        { locale: ptBR }
                      )}
                    </span>

                    {version.metadata?.fileName && (
                      <>
                        <span className="mx-1">•</span>
                        <FileBadge className="h-3 w-3" />
                        <span>{version.metadata.fileName}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {onSelectVersion && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectVersion(version)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Assistir
                    </Button>
                  )}
                </div>
              </div>

              {/* Se for versão aprovada, mostrar detalhes */}
              {version.status === 'approved' && (
                <div className="text-sm bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-3 rounded mb-3">
                  <div className="flex items-center mb-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>
                      Aprovado por{' '}
                      <strong>{version.approvedBy || 'Cliente'}</strong> em{' '}
                      {version.approvedAt
                        ? format(new Date(version.approvedAt), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })
                        : '—'}
                    </span>
                  </div>
                  {version.approvalNotes && (
                    <p className="mt-1 pl-6 text-green-700 dark:text-green-400">
                      "{version.approvalNotes}"
                    </p>
                  )}
                </div>
              )}

              {/* Se for versão rejeitada, mostrar motivo */}
              {version.status === 'rejected' && (
                <div className="text-sm bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded mb-3">
                  <div className="flex items-center mb-1">
                    <XCircle className="h-4 w-4 mr-2" />
                    <span>
                      Rejeitado por{' '}
                      <strong>{version.approvedBy || 'Cliente'}</strong> em{' '}
                      {version.approvedAt
                        ? format(new Date(version.approvedAt), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })
                        : '—'}
                    </span>
                  </div>
                  {version.approvalNotes && (
                    <p className="mt-1 pl-6 text-red-700 dark:text-red-400">
                      "{version.approvalNotes}"
                    </p>
                  )}
                </div>
              )}

              {/* Botões de ação */}
              {version.status !== 'approved' &&
                version.status !== 'rejected' && (
                  <div className="mt-3">
                    {!version.active && isEditor && (
                      <Button
                        onClick={() => handleSetActive(version.id)}
                        variant="outline"
                        size="sm"
                        className="mr-2"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Definir como Ativa
                      </Button>
                    )}

                    {version.active && isClient && (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Observações da aprovação (opcional)"
                          value={approvalNote}
                          onChange={e => setApprovalNote(e.target.value)}
                          className="resize-none text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproveVersion(version.id)}
                            variant="default"
                            className="flex-1"
                          >
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Aprovar
                          </Button>

                          <Button
                            onClick={() => openRejectionDialog(version.id)}
                            variant="outline"
                            className="flex-1 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
                          >
                            <ThumbsDown className="mr-2 h-4 w-4" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}

      {/* Diálogo de Rejeição */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Versão</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo da rejeição para que o editor possa
              fazer as correções necessárias.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Motivo da rejeição"
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            className="resize-none"
            rows={4}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectionDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Rejeitar Versão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
