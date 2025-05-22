'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectsStore } from '@/store/useProjectsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import CommentOverlay from '@/components/video/CommentOverlay';
import AddCommentButton from '@/components/video/AddCommentButton';
import CommentList from '@/components/video/CommentList';
import VideoVersionList from '@/components/video/VideoVersionList';
import AssetsPanel from '@/components/widgets/AssetsPanel';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { MessageCircle, Layers, FileBox, ArrowLeft } from 'lucide-react';
import { VideoVersion } from '@/types/project';
import { useUIStore } from '@/store/useUIStore';

export default function VideoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const currentProject = useProjectsStore(state => state.currentProject);
  const setCurrentProject = useProjectsStore(state => state.setCurrentProject);
  const projects = useProjectsStore(state => state.projects);
  const addTimeComment = useProjectsStore(state => state.addTimeComment);
  const user = useAuthStore(state => state.user);
  const addNotification = useUIStore(state => state.addNotification);

  const [currentTime, setCurrentTime] = useState(0);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [selectedDeliverable, setSelectedDeliverable] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<VideoVersion | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Encontrar o projeto pelo ID da URL
  useEffect(() => {
    if (id && projects.length) {
      const project = projects.find(p => p.id === id);
      if (project) {
        setCurrentProject(project);
        // Definir o primeiro deliverable como selecionado por padrão
        if (project.videos?.length && !selectedDeliverable) {
          setSelectedDeliverable(project.videos[0].id);
          
          // Definir a versão ativa ou a mais recente como selecionada
          const versions = project.videos[0].versions;
          if (versions?.length) {
            const activeVersion = versions.find(v => v.active);
            setSelectedVersion(activeVersion || versions[versions.length - 1]);
          }
        }
      }
    }
  }, [id, projects, setCurrentProject, selectedDeliverable]);

  // Quando o deliverable mudar, atualizar a versão selecionada
  useEffect(() => {
    if (currentProject && selectedDeliverable) {
      const deliverable = currentProject.videos.find(v => v.id === selectedDeliverable);
      if (deliverable?.versions?.length) {
        const activeVersion = deliverable.versions.find(v => v.active);
        setSelectedVersion(activeVersion || deliverable.versions[deliverable.versions.length - 1]);
      } else {
        setSelectedVersion(null);
      }
    }
  }, [currentProject, selectedDeliverable]);

  // Atualizar o tempo atual do vídeo durante a reprodução
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Iniciar adição de comentário
  const handleAddComment = () => {
    setIsAddingComment(true);
  };

  // Salvar o novo comentário
  const handleSaveComment = () => {
    if (selectedDeliverable && newCommentContent.trim()) {
      addTimeComment(id, selectedDeliverable, newCommentContent, currentTime);
      setNewCommentContent('');
      setIsAddingComment(false);
      addNotification('Comentário adicionado com sucesso!');
    }
  };

  // Cancelar adição de comentário
  const handleCancelComment = () => {
    setIsAddingComment(false);
    setNewCommentContent('');
  };

  // Mudar para outra versão do vídeo
  const handleSelectVersion = (version: VideoVersion) => {
    setSelectedVersion(version);
    if (videoRef.current) {
      // Manter o tempo atual quando trocar de versão
      const currentTime = videoRef.current.currentTime;
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTime;
        }
      };
    }
  };

  // Ir para um tempo específico no vídeo
  const handleSeekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play().catch(err => console.error("Erro ao reproduzir:", err));
    }
  };

  if (!currentProject) {
    return <div className="p-8 text-center">Carregando projeto...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Button 
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar ao projeto
      </Button>

      <h1 className="text-2xl font-bold mb-6">{currentProject.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vídeo e comentários */}
        <div className="lg:col-span-2">
          {/* Container de vídeo com posição relativa para posicionar elementos sobre ele */}
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video mb-6">
            {selectedVersion ? (
              <>                <video
                  ref={videoRef}
                  src={selectedVersion.url}
                  className="w-full h-full"
                  controls
                  onTimeUpdate={handleTimeUpdate}
                />
                
                {/* Overlay de comentários */}
                {selectedDeliverable && (
                  <CommentOverlay 
                    currentTime={currentTime} 
                    deliverableId={selectedDeliverable} 
                    tolerance={1} 
                  />
                )}
                
                {/* Botão de adicionar comentário */}
                {!isAddingComment && (
                  <AddCommentButton 
                    onClick={handleAddComment} 
                    time={currentTime} 
                  />
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                Nenhuma versão disponível para este vídeo
              </div>
            )}
          </div>

          {/* Interface de adicionar comentário */}
          {isAddingComment && (
            <div className="mb-6 p-4 border rounded-md bg-card">
              <h3 className="text-lg font-medium mb-2">
                Adicionar comentário em {formatTime(currentTime)}
              </h3>
              <textarea
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                placeholder="Digite seu comentário sobre o vídeo neste ponto..."
                className="w-full p-3 border rounded-md mb-3 bg-background"
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancelComment}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveComment}>Salvar Comentário</Button>
              </div>
            </div>
          )}

          {/* Tabs para comentários, versões e assets */}
          <Tabs className="mb-6">
            <TabList className="flex border-b mb-4">
              <Tab className="px-4 py-2 border-b-2 border-transparent hover:text-blue-500 focus:outline-none cursor-pointer flex items-center">
                <MessageCircle className="mr-2 h-4 w-4" />
                Comentários
              </Tab>
              <Tab className="px-4 py-2 border-b-2 border-transparent hover:text-blue-500 focus:outline-none cursor-pointer flex items-center">
                <Layers className="mr-2 h-4 w-4" />
                Versões
              </Tab>
              <Tab className="px-4 py-2 border-b-2 border-transparent hover:text-blue-500 focus:outline-none cursor-pointer flex items-center">
                <FileBox className="mr-2 h-4 w-4" />
                Assets
              </Tab>
            </TabList>

            <TabPanel>
              {selectedDeliverable && (
                <CommentList 
                  projectId={id} 
                  deliverableId={selectedDeliverable} 
                  onSeek={handleSeekTo}
                  onAddComment={handleAddComment}
                />
              )}
            </TabPanel>
            
            <TabPanel>
              {selectedDeliverable && (
                <VideoVersionList 
                  projectId={id} 
                  deliverableId={selectedDeliverable} 
                  onSelectVersion={handleSelectVersion}
                />
              )}
            </TabPanel>
            
            <TabPanel>
              <AssetsPanel />
            </TabPanel>
          </Tabs>
        </div>

        {/* Sidebar com seleção de deliverables */}
        <div className="space-y-6">
          <div className="border rounded-md p-4 bg-card">
            <h2 className="text-lg font-semibold mb-4">Vídeos do Projeto</h2>
            <div className="space-y-2">
              {currentProject.videos.map(video => (
                <div 
                  key={video.id}
                  onClick={() => setSelectedDeliverable(video.id)}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    selectedDeliverable === video.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <h3 className="font-medium">{video.title}</h3>
                  <div className="text-xs mt-1">
                    {video.versions.length} {video.versions.length === 1 ? 'versão' : 'versões'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Formata segundos para MM:SS
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
