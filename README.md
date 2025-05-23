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
- **Player de vídeo** com anotações e comentários contextuais
- **Colaboração em tempo real** usando Socket.io
- **Anotações visuais** diretamente no vídeo
- **Comentários com timestamp** vinculados a momentos específicos do vídeo
- **Sistema de status** para acompanhamento de projetos
- **Interface responsiva** para desktop e dispositivos móveis

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

## Melhorias Recentes

- **Adição de Geração de Timeline**: Agora é possível gerar timelines diretamente a partir do briefing.
- **Correções de Bugs**: Ajustes em validações de formulários e melhorias na responsividade.
- **Otimizações de Performance**: Redução de tempo de carregamento e melhorias no gerenciamento de estado.

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

---

Desenvolvido para GoNetwork AI
