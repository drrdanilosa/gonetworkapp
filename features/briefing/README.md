# Documentação do Módulo de Briefing

## Visão Geral

O módulo de Briefing é uma parte essencial do sistema MelhorApp para o gerenciamento de entregas audiovisuais em eventos. Ele permite que os usuários registrem, consultem e gerenciem informações detalhadas sobre cada evento, facilitando a comunicação entre equipes e garantindo que todos os requisitos sejam atendidos.

## Estrutura de Diretórios

```
/features/briefing/
  ├── components/
  │   └── GeneralInfoTab.tsx      # Componente para informações gerais do evento
  │   
/app/api/briefings/
  ├── route.ts                    # API para gerenciamento dos briefings
  └── [eventId]/
      └── route.ts                # API para briefings específicos
      
/app/events/
  ├── page.tsx                    # Página de listagem de eventos
  └── [eventId]/
      ├── page.tsx                # Página de detalhes do evento
      └── briefing/
          └── page.tsx            # Página de briefing do evento
          
/services/
  └── briefing-service.ts         # Serviço para interação com API de briefings
```

## Componentes Principais

### GeneralInfoTab

Este componente gerencia as informações gerais do briefing de um evento, incluindo:

- Data e horário do evento
- Local do evento
- Informações de credenciamento
- Detalhes sobre sala de mídia
- Informações de acesso à internet
- Outras informações gerais relevantes

O componente implementa validação de dados com React Hook Form e Zod, incluindo validações condicionais baseadas nas opções selecionadas pelo usuário.

### Serviço de Briefing

O `briefing-service.ts` fornece funções para interagir com a API de briefings, incluindo:

- `getBriefing(eventId)`: Busca informações detalhadas de um briefing específico
- `saveBriefing(data)`: Salva ou atualiza informações de um briefing

### APIs

- `POST /api/briefings`: Cria ou atualiza um briefing
- `GET /api/briefings/[eventId]`: Retorna detalhes de um briefing específico

## Como Usar

1. Acesse a lista de eventos através da página `/events`
2. Selecione um evento específico para ver seus detalhes
3. Clique em "Acessar Briefing" para gerenciar as informações do briefing
4. Na aba "Informações Gerais", preencha ou atualize os dados necessários
5. Clique em "Salvar Informações" para persistir as alterações

## Controle de Acesso

O módulo implementa verificações de permissões baseadas nos papéis dos usuários:
- Administradores e coordenadores podem editar informações
- Outros usuários podem apenas visualizar os dados

## Próximos Passos

1. Implementar abas adicionais para o briefing:
   - Requisitos Técnicos
   - Cronograma
   - Recursos
   - Equipe
  
2. Melhorar o sistema de notificações para alertar membros da equipe quando um briefing for atualizado

3. Adicionar histórico de alterações para rastrear modificações nos briefings
