# Task 00 — Version Control and Reproducible Toolchain

**Tipo:** infraestrutura. **Não altere lógica de jogo.**
**Depende de:** nada. Esta é a primeira tarefa.

Leia antes de começar: `AGENTS.md`, `tasks/README.md`.
Todo texto escrito no repositório deve estar em inglês, mesmo que este prompt esteja em português.

## Contexto

Protótipo local e privado de RPG tático inspirado em d20, em TypeScript + Phaser 3 + Vite +
Vitest. Aproximadamente 13.400 linhas de código-fonte, 8.700 linhas de teste, 147 arquivos
TypeScript, mais de 40 documentos em `docs/` e pacotes de prova de arte com proveniência em
`artifacts/`.

O projeto **não está sob controle de versão** e o toolchain não é reproduzível fora da máquina
de origem. As duas coisas precisam ser resolvidas antes de qualquer refactor.

## Arquivos que você PODE alterar ou criar

Estritamente estes. Qualquer outro arquivo é proibido nesta tarefa:

- `.gitignore` (criar)
- `.gitattributes` (criar)
- `.nvmrc` (criar)
- `package.json` (somente adicionar os campos `packageManager` e `engines`)
- `README.md`, `AGENTS.md`, `docs/CODEX_WORKFLOW.md` — **somente** as linhas de invocação de
  comando, se o passo 2 exigir. Não altere nenhum outro conteúdo desses arquivos: a correção
  do estado descrito neles é a tarefa 02 e não pode ser antecipada aqui.

Não toque em `src/`, `docs/` (exceto a exceção acima), `artifacts/`, `public/`.

## Passo 1 — Controle de versão

1. Crie `.gitignore` cobrindo, no mínimo: `node_modules/`, `dist/`, `.pnpm-store/`, `*.log`,
   e arquivos de ambiente local.
2. **Não ignore** `artifacts/` nem `public/assets/`. Contêm pacotes de prova de arte com
   proveniência documentada e hashes SHA-256; o histórico deles é parte do valor do projeto.
   São cerca de 32 MB no total, dentro do confortável para git puro. Não configure Git LFS.
3. Crie `.gitattributes` na raiz contendo `* text=auto`. O projeto é desenvolvido no Windows e
   editado por múltiplos agentes; sem isso, diferenças de CRLF/LF produzem diffs de arquivo
   inteiro que inviabilizam a revisão de pull request.
4. Rode `git init`.
5. Faça **um único** commit inicial com todo o estado atual. Mensagem em inglês, descrevendo
   honestamente o baseline: protótipo com núcleo de regras puro, exploração, combate, harness
   de CLI e trilha de arte A1–A7 com A6 fechado e A7 aguardando decisão humana.
6. Não crie branches, tags, remotes ou hooks. O remote será configurado manualmente pelo autor
   do projeto depois desta tarefa.

## Passo 2 — Toolchain reproduzível

Problema atual, verificado: existe `pnpm-lock.yaml` e `pnpm-workspace.yaml`, e `package.json`
tem um campo `pnpm.onlyBuiltDependencies`. Porém todos os scripts e documentos instruem
`npm run ...`, e **não existe `package-lock.json`**. O npm ignora lockfile do pnpm. Não há
campo `engines`, nem `packageManager`, nem `.nvmrc`. O Node da máquina de origem é v26.4.0.

Consequência: um clone novo, em outra máquina ou em ambiente de nuvem, resolve as versões de
dependência do zero e pode divergir do estado que hoje produz 430 testes verdes.

**Decisão já tomada pelo autor: padronizar em pnpm.** O motivo é que `pnpm-lock.yaml` é o
lockfile que produziu o estado atual funcional; migrar para npm exigiria re-resolver todas as
dependências e descartar essa garantia. Não reabra essa decisão.

Execute:

1. Adicione `"packageManager"` ao `package.json`, fixando pnpm em uma versão exata (formato
   `pnpm@<versão>`). Verifique qual versão é compatível com o `pnpm-lock.yaml` existente e
   **não regenere o lockfile**.
2. Adicione `"engines"` ao `package.json` declarando a faixa de Node suportada. Confirme que a
   faixa escolhida é suportada por Vite 6 e Vitest 3 antes de escrevê-la. Considere que a
   máquina de origem roda Node v26.4.0.
3. Crie `.nvmrc` coerente com `engines`.
4. Verifique se `corepack` está disponível neste ambiente Node. Se estiver, é o mecanismo
   preferido para ativar o pnpm fixado; se não estiver, documente a instalação global como
   alternativa. **Relate explicitamente qual dos dois caminhos você verificou e usou** — não
   presuma.
5. Atualize as linhas de comando em `README.md`, `AGENTS.md` e `docs/CODEX_WORKFLOW.md` de
   `npm run ...` para o invocador correto do pnpm. Apenas as linhas de comando.

**Proibido:** alterar qualquer versão de dependência, rodar update, regenerar lockfile, ou
adicionar/remover pacotes.

## Critérios objetivos de aceite

1. `git status` limpo após o commit inicial; `node_modules/`, `dist/` e `.pnpm-store/` fora do
   commit.
2. A suíte de testes continua com **exatamente 56 arquivos e 430 testes**, todos passando.
3. `typecheck` passa.
4. `build` passa. Aviso de chunk acima de 500 kB é conhecido e aceitável.
5. `pnpm-lock.yaml` está **byte a byte idêntico** ao estado anterior à tarefa.
6. Nenhum arquivo em `src/` foi modificado.

## Entrega

Relate: quantos arquivos entraram no commit inicial, tamanho do repositório, versão de Node e
pnpm declaradas e como foram verificadas, se corepack estava disponível, e o resultado dos
quatro comandos de validação. Se qualquer critério falhar, pare e reporte em vez de contornar.
