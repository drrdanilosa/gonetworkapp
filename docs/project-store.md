# Documentação do Store de Projetos

## Visão Geral

O `useProjectsStoreUnified` é uma implementação unificada do estado de projetos para a aplicação MelhorApp. Este store centraliza a gestão de todos os dados relacionados a projetos, incluindo metadados, vídeos, comentários, tarefas e workflows.

## Motivo da Unificação

Anteriormente, a aplicação utilizava dois arquivos separados (`useProjectsStore.ts` e `useProjectsStoreExtended.ts`) para gerenciar o estado dos projetos. Essa duplicidade causava problemas de integração, especialmente na aba de edição/aprovação, onde funcionalidades semelhantes tinham implementações diferentes ou incompatíveis.

A unificação resolve:

- Conflitos de importação e implementação
- Inconsistências no gerenciamento de estado
- Problemas na aba de edição/aprovação
- Duplicidade de código e funções

## Estrutura do Store

O store unificado gerencia os seguintes tipos de dados:

- **Projetos**: Informações básicas, status, datas
- **Deliverables de Vídeo**: Entregáveis relacionados a vídeos
- **Versões de Vídeo**: Múltiplas versões de cada entregável
- **Comentários**: Feedback contextual sobre os vídeos
- **Anotações**: Marcações visuais nos vídeos
- **Tarefas**: Lista de atividades relacionadas ao projeto
- **Assets**: Recursos relacionados ao projeto

## Principais Funcionalidades

### Gerenciamento de Projetos

- `createProject`: Cria um novo projeto (suporta criação simples e avançada)
- `selectProject`: Seleciona um projeto ativo
- `updateProject`: Atualiza informações do projeto
- `deleteProject`: Remove um projeto

### Gerenciamento de Vídeos

- `addVideoVersion`: Adiciona uma nova versão de vídeo
- `setActiveVideoVersion`: Define qual versão está ativa
- `approveVideoVersion`: Aprova uma versão específica

### Sistema de Comentários

- `addComment`: Adiciona um comentário em um vídeo
- `markCommentResolved`: Marca um comentário como resolvido
- `updateComment`: Atualiza o conteúdo do comentário
- `deleteComment`: Remove um comentário

### Workflow do Projeto

- `markVideoReady`: Marca um vídeo como pronto para revisão
- `requestChanges`: Solicita alterações em um vídeo
- `approveDeliverable`: Aprova um entregável completo
- `toggleTaskCompletion`: Alterna o status de conclusão de tarefas

## Persistência de Dados

O store utiliza a middleware `persist` do Zustand para salvar automaticamente o estado no `localStorage` do navegador, garantindo que os dados permaneçam entre sessões.

```typescript
persist(
  // Implementação do store
  {
    name: 'projects-storage',
    partialize: state => ({
      projects: state.projects,
      currentProject: state.currentProject,
    }),
  }
)
```

## Como Usar

Para utilizar o store em um componente:

```tsx
import { useProjectsStore } from '@/store/useProjectsStoreUnified'

function MyComponent() {
  // Acessar estado
  const projects = useProjectsStore(state => state.projects)
  const currentProject = useProjectsStore(state => state.currentProject)

  // Acessar ações
  const { createProject, addVideoVersion } = useProjectsStore()

  // Implementação do componente...
}
```

## Integração com Notificações

O store está integrado com o `useUIStore` para exibir notificações ao usuário quando ações importantes são realizadas, como aprovação de vídeos ou solicitação de alterações.

## Próximos Passos

- Implementar sincronização com backend quando disponível
- Melhorar tratamento de erros em operações assíncronas
- Adicionar suporte a histórico de alterações
- Expandir suporte a diferentes tipos de mídia além de vídeos
