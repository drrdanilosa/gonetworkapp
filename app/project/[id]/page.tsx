'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProjectsStore } from '@/store/useProjectsStore';
import { Button } from '@/components/ui/button';
import { FileVideo, Clock, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const currentProject = useProjectsStore(state => state.currentProject);
  const setCurrentProject = useProjectsStore(state => state.setCurrentProject);
  const projects = useProjectsStore(state => state.projects);

  useEffect(() => {
    if (id && projects.length) {
      const project = projects.find(p => p.id === id);
      if (project) {
        setCurrentProject(project);
      }
    }
  }, [id, projects, setCurrentProject]);

  if (!currentProject) {
    return <div className="p-8 text-center">Carregando projeto...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Button 
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => router.push('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar aos projetos
      </Button>

      <h1 className="text-2xl font-bold mb-6">{currentProject.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-full">
          <h2 className="text-xl font-semibold mb-4">Vídeos do Projeto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentProject.videos.map(video => {
              // Encontrar a versão ativa ou a mais recente
              const activeVersion = video.versions.find(v => v.active);
              const latestVersion = video.versions.length > 0 
                ? video.versions[video.versions.length - 1] 
                : null;
              const displayVersion = activeVersion || latestVersion;

              return (
                <Link 
                  key={video.id} 
                  href={`/project/video/${id}`}
                  className="block"
                >
                  <div className="border rounded-lg overflow-hidden hover:border-primary transition-colors">
                    <div className="aspect-video relative bg-muted flex items-center justify-center">
                      {displayVersion?.thumbnailUrl ? (
                        <img 
                          src={displayVersion.thumbnailUrl} 
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : displayVersion ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileVideo className="h-12 w-12 text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileVideo className="h-12 w-12 text-muted-foreground" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-sm text-muted-foreground">Sem versões</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Status do vídeo */}
                      {video.status && (
                        <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium bg-black/70 text-white">
                          {video.status === 'editing' && (
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Em edição
                            </span>
                          )}
                          {video.status === 'ready_for_review' && (
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Pronto para revisão
                            </span>
                          )}
                          {video.status === 'changes_requested' && (
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Alterações solicitadas
                            </span>
                          )}
                          {video.status === 'approved' && (
                            <span className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aprovado
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium truncate">{video.title}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">
                          {video.versions.length} {video.versions.length === 1 ? 'versão' : 'versões'}
                        </span>
                        {displayVersion?.active && (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 px-1.5 py-0.5 rounded">
                            Ativa: {displayVersion.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
