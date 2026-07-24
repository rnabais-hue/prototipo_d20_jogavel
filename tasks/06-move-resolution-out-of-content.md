# Task 06 — Mover a Resolução de Ficha Para Fora do Pack de Conteúdo

**Tipo:** refatoração de movimentação, preservando comportamento. Como a tarefa 01.
**Depende de:** tarefa 04 mergeada. Trabalhe em branch própria e abra pull request.

Leia antes de começar: `AGENTS.md`, `tasks/README.md`, `docs/ARCHITECTURE.md`
(seções "Engine and Content Pack" e "Dependency Direction"), e as decisões 0047 e 0050 em
`docs/DECISIONS.md`. Leia também `src/content/CONTEXT.md`, criado pela tarefa 04.
Todo texto escrito no repositório deve estar em inglês.

## Problema

`src/content/combatPresets.ts` contém **lógica de resolução**, não só dado:
`resolveCombatSheets`, `resolveCombatEncounterPreset`, `resolveCombatSheet` e o
`COMBAT_RESOLVED_SHEETS` avaliado ansiosamente calculam fichas resolvidas a partir dos presets.
Isso viola a decisão 0047, que define `src/content/` como dado puro, sem lógica. E força a
aresta `content -> combat`, porque a resolução importa `getCombatWeaponRangeProfile` e
`isCombatWeaponRangeBand` de `src/combat/combatWeaponRange.ts`.

A aresta foi identificada na tarefa 01, registrada na decisão 0050, e descopada da tarefa 04
para não misturar dois concerns num PR só.

## Trabalho

1. Mova a lógica de resolução de `src/content/combatPresets.ts` para um arquivo de motor novo,
   `src/combat/combatSheet.ts`: as funções `resolveCombat*`, os tipos `CombatResolved*`, e o
   `COMBAT_RESOLVED_SHEETS`. O que permanece em `src/content/combatPresets.ts` é **só dado e os
   tipos dos presets** — nenhuma função, nenhum import do motor.
2. Atualize todos os consumidores para importar os símbolos de resolução do novo local. Pelo
   menos estes importam por valor e vão precisar de ajuste de caminho:
   - `src/content/combatPresets.test.ts`
   - `src/combat/combatResources.test.ts`
   - `src/cli/combatCliOutcome.test.ts`
   - `src/cli/combatCliActions.test.ts`
   - `src/combat/combatSession.ts`
3. `src/content/combatPresets.test.ts` passa a exercitar lógica do motor; **mova o arquivo** para
   `src/combat/` (movimentação pura, sem alterar o corpo do teste) para que um teste em
   `src/content/` não teste resolução de motor.
4. Atualize `src/content/CONTEXT.md`: remova a linha de pendência sobre a resolução, que agora
   está resolvida.

## Regra sobre testes

Igual à tarefa 01, e diferente da 04: **ajuste de caminho de import e movimentação de arquivo de
teste são permitidos**, porque acompanham uma movimentação legítima de símbolo. O que continua
proibido é alterar o corpo de um teste ou uma asserção. Nenhum `expect` muda.

## Critérios objetivos de aceite

1. Este comando retorna vazio:
   ```
   grep -rn "^import" src/content/*.ts | grep -v "from './"
   ```
2. `src/content/combatPresets.ts` não contém nenhuma `function` nem `=>` de resolução — só dado
   e tipos.
3. A contagem de testes é a mesma da tarefa 04 (nenhum teste criado ou removido; um arquivo de
   teste apenas muda de pasta). Reporte o número.
4. `pnpm test`, `pnpm typecheck`, `pnpm build` passam (ou `npm run ...` se pnpm não estiver
   disponível no ambiente; reporte qual usou).
5. Nenhuma asserção de teste alterada.

## Entrega

Nova entrada em `docs/DECISIONS.md` registrando que a resolução de ficha saiu do pack e a aresta
`content -> combat` está fechada. Commit único, mensagem em inglês. Relatório com: símbolos
movidos, consumidores atualizados, arquivo de teste realocado, e a saída dos comandos de
verificação.
