# Task 01 — Corrigir a Dependência Invertida CLI → Combate

**Tipo:** refactor puro de movimentação e renomeação. **NENHUM comportamento pode mudar.**
**Depende de:** tarefa 00 concluída e commitada. Trabalhe em branch própria e abra pull request.

Leia antes de começar, nesta ordem: `AGENTS.md`, `tasks/README.md`, `docs/ARCHITECTURE.md`,
e as últimas 10 entradas de `docs/DECISIONS.md`.
Todo texto escrito no repositório deve estar em inglês, mesmo que este prompt esteja em português.

## Problema

`src/combat/` importa de `src/cli/`. A camada de orquestração de combate — que a cena Phaser
consome em produção — depende da camada de harness de terminal.

Consequência prática: os dados de conteúdo do jogo (fichas, atributos, perícias, ações, armas,
habilidades, presets de encontro) e a decisão de comportamento do inimigo moram dentro do CLI.
Isso contraria o `AGENTS.md`, que define `src/content/` como o lugar dos dados de conteúdo
tipados — e hoje `src/content/` tem um único arquivo.

Imports que comprovam o problema:

- `src/combat/combatSession.ts` linhas 13, 22, 28
- `src/combat/combatAttackRange.ts` linha 4
- `src/combat/combatSession.test.ts` linha 19
- `src/combat/combatAttackRange.test.ts` linha 5

Causa histórica: o CLI foi construído primeiro e foi o único consumidor por um período, então
acabou virando dono do conteúdo por acidente. Não é erro de design deliberado; é crescimento
orgânico sem verificação de fronteira.

## Direção de dependência correta

```
cli  ->  game  ->  combat / exploration / movement  ->  content  ->  rules
```

Nunca no sentido inverso. `src/rules/` permanece puro: sem Phaser, sem APIs de browser, sem
`src/game/`, sem `src/ui/`, sem `src/narrative/`.

## Movimentações de arquivo

| De | Para | Por quê |
| --- | --- | --- |
| `src/cli/combatCliPresets.ts` | `src/content/combatPresets.ts` | São dados de conteúdo e seus tipos/resolvers |
| `src/cli/combatCliResources.ts` | `src/combat/combatResources.ts` | É estado de runtime de combate, não conteúdo e não CLI |
| `src/cli/combatCliEnemyScript.ts` | `src/combat/enemyScript.ts` | É decisão de comportamento de inimigo, ou seja, orquestração de combate |

Mova os arquivos de teste correspondentes junto, preservando o pareamento lado a lado que o
projeto usa (`arquivo.ts` e `arquivo.test.ts` no mesmo diretório).

## Renomeação de símbolos

Regra mecânica única: **remova o segmento `Cli` / `CLI_` do identificador e preserve todo o
resto.** Não invente nomes fora dessa regra e não "melhore" nomes de passagem.

Exemplos:

- `CombatCliResolvedSheet` → `CombatResolvedSheet`
- `CombatCliResolvedWeapon` → `CombatResolvedWeapon`
- `CombatCliResolvedAction` → `CombatResolvedAction`
- `CombatCliResolvedAbility` → `CombatResolvedAbility`
- `CombatCliAttributeKey` → `CombatAttributeKey`
- `CombatCliSheetPreset` → `CombatSheetPreset`
- `COMBAT_CLI_ACTORS` → `COMBAT_ACTORS`
- `COMBAT_CLI_SKILL_DEFINITIONS` → `COMBAT_SKILL_DEFINITIONS`
- `COMBAT_CLI_ENCOUNTER_PRESETS` → `COMBAT_ENCOUNTER_PRESETS`
- `DEFAULT_COMBAT_CLI_ENCOUNTER_ID` → `DEFAULT_COMBAT_ENCOUNTER_ID`
- `getCombatCliEncounterPreset` → `getCombatEncounterPreset`
- `createCombatCliResourceState` → `createCombatResourceState`
- `getCombatCliEnemyScriptDecision` → `getEnemyScriptDecision`

Aplique a mesma regra a **todos** os símbolos exportados dos três arquivos, sem exceção.

## Regras duras

- **Não crie shims, aliases ou arquivos de re-export** em `src/cli/`. Atualize os imports reais
  de todos os consumidores, incluindo `src/cli/combatCli.ts` e
  `src/game/scenes/PrototypeScene.ts`.
- Não altere lógica, valores numéricos, assinaturas de função, formato de evento, ordem de
  operação ou qualquer texto exibido ao usuário.
- **Se algum teste precisar de mudança que vá além de import e nome de símbolo, PARE e reporte.**
  Não adapte o teste para fazer a tarefa passar.
- Não refatore `src/game/scenes/PrototypeScene.ts` além dos imports e nomes afetados. Aquele
  arquivo tem 1507 linhas e é alvo de uma tarefa futura própria; qualquer mexida extra aqui
  torna este pull request irrevisável.
- Não toque em `artifacts/`, `public/assets/`, nem em documentos de arte (`EXTERNAL_ART_*`,
  A6, A7).
- Não adicione conteúdo de IP oficial, conforme `AGENTS.md`.

## Critérios objetivos de aceite

1. Este comando retorna **vazio**:
   ```
   grep -rn "from '.*cli/" src --include=*.ts | grep -v "^src/cli/"
   ```
2. Nenhum identificador contendo `CombatCli` ou `COMBAT_CLI` permanece em `src/`.
3. A suíte continua com **exatamente 56 arquivos e 430 testes**, todos passando. Qualquer
   variação nesses números significa que comportamento mudou e a tarefa **falhou**.
4. `typecheck` passa.
5. `build` passa. Aviso de chunk acima de 500 kB é conhecido e aceitável.
6. `src/rules/` não ganhou nenhum import novo.

## Entrega

1. Acrescente uma entrada nova ao final de `docs/DECISIONS.md`, com o próximo número
   sequencial, seguindo exatamente o formato existente (`## NNNN: Título`, depois
   `Decision:` e `Reason:`). Registre a inversão corrigida e a direção de dependência agora
   vigente entre camadas.
2. Commit único, mensagem em inglês.
3. No relatório final liste: arquivos movidos, tabela completa de símbolos renomeados,
   consumidores atualizados, e a saída dos cinco comandos de validação.
