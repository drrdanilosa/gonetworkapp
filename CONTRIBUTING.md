# Contribuindo para o MelhorApp

Agradecemos seu interesse em contribuir para o MelhorApp! Este documento fornece diretrizes e instruções para contribuir com o projeto.

## Processo de Contribuição

1. Faça um fork do repositório
2. Clone seu fork: `git clone https://github.com/SEU-USUARIO/melhorapp_final02.git`
3. Crie uma branch para sua feature: `git checkout -b feature/nova-funcionalidade`
4. Faça as alterações desejadas
5. Teste suas alterações
6. Commit suas alterações: `git commit -m "feat: adiciona nova funcionalidade"`
7. Push para o GitHub: `git push origin feature/nova-funcionalidade`
8. Abra um Pull Request para o repositório original

## Convenções de Commit

Utilizamos convenções de commit para manter o histórico organizado e facilitar a geração automática de changelogs:

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alterações na documentação
- `style`: Alterações que não afetam o funcionamento do código (espaçamento, formatação, etc)
- `refactor`: Refatoração de código sem alterar funcionalidade
- `perf`: Melhorias de performance
- `test`: Adição ou correção de testes
- `chore`: Alterações em ferramentas de build, dependências, etc

Exemplo: `feat(briefing): adiciona funcionalidade de exportação em PDF`

## Padrões de Código

- **TypeScript**: Use tipagem adequada e evite `any`
- **React**: Componentes funcionais e hooks são preferidos
- **Estilos**: Use Tailwind CSS para estilização
- **Testes**: Adicione testes para novas funcionalidades quando possível

## Estrutura do Projeto

Ao adicionar novos arquivos, siga a estrutura existente:

- **Componentes**: Adicione em `/components` ou organize por domínio em `/features`
- **Hooks**: Adicione em `/hooks`
- **Tipos**: Defina tipos em `/types`
- **Store**: Lógica de estado em `/store`

## Executando Localmente

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev

# Executar linter
npm run lint

# Corrigir problemas de formatação
npm run format
```

## Perguntas?

Se você tiver dúvidas sobre como contribuir, abra uma issue ou entre em contato com os mantenedores.

Agradecemos antecipadamente por suas contribuições!
