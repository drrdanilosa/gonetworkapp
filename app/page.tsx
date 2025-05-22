'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProjectsStore } from '@/store/useProjectsStore';
import { FileVideo, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SplashScreen from '@/components/splash-screen';
import MainWindow from '@/components/main-window';
import LoginWidget from '@/components/login-widget';
import { useAuthStore } from '@/store/useAuthStore';
import { useMobile } from '@/hooks/use-mobile';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const isMobile = useMobile();
  const router = useRouter();
  
  const projects = useProjectsStore(state => state.projects);
  const createProject = useProjectsStore(state => state.createProject);

  // Efeito para a splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Criar um projeto de exemplo se não houver projetos e o usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated && projects.length === 0) {
      createProject({
        title: 'Projeto Demonstração',
        name: 'Projeto Demonstração',
        description: 'Um projeto de exemplo para testar as funcionalidades',
        clientId: 'client-123',
        editorId: 'editor-456',
        status: 'draft',
        timeline: [],
        videos: [
          {
            id: 'demo-video-1',
            title: 'Vídeo Demonstração',
            versions: [],
            status: 'editing',
            comments: []
          }
        ],
        tasks: []
      });
    }
  }, [isAuthenticated, projects.length, createProject]);

  const handleLogin = (user: any) => {
    // O login é tratado pelo useAuthStore
  };

  const handleLogout = () => {
    logout();
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen">
        <LoginWidget onLoginSuccess={handleLogin} />
        <div className={`fixed ${isMobile ? 'bottom-4 left-4 right-4 flex justify-between' : 'bottom-4 right-4 flex gap-2'}`}>
          <a 
            href="/tema" 
            className={`text-xs bg-dracula-purple hover:bg-dracula-purple/90 text-white ${isMobile ? 'flex-1 mr-2 text-center' : 'px-4 py-2'} rounded-md transition-all shadow-dracula`}
          >
            Demo do Tema
          </a>
          <a 
            href="/exemplo" 
            className={`text-xs bg-dracula-cyan hover:bg-dracula-cyan/90 text-black ${isMobile ? 'flex-1 text-center' : 'px-4 py-2'} rounded-md transition-all shadow-dracula`}
          >
            Exemplo
          </a>
        </div>
      </main>
    );
  }

  // Interface atualizada para projetos quando autenticado
  return (
    <main className="min-h-screen">
      <MainWindow currentUser={user} onLogout={handleLogout}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Projetos</h1>
            <Button onClick={() => createProject({
              title: 'Novo Projeto',
              name: 'Novo Projeto',
              description: 'Descrição do novo projeto',
              clientId: user.id || 'client-123',
              editorId: 'editor-456',
              status: 'draft',
              timeline: [],
              videos: []
            })}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Projeto
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div key={project.id} className="border rounded-lg overflow-hidden hover:border-primary transition-colors">
                <div 
                  className="aspect-video bg-muted flex items-center justify-center cursor-pointer"
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  {project.thumbnailUrl ? (
                    <img 
                      src={project.thumbnailUrl} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileVideo className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-1">{project.title}</h2>
                  <p className="text-muted-foreground truncate mb-2">
                    {project.description || 'Sem descrição'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium bg-secondary px-2 py-1 rounded-md">
                      {project.status === 'draft' && 'Rascunho'}
                      {project.status === 'review' && 'Em Revisão'}
                      {project.status === 'approved' && 'Aprovado'}
                      {project.status === 'completed' && 'Concluído'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {project.videos.length} {project.videos.length === 1 ? 'vídeo' : 'vídeos'}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {projects.length === 0 && (
              <div className="col-span-full flex items-center justify-center h-64 border border-dashed rounded-lg">
                <div className="text-center">
                  <FileVideo className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum projeto encontrado. Crie seu primeiro projeto!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </MainWindow>
    </main>
  );
}
