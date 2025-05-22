# 🧠 GitHub Copilot: Auditoria Profunda do Projeto `melhorapp_final`

Este prompt é uma diretriz técnica altamente abrangente para ser utilizada com **GitHub Copilot Chat**, **Cursor AI**, **Codeium**, ou qualquer outro assistente de IA conectado ao seu repositório local. Seu objetivo é realizar uma **varredura automatizada, profunda, minuciosa e propositiva** de todo o código-fonte do projeto `melhorapp_final`, corrigindo proativamente qualquer falha detectada.

---

## 🚀 Instruções Gerais

> "Copilot, execute uma auditoria técnica completa e automatizada em todo o projeto atual. Analise cada arquivo e subdiretório existente no repositório: `app/`, `components/`, `features/`, `store/`, `services/`, `hooks/`, `validators/`, `types/`, `utils/`, `api/`, `styles/`, `public/`, `middleware.ts`, `tailwind.config.ts`, `tsconfig.json`, `.env*` e arquivos de configuração adicionais."

Durante a análise, **corrija automaticamente** onde for seguro, e **explique brevemente as alterações** se forem significativas. Se houver ambiguidade, **sugira múltiplas soluções possíveis** e indique o caminho preferido.

---

## ✅ Checklist de Diagnóstico e Correção

### 1. **Validação de Código e Tipagem**

- Identifique e corrija:

  - Erros de sintaxe, tipagem ou inferência incorreta em TypeScript
  - Props não utilizadas ou duplicadas em componentes React
  - Estados `undefined`, não inicializados, ou inputs "uncontrolled"
  - Hooks mal utilizados (`useEffect`, `useState`, `useSyncExternalStore`, etc.)
  - Condições mal tratadas (e.g. `if (!data) return null` onde `data` pode ser `0`)

### 2. **Verificação Arquitetural (Next.js + Zustand)**

- Verifique se:

  - Stores Zustand seguem **tipagem robusta** e são modulares
  - Componentes estão agrupados corretamente em `features/`
  - Há separação clara entre UI, lógica, e acesso a dados
  - `services/` são puramente responsáveis por comunicação externa/API
  - `app/api/` segue o padrão do App Router com `route.ts`

### 3. **Análise de Performance**

- Otimize:

  - Re-renderizações desnecessárias (sugira uso de `memo`, `useMemo`, `useCallback`)
  - Stores que atualizam muitos componentes com poucos dados (divida ou normalize estado)
  - Componentes grandes e monolíticos (sugira divisão e lazy loading se necessário)

### 4. **Boas Práticas e Consistência**

- Aponte e corrija:

  - Inconsistências em nomenclatura de arquivos, funções e variáveis
  - Estilização não padronizada (verifique aderência ao tema Dracula via Tailwind)
  - Uso incorreto ou faltante de `"use client"` em componentes client-side
  - Código repetido que pode ser extraído em helpers, hooks ou components reutilizáveis

### 5. **Segurança e Qualidade de Dados**

- Garanta que:

  - Nenhuma variável de `.env` sensível está exposta em `NEXT_PUBLIC_`
  - Inputs e dados de API são validados com `zod` ou equivalente
  - Role-based access control (`canEdit`, `isAdmin`) é aplicado corretamente
  - Não há hardcoded secrets, endpoints inseguros, ou lógica de autenticação exposta

### 6. **Infraestrutura e Configurações**

- Verifique e corrija:

  - `tsconfig.json` com `"strict": true` e paths bem definidos
  - `tailwind.config.ts` aplicando o tema Dracula corretamente com `hsl(var(...))`
  - `.env*` com variáveis bem documentadas, e sem segredos vazados
  - Scripts de build e deploy funcionais (`next build`, `lint`, `check`, `test`)

### 7. **Sugerir e Aplicar Refatorações Proativas**

- Sugira melhorias como:

  - Extração de lógica repetida para hooks personalizados
  - Reorganização de estrutura de pastas para maior clareza
  - Tipagem genérica em utilitários
  - Anotações JSDoc para gerar documentação automática

### 8. **Verificação de Estilo e Formatação**

- Verifique se o projeto está alinhado com:

  - ESLint + Prettier ativos e configurados
  - Imports organizados (grupos: libs externas, libs internas, locais)
  - Indentação consistente (2 espaços)
  - Arquivos `.tsx`, `.ts`, `.json`, `.md`, etc. bem formatados

---

## 📦 Requisitos Técnicos do Projeto

- **Framework:** Next.js 15 com App Router (pasta `app/`)
- **Estado global:** Zustand (`/store/*.ts`)
- **Estilo:** Tailwind CSS com tema Dracula personalizado via `tailwind.config.ts`
- **Organização:** Modular por features → `features/[modulo]/`
- **Back-end:** API Routes locais (App Router), opcionalmente SSR
- **Stack:** TypeScript estrito, UI reativa, rotas dinâmicas (`[eventId]`, etc.)

---

## 🛠️ Resultado Esperado da Análise

1. Correção automática de erros, com comentários no diff quando necessário
2. Listagem técnica de todos os ajustes aplicados ou sugeridos
3. Sumarização por arquivo alterado ou criticado
4. Sugestões de melhorias futuras (ex: CI, test coverage, etc.)

---

> **Copilot, após finalizar a análise, indique um sumário com:**
>
> - Arquivos que foram alterados automaticamente
> - Arquivos que requerem revisão manual (e o porquê)
> - Sugestões de melhorias arquiteturais futuras
> - Ações recomendadas para segurança, testes e performance

---

## ✨ Observação Final

Este prompt foi preparado para projetos profissionais com alta exigência de **qualidade, escalabilidade e manutenção**, especialmente dentro do ecossistema React/Next.js com uso intensivo de IA e colaboração audiovisual. Se necessário, você pode evoluí-lo com integração a CI/CD, GitHub Actions, SonarQube, ou análises de coverage.

Boa auditoria! 🧩
