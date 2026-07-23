# Task 03 — Integração Contínua (Enforcement Mecânico)

**Tipo:** infraestrutura. **Não altere código de jogo nem documentação de produto.**
**Depende de:** tarefa 00 concluída e repositório já conectado a um remote no GitHub.
**Status:** proposta. Execute apenas se o autor do projeto confirmar.

Leia antes de começar: `AGENTS.md`, `tasks/README.md`.
Todo texto escrito no repositório deve estar em inglês, mesmo que este prompt esteja em português.

## Justificativa

Este projeto é desenvolvido por rotação entre múltiplos modelos de IA. A disciplina hoje é
mantida por documentos — `AGENTS.md`, `docs/CODEX_WORKFLOW.md`, os arquivos em `tasks/`. O
problema é que documento é **advisório**: um modelo pode não lê-lo, lê-lo parcialmente, ou
racionalizar uma exceção. Já existe prova empírica disso dentro do próprio repositório — o
`README.md` descreve um estado que deixou de ser verdade há semanas, apesar de a regra de
mantê-lo atualizado ser óbvia.

Integração contínua é **vinculante**. Um pull request vermelho não pode ser racionalizado.
Para uma estratégia multi-modelo, esse é o único mecanismo que garante que o baseline de
qualidade não depende de qual modelo executou a tarefa.

## Trabalho

1. Crie um workflow do GitHub Actions em `.github/workflows/ci.yml` que rode em `pull_request`
   e em push para a branch principal.
2. O workflow deve:
   - usar a versão de Node declarada em `engines` / `.nvmrc` (não fixe um número solto que
     possa divergir);
   - ativar o pnpm na versão fixada em `packageManager`;
   - instalar com o lockfile **congelado** — a instalação deve falhar se `pnpm-lock.yaml`
     estiver dessincronizado do `package.json`;
   - rodar, nesta ordem: testes, typecheck, build;
   - usar cache de dependências para manter o tempo de execução razoável.
3. Adicione ao `README.md` uma menção de uma linha ao gate de CI, na seção de comandos.
4. Não adicione linter, formatter, cobertura de código, publicação de artefato, deploy,
   matriz de sistemas operacionais ou qualquer outro passo. O escopo é exatamente reproduzir o
   gate de validação que já existe hoje.

## Restrições

- Nenhuma alteração em `src/`, `docs/` (exceto a linha no `README.md`), `artifacts/`, `public/`.
- Não altere versões de dependência e não regenere o lockfile.
- Não configure secrets, permissões elevadas, nem workflows que escrevam no repositório.

## Critérios objetivos de aceite

1. O workflow roda com sucesso em um pull request de teste.
2. Os três passos aparecem separadamente no log, com resultado individual visível.
3. A suíte reportada pela CI é de **56 arquivos e 430 testes**, coerente com o ambiente local.
4. `pnpm-lock.yaml` permanece byte a byte idêntico.

## Entrega

Commit único, mensagem em inglês. Relate o tempo de execução do workflow, a versão de Node
efetivamente usada, e a saída dos três passos.
