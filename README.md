# MelhorApp - Sistema de Gerenciamento de Entregas Audiovisuais

Este projeto é uma aplicação web para gerenciar entregas audiovisuais em eventos, facilitando a interação entre editores de vídeo e clientes.

## Tecnologias Principais

- **Next.js 15** (framework React com App Router)
- **TypeScript** (tipagem estática)
- **Tailwind CSS** (estilização)
- **shadcn/UI** (componentes UI)
- **Zustand** (gerenciamento de estado)
- **React Hook Form + Zod** (formulários com validação)

## Funcionalidades Principais

- **Gerenciamento de Projetos**: Criar e gerenciar projetos de vídeo
- **Upload Manual de Vídeos**: Upload de arquivos .mp4 diretamente da interface
- **Importação de Vídeos Estáticos**: Importar vídeos existentes da pasta `public/exports/[projectId]/`
- **Versionamento de Vídeos**: Suporte a múltiplas versões de vídeo por entrega
- **Aprovação de Vídeos**: Marcar versões específicas como aprovadas

## Estrutura do Projeto

```plaintext
melhorapp/
├── app/                  # Next.js App Router
│   ├── api/              # Rotas de API
│   ├── globals.css       # Estilos globais
│   ├── layout.tsx        # Layout raiz
│   └── page.tsx          # Página inicial
├── components/           # Componentes React
│   ├── ui/               # Componentes de UI (shadcn)
│   ├── video/            # Componentes relacionados a vídeo
│   └── ...               # Outros componentes
├── features/             # Funcionalidades organizadas por domínio
│   ├── projects/         # Gerenciamento de projetos e vídeos
│   └── ...               # Outras funcionalidades
├── hooks/                # Hooks customizados
├── public/               # Arquivos estáticos
│   ├── exports/          # Pasta para vídeos estáticos de exemplo
├── store/                # Stores Zustand para gerenciamento de estado
└── types/                # Definições de tipos TypeScript
```

## Uso de Vídeos Estáticos de Exemplo

Para disponibilizar vídeos estáticos de exemplo:

1. Crie pastas dentro de `public/exports/` usando os IDs dos projetos como nomes das pastas

   ```
   public/exports/[projectId]/
   ```

2. Coloque arquivos .mp4 nas pastas correspondentes aos projetos

3. No aplicativo, use o botão "Importar Vídeos Existentes" na aba de Edição/Aprovação para importar esses vídeos

## Instalação e Execução Local

1. **Requisitos**: Node.js 18+ e npm
2. **Instalação**: Execute `npm install` na raiz do projeto
3. **Execução**: Inicie o servidor de desenvolvimento com `npm run dev`
4. **Acesso**: Abra `http://localhost:3000` no navegador

## Notas sobre Funcionalidades

- A aplicação não requer autenticação, permitindo o acesso direto às funcionalidades
- Os vídeos são armazenados apenas durante a sessão (em localStorage para persistência entre recarregamentos)
- A interface de Edição/Aprovação permite selecionar qual versão de vídeo está ativa e aprovar versões específicas

- **Player de vídeo** com anotações e comentários contextuais
- **Colaboração em tempo real** usando Socket.io
- **Anotações visuais** diretamente no vídeo
- **Comentários com timestamp** vinculados a momentos específicos do vídeo
- **Sistema de status** para acompanhamento de projetos
- **Interface responsiva** para desktop e dispositivos móveis

## Melhorias Implementadas

### 1. Estrutura de Projeto Melhorada

- Organização baseada em features para melhor escalabilidade
- Separação clara de responsabilidades

### 2. TypeScript Aprimorado

- Configurações mais rigorosas para capturar mais erros em tempo de desenvolvimento
- Tipagem adequada para todas as entidades

### 3. Gerenciamento de Estado

- Implementação do Zustand para estado global
- Stores separadas para diferentes domínios:
  - `useAuthStore` para autenticação
  - `useProjectsStore` para projetos, comentários e anotações
  - `useCollaborationStore` para colaboração em tempo real
  - `useUIStore` para estado da interface

### 4. API e Integração Backend

- Serviços abstraídos com React Query para cache e gerenciamento de estado de servidor
- Simulações para desenvolvimento local
- Estrutura pronta para integração com API real

### 5. Validação de Formulários

- React Hook Form com Zod para validação robusta
- Feedback de validação em tempo real para usuários

### 6. Responsividade

- Detecção avançada de dispositivos
- Adaptação de UI para diferentes tamanhos de tela

## Executando o Projeto

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Construir para produção
npm run build

# Iniciar versão de produção
npm start
```

## Credenciais de Demo

- **Email**: admin@gonetwork.ai
- **Senha**: admin

---

Desenvolvido para GoNetwork AI
