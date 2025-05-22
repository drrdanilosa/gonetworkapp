# MelhorApp - Sistema de Gerenciamento de Entregas Audiovisuais

Este projeto é uma aplicação web para gerenciar entregas audiovisuais em eventos, facilitando a interação entre editores de vídeo e clientes.

## Tecnologias Principais

- **Next.js 15** (framework React com App Router)
- **TypeScript** (tipagem estática)
- **Tailwind CSS** (estilização)
- **shadcn/UI** (componentes UI)
- **Zustand** (gerenciamento de estado)
- **React Query** (gerenciamento de dados e cache)
- **React Hook Form + Zod** (formulários com validação)
- **Socket.io** (comunicação em tempo real)

## Estrutura do Projeto

```plaintext
melhorapp/
├── app/                  # Next.js App Router
│   ├── globals.css       # Estilos globais
│   ├── layout.tsx        # Layout raiz
│   └── page.tsx          # Página inicial
├── components/           # Componentes React
│   ├── ui/               # Componentes de UI (shadcn)
│   ├── video/            # Componentes relacionados a vídeo
│   ├── widgets/          # Widgets funcionais da aplicação
│   └── ...               # Outros componentes
├── contexts/             # Contextos React
├── features/             # Funcionalidades organizadas por domínio
│   ├── auth/             # Autenticação
│   └── ...               # Outras funcionalidades
├── hooks/                # Hooks customizados
├── lib/                  # Código utilitário
├── services/             # Serviços para chamadas de API
├── store/                # Stores Zustand para gerenciamento de estado
├── styles/               # Estilos adicionais
└── types/                # Definições de tipos TypeScript
```

## Configuração do Socket.io e CORS

Para resolver problemas de CORS ao conectar com o servidor Socket.io, o projeto utiliza um proxy configurado no Next.js:

### Desenvolvimento

- O servidor Socket.io deve estar rodando em `http://localhost:3001`
- O front-end se conecta usando o caminho relativo `/socket.io`, que é redirecionado pelo proxy
- Execute o servidor de teste com `npm run socket-server`
- Inicie ambos (front-end e servidor Socket.io) com `npm run dev:all`

### Produção

- Configure a variável de ambiente `NEXT_PUBLIC_SOCKET_URL` apontando para o servidor Socket.io
- O front-end se conectará diretamente a esta URL
- Configure CORS no servidor para permitir conexões do domínio do front-end

### Diagnóstico de Conexão

- Acesse a página de diagnóstico em `/admin/diagnosticos` para verificar o status da conexão
- Utilize o script de diagnóstico com `npm run check-socket` para testes em desenvolvimento
- Para testar em produção, use `npm run check-socket:prod`

Documentação detalhada sobre a configuração do Socket.io está disponível em:
- `/docs/socket-io-cors.md` - Solução de problemas de CORS
- `/docs/socket-io-melhorias.md` - Resumo das implementações de segurança e robustez

### Variáveis de Ambiente

- Copie `.env.local.example` para `.env.local` e configure conforme necessário
- Para desenvolvimento, não defina `NEXT_PUBLIC_SOCKET_URL` para usar o proxy
- Para produção, defina `NEXT_PUBLIC_SOCKET_URL` com a URL completa do servidor Socket.io

## Fluxo de Trabalho Principal

1. **Autenticação**: Login/registro de editores e clientes
2. **Dashboard**: Visualização e gerenciamento dos projetos
3. **Edição de Vídeo**: Upload, revisão e anotação de vídeos
4. **Comentários**: Comentários com timestamp no vídeo
5. **Aprovação**: Fluxo de aprovação de entregas
6. **Exportação**: Exportação para redes sociais, etc.

## Funcionalidades Principais

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
