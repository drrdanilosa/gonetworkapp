# MelhorApp - Sistema de Gerenciamento de Eventos Audiovisuais

MelhorApp é uma plataforma moderna e completa para gerenciamento de projetos audiovisuais em eventos, facilitando a colaboração entre editores, produtores e clientes através de um sistema integrado de briefing, edição, aprovação e entrega.

## 🌟 Características Principais

### Gerenciamento de Eventos e Projetos

- **Dashboard Centralizado**: Visualize todos os eventos e projetos em andamento.

- **Organização por Cliente**: Agrupe projetos por cliente para melhor organização.

- **Acompanhamento de Status**: Monitore o progresso de todos os projetos em tempo real.

### Briefing Completo

- **Editor de Briefing Integrado**: Formulário estruturado para capturar todos os requisitos do evento.

- **Gestão de Patrocinadores**: Cadastre patrocinadores e suas necessidades específicas.

- **Programação de Palcos e Atrações**: Organize a programação completa do evento.

- **Planejamento de Entregas**: Defina entregas em tempo real e pós-evento.

### Produção e Edição de Vídeo

- **Upload Manual de Vídeos**: Faça upload de arquivos de vídeo diretamente pela interface.

- **Sistema de Versionamento**: Gerencie múltiplas versões de cada entrega.

- **Importação de Vídeos Existentes**: Importe vídeos de pastas para manter tudo organizado.

- **Comentários com Timestamp**: Adicione comentários em momentos específicos do vídeo.

### Aprovação e Feedback

- **Sistema de Aprovação**: Cliente pode aprovar ou solicitar alterações em vídeos.

- **Comentários Visuais**: Adicione anotações diretamente no player de vídeo.

- **Histórico de Revisões**: Mantenha o registro completo de todas as revisões e alterações.

### Timeline e Gestão de Tempo

- **Geração Automática de Timeline**: Gere timelines a partir do briefing.

- **Organização por Fases**: Divida o projeto em fases (pré-evento, evento, pós-evento).

- **Prazos e Lembretes**: Acompanhe prazos e receba notificações de deadlines.

### Equipe e Colaboração

- **Gestão de Equipe**: Adicione e gerencie membros da equipe.

- **Atribuição de Tarefas**: Atribua tarefas específicas para cada membro.

- **Colaboração em Tempo Real**: Acompanhe mudanças e atualizações em tempo real.

## 🚀 Tecnologias Utilizadas

- **Frontend**:

  - [Next.js 15](https://nextjs.org/) - Framework React com App Router.

  - [TypeScript](https://www.typescriptlang.org/) - Tipagem estática.

  - [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário.

  - [shadcn/UI](https://ui.shadcn.com/) - Componentes UI reutilizáveis.

  - [Zustand](https://github.com/pmndrs/zustand) - Gerenciamento de estado.

  - [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) - Formulários com validação.

- **Player de Vídeo e Edição**:

  - Player personalizado com suporte a anotações visuais.

  - Sistema de comentários com timestamp.

  - Ferramentas de desenho e marcação no vídeo.

- **Backend e Serviços**:

  - [API Routes do Next.js](https://nextjs.org/docs/api-routes/introduction) - APIs REST.

  - Socket.IO - Comunicação em tempo real.

  - [Zustand](https://github.com/pmndrs/zustand) - Gerenciamento de estado persistente.

## 📁 Estrutura do Projeto

```plaintext
melhorapp/
├── app/                  # Next.js App Router e páginas
│   ├── api/              # Rotas de API (endpoints REST)
│   ├── project/          # Páginas de projeto
│   └── events/           # Páginas de eventos
├── components/           # Componentes React reutilizáveis
│   ├── ui/               # Componentes base (shadcn/UI)
│   ├── widgets/          # Widgets principais (briefing, timeline, etc.)
│   ├── video/            # Player de vídeo e componentes relacionados
│   └── project/          # Componentes específicos de projeto
├── features/             # Funcionalidades organizadas por domínio
│   ├── projects/         # Gerenciamento de projetos
│   ├── briefing/         # Sistema de briefing
│   └── timeline/         # Funcionalidades de timeline
├── hooks/                # Hooks personalizados
├── store/                # Stores Zustand para gerenciamento de estado
│   ├── useProjectsStoreUnified.ts  # Store unificado de projetos
│   └── useUIStore.ts     # Store de interface do usuário
├── types/                # Definições de tipos TypeScript
└── public/               # Arquivos estáticos
    └── exports/          # Pasta para vídeos importados
```

## 🔄 Melhorias Recentes

### Versão Atual - v0.1.0

- **Correção de Carregamento de Eventos**: Resolvido problema de novos eventos não aparecendo no dropdown de seleção do Briefing.

- **Implementação do Sistema de Briefing**: Adicionado sistema completo de gerenciamento de briefings com abas sincronizadas.

- **Geração de Timeline**: Implementada funcionalidade para gerar timelines automáticas a partir do briefing.

- **Melhorias de UI/UX**: Interface redesenhada para melhor usabilidade e experiência do usuário.

- **Correções de Bugs**: Resolvidos diversos problemas de responsividade e validação de dados.

## 💻 Como Executar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior.

- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/).

### Instalação

```bash
# Clone o repositório
git clone https://github.com/contatogonetwork/melhorapp_final02.git

# Entre no diretório do projeto
cd melhorapp_final02

# Instale as dependências
npm install
```

### Executando o Projeto

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Servidor de desenvolvimento completo (com servidor Socket.IO)
npm run dev:all

# Build para produção
npm run build

# Iniciar em produção
npm run start

# Iniciar em produção (com servidor Socket.IO)
npm run start:all
```

### Ferramentas de Desenvolvimento

```bash
# Verificar erros de código
npm run lint

# Corrigir erros de código automaticamente
npm run lint:fix

# Verificar e corrigir formatação de código
npm run format

# Executar verificação de tipos TypeScript
npm run type-check
```

## 📋 Roadmap

- [ ] Sistema de autenticação completo.

- [ ] App mobile para aprovação de clientes.

- [ ] Vídeos em tempo real via WebRTC.

- [ ] Integração com serviços de armazenamento em nuvem.

- [ ] Recursos avançados de IA para geração de conteúdo.

- [ ] Dashboard analítico para métricas de produtividade.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

Desenvolvido por [GoNetwork AI](https://github.com/contatogonetwork).
