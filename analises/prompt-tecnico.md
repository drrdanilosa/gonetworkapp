# Instruções para Implementação de Workflow e Interação Cliente-Editor

## Sequência de Implementação

```
1. STORES → 2. COMPONENTES BÁSICOS → 3. COMPONENTES INTERATIVOS → 4. INTEGRAÇÃO
```

## 1. STORES ZUSTAND

### 1.1. Store de UI (Notificações)

**Arquivo:** `store/useUIStore.ts`
```typescript
// store/useUIStore.ts
import { create } from 'zustand';

interface Notification {
  id: string;
  message: string;
}

interface UIState {
  notifications: Notification[];
  addNotification: (message: string) => void;
  removeNotification: (id: string) => void;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export const useUIStore = create<UIState>((set, get) => ({
  notifications: [],

  addNotification: (message) => {
    const id = generateId();
    set(state => ({
      notifications: [...state.notifications, { id, message }]
    }));
    // Remove automaticamente após 5 segundos
    const removeFn = get().removeNotification;
    setTimeout(() => {
      removeFn(id);
    }, 5000);
  },

  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  }
}));
```

### 1.2. Store de Projetos (Extensão)

**Arquivo:** `store/useProjectsStore.ts`
```typescript
// store/useProjectsStore.ts
import { create } from 'zustand';
import { useUIStore } from '@/store/useUIStore';

// Tipos
type TaskStatus = 'pending' | 'completed';
interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}
interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: number;
  resolved: boolean;
}
type DeliverableStatus = 'editing' | 'ready_for_review' | 'changes_requested' | 'approved';
interface Deliverable {
  id: string;
  title: string;
  url?: string;
  status: DeliverableStatus;
  comments: Comment[];
}
interface Project {
  id: string;
  name: string;
  clientId: string;
  deliverables: Deliverable[];
  tasks: Task[];
}

// Utilitário para IDs
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Tarefas padrão
const defaultTaskTitles: string[] = [
  'Planejamento do projeto',
  'Gravação/Produção do vídeo',
  'Edição do vídeo',
  'Revisão do cliente',
  'Aprovação final'
];

interface ProjectsState {
  projects: Project[];
  addProject: (projectData: { id?: string; name: string; clientId: string }) => void;
  markVideoReady: (projectId: string, deliverableId: string) => void;
  approveDeliverable: (projectId: string, deliverableId: string) => void;
  requestChanges: (projectId: string, deliverableId: string) => void;
  markCommentResolved: (projectId: string, deliverableId: string, commentId: string) => void;
  toggleTaskCompletion: (projectId: string, taskId: string) => void;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  
  addProject: ({ id, name, clientId }) => {
    const projectId = id || generateId();
    const tasks: Task[] = defaultTaskTitles.map(title => ({
      id: generateId(),
      title,
      status: 'pending'
    }));
    const newProject: Project = {
      id: projectId,
      name,
      clientId,
      deliverables: [],
      tasks
    };
    set(state => ({
      projects: [...state.projects, newProject]
    }));
  },

  markVideoReady: (projectId, deliverableId) => {
    set(state => {
      const projects = state.projects.map(project => {
        if (project.id !== projectId) return project;
        const updatedDeliverables = project.deliverables.map(deliv => {
          if (deliv.id !== deliverableId) return deliv;
          return { ...deliv, status: 'ready_for_review' };
        });
        let updatedTasks = project.tasks;
        const approvalTaskExists = project.tasks.some(task => task.title.includes('Aprovação') && task.status === 'pending');
        if (!approvalTaskExists) {
          updatedTasks = [
            ...project.tasks,
            { id: generateId(), title: 'Aguardando aprovação do vídeo', status: 'pending' }
          ];
        }
        return { ...project, deliverables: updatedDeliverables, tasks: updatedTasks };
      });
      return { projects };
    });
    useUIStore.getState().addNotification('Vídeo marcado como pronto para revisão.');
  },

  approveDeliverable: (projectId, deliverableId) => {
    set(state => {
      const projects = state.projects.map(project => {
        if (project.id !== projectId) return project;
        const updatedDeliverables = project.deliverables.map(deliv => {
          if (deliv.id !== deliverableId) return deliv;
          return { ...deliv, status: 'approved' };
        });
        const updatedTasks = project.tasks.map(task => {
          if (task.title.includes('Aguardando aprovação') && task.status === 'pending') {
            return { ...task, status: 'completed' };
          }
          return task;
        });
        return { ...project, deliverables: updatedDeliverables, tasks: updatedTasks };
      });
      return { projects };
    });
    useUIStore.getState().addNotification('Entrega aprovada com sucesso!');
  },

  requestChanges: (projectId, deliverableId) => {
    set(state => {
      const projects = state.projects.map(project => {
        if (project.id !== projectId) return project;
        const updatedDeliverables = project.deliverables.map(deliv => {
          if (deliv.id !== deliverableId) return deliv;
          return { ...deliv, status: 'changes_requested' };
        });
        const updatedTasks = [
          ...project.tasks,
          { id: generateId(), title: 'Implementar alterações solicitadas', status: 'pending' }
        ];
        return { ...project, deliverables: updatedDeliverables, tasks: updatedTasks };
      });
      return { projects };
    });
    useUIStore.getState().addNotification('Solicitação de alterações registrada.');
  },

  markCommentResolved: (projectId, deliverableId, commentId) => {
    set(state => {
      const projects = state.projects.map(project => {
        if (project.id !== projectId) return project;
        const updatedDeliverables = project.deliverables.map(deliv => {
          if (deliv.id !== deliverableId) return deliv;
          const updatedComments = deliv.comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, resolved: true };
            }
            return comment;
          });
          return { ...deliv, comments: updatedComments };
        });
        return { ...project, deliverables: updatedDeliverables };
      });
      return { projects };
    });
  },

  toggleTaskCompletion: (projectId, taskId) => {
    set(state => {
      const projects = state.projects.map(project => {
        if (project.id !== projectId) return project;
        const updatedTasks = project.tasks.map(task => {
          if (task.id === taskId) {
            const newStatus: TaskStatus = task.status === 'pending' ? 'completed' : 'pending';
            return { ...task, status: newStatus };
          }
          return task;
        });
        return { ...project, tasks: updatedTasks };
      });
      return { projects };
    });
  }
}));
```

## 2. COMPONENTES BÁSICOS

### 2.1. Componente de Toast para Notificações

**Arquivo:** `components/widgets/NotificationToast.tsx`
```tsx
// components/widgets/NotificationToast.tsx
"use client";

import { useUIStore } from '@/store/useUIStore';

export function NotificationToast() {
  const notifications = useUIStore(state => state.notifications);
  const removeNotification = useUIStore(state => state.removeNotification);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {notifications.map(note => (
        <div 
          key={note.id} 
          className="bg-gray-800 text-white px-4 py-3 rounded shadow flex items-center justify-between"
        >
          <span>{note.message}</span>
          <button 
            onClick={() => removeNotification(note.id)} 
            className="ml-4 text-white font-bold"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 2.2. Componente de Lista de Tarefas

**Arquivo:** `components/widgets/TaskList.tsx`
```tsx
// components/widgets/TaskList.tsx
"use client";

import { useAuthStore } from '@/store/useAuthStore';
import { useProjectsStore } from '@/store/useProjectsStore';

interface TaskListProps {
  projectId: string;
}

export function TaskList({ projectId }: TaskListProps) {
  const tasks = useProjectsStore(state => {
    const project = state.projects.find(p => p.id === projectId);
    return project ? project.tasks : [];
  });
  const toggleTaskCompletion = useProjectsStore(state => state.toggleTaskCompletion);
  const currentUserRole = useAuthStore(state => state.user?.role);

  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      <h3 className="font-semibold mb-2">Tarefas do Projeto</h3>
      <ul className="space-y-1">
        {tasks.map(task => (
          <li key={task.id} className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={task.status === 'completed'}
              onChange={() => toggleTaskCompletion(projectId, task.id)}
              disabled={currentUserRole !== 'editor' || task.title.toLowerCase().includes('aprovação')}
            />
            <span className={task.status === 'completed' ? 'line-through text-gray-500' : ''}>
              {task.title}
            </span>
            {task.status === 'completed' && (
              <span className="ml-2 text-green-600 text-sm">[Concluída]</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 3. COMPONENTES INTERATIVOS

### 3.1. Componente de Item de Comentário

**Arquivo:** `components/video/CommentItem.tsx`
```tsx
// components/video/CommentItem.tsx
"use client";

import { useProjectsStore } from '@/store/useProjectsStore';
import { useAuthStore } from '@/store/useAuthStore';

interface CommentItemProps {
  projectId: string;
  deliverableId: string;
  comment: {
    id: string;
    authorId: string;
    authorName: string;
    text: string;
    timestamp: number;
    resolved: boolean;
  };
}

export function CommentItem({ projectId, deliverableId, comment }: CommentItemProps) {
  const markCommentResolved = useProjectsStore(state => state.markCommentResolved);
  const currentUserRole = useAuthStore(state => state.user?.role);

  // Formata timestamp (segundos) para mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-2 p-2 border-b border-gray-200">
      <div className="text-sm text-gray-600">
        <strong>{comment.authorName}</strong> <span>@ {formatTime(comment.timestamp)}</span>
      </div>
      <div className="text-gray-800">{comment.text}</div>
      <div>
        {comment.resolved ? (
          <span className="text-green-600 text-sm font-medium">Resolvido</span>
        ) : (
          currentUserRole === 'editor' && (
            <button
              onClick={() => markCommentResolved(projectId, deliverableId, comment.id)}
              className="text-blue-600 text-sm underline"
            >
              Marcar como resolvido
            </button>
          )
        )}
      </div>
    </div>
  );
}
```

### 3.2. Componente de Ações da Entrega

**Arquivo:** `components/video/DeliverableActions.tsx`
```tsx
// components/video/DeliverableActions.tsx
"use client";

import { useAuthStore } from '@/store/useAuthStore';
import { useProjectsStore } from '@/store/useProjectsStore';

interface DeliverableActionsProps {
  projectId: string;
  deliverable: {
    id: string;
    title: string;
    status: string;
  };
}

export function DeliverableActions({ projectId, deliverable }: DeliverableActionsProps) {
  const currentUserRole = useAuthStore(state => state.user?.role);
  const markVideoReady = useProjectsStore(state => state.markVideoReady);
  const approveDeliverable = useProjectsStore(state => state.approveDeliverable);
  const requestChanges = useProjectsStore(state => state.requestChanges);

  const { status } = deliverable;

  if (currentUserRole === 'editor') {
    // Ações para o Editor
    if (status === 'editing' || status === 'changes_requested') {
      return (
        <button
          onClick={() => markVideoReady(projectId, deliverable.id)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Marcar vídeo como pronto para revisão
        </button>
      );
    }
    if (status === 'ready_for_review') {
      return <span className="text-orange-600 font-medium">⏳ Aguardando aprovação do cliente</span>;
    }
    if (status === 'approved') {
      return <span className="text-green-600 font-medium">✅ Vídeo aprovado pelo cliente</span>;
    }
  }

  if (currentUserRole === 'client') {
    // Ações para o Cliente
    if (status === 'ready_for_review') {
      return (
        <div>
          <button
            onClick={() => approveDeliverable(projectId, deliverable.id)}
            className="px-4 py-2 mr-2 bg-green-600 text-white rounded"
          >
            Aprovar vídeo
          </button>
          <button
            onClick={() => requestChanges(projectId, deliverable.id)}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Solicitar alterações
          </button>
        </div>
      );
    }
    if (status === 'approved') {
      return <span className="text-green-700 font-medium">✅ Você já aprovou esta entrega</span>;
    }
    if (status === 'changes_requested') {
      return <span className="text-red-600 font-medium">🔄 Alterações solicitadas. Aguardando nova versão.</span>;
    }
    if (status === 'editing') {
      return <span className="text-gray-600">⏳ O editor está trabalhando na entrega...</span>;
    }
  }

  return null;
}
```

## 4. INTEGRAÇÃO NO LAYOUT E PÁGINA

### 4.1. Integração no Layout Global

**Arquivo:** `app/layout.tsx`
```tsx
// app/layout.tsx
// Adicione o import:
import { NotificationToast } from '@/components/widgets/NotificationToast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Head content */}
      </head>
      <body>
        {children}
        <NotificationToast />
      </body>
    </html>
  );
}
```

### 4.2. Integração na Página de Evento

**Arquivo:** `app/events/[eventId]/page.tsx`
```tsx
// app/events/[eventId]/page.tsx
"use client";

import { useProjectsStore } from '@/store/useProjectsStore';
import { TaskList } from '@/components/widgets/TaskList';
import { CommentItem } from '@/components/video/CommentItem';
import { DeliverableActions } from '@/components/video/DeliverableActions';

interface EventPageProps {
  params: {
    eventId: string;
  };
}

export default function EventPage({ params }: EventPageProps) {
  const projectId = params.eventId;
  
  const project = useProjectsStore(state => 
    state.projects.find(p => p.id === projectId)
  );
  
  if (!project) {
    return <div>Carregando...</div>;
  }
  
  // Assume o primeiro deliverable como principal
  // Em implementações mais complexas, você pode listar todos
  const deliverable = project.deliverables[0];
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-xl font-bold mb-4">Evento: {project.name}</h1>

      {/* Lista de tarefas do projeto */}
      <TaskList projectId={projectId} />

      {/* Conteúdo da entrega de vídeo */}
      {deliverable && (
        <div className="mb-8">
          {/* Player de vídeo (ou thumbnail) */}
          <video src={deliverable.url} controls className="w-full mb-2" />
          
          {/* Botões de ação da entrega */}
          <DeliverableActions 
            projectId={projectId} 
            deliverable={deliverable} 
          />
          
          {/* Seção de comentários */}
          <div className="bg-gray-50 p-4 rounded mt-4">
            <h3 className="font-semibold mb-2">Comentários:</h3>
            {deliverable.comments.map(comment => (
              <CommentItem
                key={comment.id}
                projectId={projectId}
                deliverableId={deliverable.id}
                comment={comment}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

## 5. INTEGRAÇÃO E TESTES

### 5.1. Testar Criação de Eventos

Ao criar um evento, confirme que as tarefas padrão são criadas automaticamente:

```typescript
// No handler de criação de evento
const handleCreateEvent = async (formData) => {
  // Lógica existente de criação via API...
  
  // Após criar no backend e receber ID:
  useProjectsStore.getState().addProject({ 
    id: response.data.id, 
    name: formData.name, 
    clientId: formData.clientId 
  });
  
  // Redirecionar ou mostrar mensagem...
};
```

### 5.2. Verificar Fluxos

Teste os fluxos completos:

1. Editor marca vídeo como pronto → ver notificação e tarefa criada
2. Cliente aprova OU solicita alterações → ver notificação e tarefas atualizadas
3. Editor resolve comentários → ver status atualizado

## Observações Finais

- Ajuste os imports conforme a estrutura exata do seu projeto
- Use tipagem consistente, verificando compatibilidade com tipos existentes
- Implemente gradualmente, testando cada componente antes de avançar
- Se usar React Query ou outro gerenciador de estado/cache para dados do servidor, sincronize o estado Zustand com ele

## Sugestões de Evolução Futura

- Implementar WebSockets para notificações em tempo real
- Persistir workflows e tarefas no backend
- Adicionar histórico de alterações/aprovações
- Estender para múltiplas entregas por projeto
```