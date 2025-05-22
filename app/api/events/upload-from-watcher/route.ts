// app/api/events/upload-from-watcher/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { useProjectsStore } from '@/store/useProjectsStore';
import path from 'path';
import fs from 'fs';

// Função de log para auditoria
function logAudit(action: string, data: Record<string, any>) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${action}: ${JSON.stringify(data)}`;
  console.log(logMessage);
  
  // Em um ambiente de produção, você pode adicionar logs persistentes
  // fs.appendFileSync('logs/audit.log', logMessage + '\n');
}

// Validar o formato do arquivo
function isValidVideoFile(filename: string): boolean {
  const allowedExtensions = ['.mp4', '.mov', '.avi', '.webm'];
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
}

export async function POST(req: NextRequest) {
  try {
    // Extrair dados da requisição
    const { eventId, filename, url, detectedAt, fileSize } = await req.json();

    // Validar dados recebidos
    if (!eventId || !filename || !url) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dados incompletos. Necessário: eventId, filename e url' 
      }, { status: 400 });
    }
    
    // Validar formato do arquivo
    if (!isValidVideoFile(filename)) {
      return NextResponse.json({
        success: false,
        error: 'Formato de arquivo inválido. Apenas arquivos de vídeo são permitidos.'
      }, { status: 400 });
    }

    // Acessar o estado global do Zustand
    const store = useProjectsStore.getState();
    
    // Buscar o projeto pelo ID
    const project = store.projects.find(p => p.id === eventId);
    if (!project) {
      return NextResponse.json({ 
        success: false, 
        error: 'Projeto não encontrado',
        eventId
      }, { status: 404 });
    }

    try {
      // Identificar o deliverable alvo (usamos o primeiro vídeo ou criamos um novo)
      const deliverable = project.videos?.[0] || {
        id: `${eventId}-vid1`,
        title: "Vídeo Principal",
        versions: [],
        status: 'editing' as const
      };      // Criar nova versão de vídeo com informações mais completas
      const newVersionNumber = deliverable.versions.length + 1;
      const newVersion = {
        id: `${deliverable.id}-v${newVersionNumber}`,
        name: `${filename.split('.')[0] || `v${newVersionNumber}`}`,
        url,
        uploadedAt: new Date(),
        detectedAt: detectedAt ? new Date(detectedAt) : new Date(),
        fileSize: fileSize || null,
        status: 'pendingReview',
        metadata: {
          sourceType: 'localWatcher',
          fileName: filename,
          originalPath: url,
        }
      };

      // Registrar na auditoria
      logAudit('VIDEO_DETECTED', {
        projectId: eventId,
        deliverableId: deliverable.id,
        versionId: newVersion.id,
        filename,
        url
      });

      // Adicionar a versão ao deliverable
      const updatedDeliverable = {
        ...deliverable,
        versions: [...deliverable.versions, newVersion],
        lastUpdated: new Date().toISOString()
      };

      // Atualizar o projeto no store
      const updatedProject = {
        ...project,
        videos: project.videos?.length 
          ? project.videos.map(v => v.id === deliverable.id ? updatedDeliverable : v)
          : [updatedDeliverable],
        updatedAt: new Date().toISOString()
      };      // Persistir as mudanças no store
      store.projects = store.projects.map(p => 
        p.id === project.id ? updatedProject : p
      );
      if (store.currentProject?.id === project.id) {
        store.currentProject = updatedProject;
      }

      try {
        // Persistir no localStorage (em ambiente client-side)
        // Nota: esta parte só funcionaria no lado do cliente, não no servidor Next.js
        // Em produção, você usaria um banco de dados adequado ou uma API de armazenamento
        if (typeof window !== 'undefined') {
          localStorage.setItem('projects', JSON.stringify(store.projects));
        }
      } catch (storageErr) {
        console.warn('Aviso: Não foi possível persistir no localStorage', storageErr);
      }

      // Log para auditoria final
      logAudit('VIDEO_REGISTERED', {
        projectId: project.id,
        deliverableId: updatedDeliverable.id,
        versionId: newVersion.id,
        filename,
        url,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Vídeo registrado com sucesso',
        project: project.id,
        deliverable: updatedDeliverable.id,
        version: newVersion
      });
    } catch (storageError) {
      console.error('Erro ao atualizar o store:', storageError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao atualizar projeto no armazenamento'
      }, { status: 500 });
    }  } catch (error) {
    console.error('Erro ao processar upload do watcher:', error);
    // Log detalhado para debug
    console.error('Dados da requisição:', { eventId, filename, url, detectedAt, fileSize });
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno ao processar o vídeo'
    }, { status: 500 });
  }
}
