# Guia de Uso - Sistema de Briefing em Abas

## Introdução

O sistema de briefing em abas permite gerenciar informações de eventos de forma consistente entre diferentes seções. As informações são armazenadas de forma centralizada e persistente, garantindo que todos os usuários vejam os mesmos dados atualizados.

## Acessando o Sistema

1. Na página inicial, clique no botão "Gerenciar" ao lado de qualquer projeto
2. Você será redirecionado para a página de gerenciamento com diferentes abas
3. Alternativamente, acesse `/eventos/[ID_DO_EVENTO]/gerenciar` diretamente

## Abas Disponíveis

### Aba "Briefing"

Contém informações gerais sobre o evento:

- Nome do projeto
- Cliente
- Data do evento
- Local
- Descrição
- Público-alvo
- Requisitos especiais

Para salvar informações, preencha os campos e clique em "Salvar Briefing".

### Aba "Equipe"

Permite gerenciar os membros da equipe para o evento:

- Adicionar novos membros com nome, função, email e habilidades
- Visualizar todos os membros da equipe
- Remover membros quando necessário

### Aba "Entregas"

Gerencia as entregas relacionadas ao projeto:

- Adicionar novas entregas com nome, tipo, data e responsáveis
- Visualizar o status de cada entrega
- Atualizar o status (Pendente, Em andamento, Em revisão, Concluído, Cancelado)
- Remover entregas

## Sincronização de Dados

Todas as abas usam o mesmo sistema de armazenamento, garantindo que:

1. Se você criar um briefing na aba "Briefing", ele estará disponível nas outras abas
2. Se você adicionar membros na aba "Equipe", eles estarão vinculados ao mesmo briefing
3. Se você atualizar qualquer informação, ela será refletida em todas as abas e para todos os usuários

## Recuperação de Erros

Se ocorrer algum erro durante o carregamento ou salvamento:

1. Uma mensagem será exibida explicando o problema
2. O botão "Tentar novamente" permite recarregar os dados
3. Se necessário, você pode voltar à página inicial e acessar o evento novamente

## Página de Teste

Para testar o sistema rapidamente, acesse `/test-abas`, que exibe um ambiente de testes com um ID de evento pré-configurado.
