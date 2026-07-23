# Task 02 — Sincronizar a Documentação com a Realidade

**Tipo:** SOMENTE documentação. **Não crie, altere ou apague nenhum arquivo em `src/`.**
**Depende de:** tarefa 01 concluída e mergeada — caso contrário a documentação descreveria uma
estrutura de pastas que está prestes a mudar. Trabalhe em branch própria e abra pull request.

Leia antes de começar: `AGENTS.md`, `tasks/README.md`, `docs/CODEX_WORKFLOW.md` — que contém a
regra "Do not create gameplay code while doing documentation-only tasks".
Todo texto escrito no repositório deve estar em inglês, mesmo que este prompt esteja em português.

## Problema

Os documentos de estado atual fossilizaram. Eles descrevem um projeto que não existe mais, e
um leitor novo — humano ou agente — é ativamente induzido ao erro por eles.

Evidências verificadas:

- `README.md` afirma `"No exploration-to-combat integration ... is implemented yet"`. É falso:
  a integração foi fechada em `docs/EXPLORATION_COMBAT_INTEGRATION_CLOSEOUT_V1.md`.
- `README.md` lista controles obsoletos. Diz que `E` e `C` alternam entre exploração e combate,
  mas a decisão 0042 removeu essas teclas. Diz que `1` resolve "a próxima ação planejada",
  quando a decisão 0045 estabeleceu o menu numérico `1` / `2` / `3` / `0`.
- `README.md` não menciona o script `combat:cli`, que existe em `package.json`.
- `README.md` lista 9 documentos em `docs/`, que hoje tem mais de 40.
- `docs/MVP_SCOPE.md` lista combate, iniciativa, dano, inimigos, sistemas de personagem,
  movimento, click-to-move e interação de grid como **fora do escopo**. Todos estão
  implementados, testados e fechados.

## Trabalho

1. Reescreva a seção "Current MVP Status" do `README.md` para o estado real. **Verifique cada
   afirmação contra o código em `src/` e contra os closeouts em `docs/`.** Não copie a lista de
   evidências deste prompt como se fosse a resposta: ela indica onde olhar, não o que escrever.
2. Corrija as seções de controles do `README.md` conforme as decisões 0042 a 0046 e conforme o
   que está efetivamente registrado em `src/game/scenes/PrototypeScene.ts`. Em caso de
   divergência entre documento e código, **o código é a verdade**.
3. Acrescente o script `combat:cli` à seção de comandos, com o invocador de pacote correto
   definido na tarefa 00.
4. Substitua a lista fixa de documentos por uma orientação de leitura: quais ler primeiro
   (`AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`) e como encontrar o resto por
   convenção de nome (`*_DESIGN_CUT_V0` e `*_CLOSEOUT_V*` por fatia; `EXTERNAL_ART_*` para a
   trilha de arte). Deixe explícito que `docs/` passa de 250 KB e que a leitura integral não é
   esperada nem desejada.
5. Atualize `docs/MVP_SCOPE.md`: mova para "dentro do escopo" tudo que já foi implementado e
   fechado, cada item apontando para o closeout que o fechou. Mantenha em "fora do escopo"
   apenas o que continua realmente fora.
6. Acrescente ao `AGENTS.md`, na seção "Change Hygiene", uma regra nova: **ao fechar qualquer
   milestone, atualizar o estado atual em `README.md` e `docs/MVP_SCOPE.md` no mesmo trabalho.**
   Este item é o que impede o problema de voltar a acontecer e não pode ser omitido.
7. Registre uma entrada nova em `docs/DECISIONS.md`, no formato existente, estabelecendo
   `README.md` e `docs/MVP_SCOPE.md` como as fontes de verdade do estado atual, mantidas a cada
   closeout.

## Restrições

- **Não crie nenhum arquivo novo em `docs/`.** O projeto já tem excesso de documentação; a
  correção é manter em dia o que existe, não somar mais um documento.
- Não reescreva, resuma ou "atualize" os closeouts históricos. São registro de época e ficam
  exatamente como estão.
- Não altere documentos de arte (`EXTERNAL_ART_*`, A6, A7) nem `public/assets/PROVENANCE.md`.
- Não invente estado que você não verificou diretamente no código.
- Não altere nada em `src/`. Se durante a verificação você encontrar um bug ou inconsistência
  no código, **reporte no relatório final e não corrija** — vira tarefa própria.

## Critérios objetivos de aceite

1. Nenhum arquivo em `src/` foi modificado (`git diff --stat` não mostra `src/`).
2. Nenhum arquivo novo em `docs/`.
3. Toda afirmação de estado no `README.md` é rastreável a um arquivo de código ou a um
   closeout, e você consegue citar qual.
4. A suíte de testes continua com 56 arquivos e 430 testes — nada deveria tê-la afetado.

## Entrega

Commit único, mensagem em inglês. No relatório final, liste cada afirmação falsa que foi
corrigida e como foi verificada, além de qualquer inconsistência de código encontrada e
deixada intocada.
