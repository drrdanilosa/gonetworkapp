'use client'

import React from 'react'
import { useProjectsStore } from '@/store/useProjectsStoreUnified'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, FileVideo, PlayCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import Link from 'next/link'
import RoleGuard from '@/components/auth/RoleGuard'

export default function VideosForReviewPage() {
  const { projects } = useProjectsStore()

  // Obter todos os vídeos aguardando aprovação
  const pendingVideos = projects.reduce((acc, project) => {
    if (!project.videos) return acc

    const projectVideos = project.videos.reduce((videoAcc, deliverable) => {
      if (!deliverable.versions) return videoAcc

      // Corrigindo comparação de tipos incompatíveis
      const filteredVersions = deliverable.versions.filter(
        version => version?.status === 'aguardando_aprovacao'
      )

      if (filteredVersions.length > 0) {
        filteredVersions.forEach(version => {
          videoAcc.push({
            projectId: project.id,
            projectName: project.name,
            deliverableId: deliverable.id,
            deliverableTitle: deliverable.title,
            versionId: version.id,
            versionName: version.name,
            uploadedAt: version.uploadedAt,
            url: version.url,
          })
        })
      }

      return videoAcc
    }, [] as any[])

    return [...acc, ...projectVideos]
  }, [] as any[])

  // Ordenar por data de upload (mais recente primeiro)
  pendingVideos.sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  )

  return (
    <RoleGuard
      allowedRoles={['admin', 'client']}
      fallback={
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p>Você não tem permissão para visualizar esta página.</p>
              <p className="mt-2 text-muted-foreground">
                Apenas clientes e administradores podem aprovar vídeos.
              </p>
            </div>
          </CardContent>
        </Card>
      }
    >
      <div className="container mx-auto p-4">
        <h1 className="mb-6 text-2xl font-bold">Vídeos para Aprovação</h1>

        <Card>
          <CardHeader>
            <CardTitle>Vídeos Aguardando Revisão</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingVideos.length === 0 ? (
              <div className="py-8 text-center">
                <FileVideo className="mx-auto mb-2 size-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">
                  Nenhum vídeo aguardando aprovação
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Todos os vídeos já foram revisados ou não há vídeos
                  disponíveis para revisão.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Vídeo</TableHead>
                    <TableHead>Enviado</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingVideos.map(video => (
                    <TableRow key={video.versionId}>
                      <TableCell className="font-medium">
                        {video.projectName}
                      </TableCell>
                      <TableCell>{video.versionName}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="mr-1 size-4 text-muted-foreground" />
                          <span>
                            {formatDistanceToNow(new Date(video.uploadedAt), {
                              addSuffix: true,
                              locale: pt,
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-yellow-300 bg-yellow-100 text-yellow-800"
                        >
                          Aguardando Aprovação
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/eventos/${video.projectId}/aprovacao`}>
                          <Button size="sm" className="gap-1">
                            <PlayCircle className="size-4" />
                            Revisar
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
