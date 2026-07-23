# Task 04 — Identificadores de Conteúdo Viram Dado

**Tipo:** cirurgia de tipos, preservando comportamento.
**Depende de:** tarefa 01 mergeada (o conteúdo já precisa estar em `src/content/`).
Trabalhe em branch própria e abra pull request.

Leia antes de começar: `AGENTS.md` (a regra de IP foi reescrita — leia a versão atual),
`docs/ARCHITECTURE.md` seções "Engine and Content Pack" e "Context Compartments",
`tasks/README.md`, e as decisões **0047**, **0048** e **0049** em `docs/DECISIONS.md`.
Todo texto escrito no repositório deve estar em inglês, mesmo que este prompt esteja em português.

## Problema

O conteúdo do jogo está travado no sistema de tipos. Em `src/content/combatPresets.ts`
(originalmente `src/cli/combatCliPresets.ts`, movido pela tarefa 01):

```ts
export type CombatAttributeKey =
  | 'strength' | 'dexterity' | 'constitution'
  | 'intelligence' | 'wisdom' | 'charisma';

export type CombatSkillId = 'melee';
```

São conjuntos **fechados**. Adicionar a perícia "pontaria" hoje não é acrescentar dado: é
editar um tipo e propagar a mudança por todos os consumidores. `CombatSkillId` é uma união de
um membro só — ou seja, o modelo de perícias não é um modelo, é uma constante.

Isso viola a decisão 0048 e impede tanto a escalabilidade de conteúdo quanto a separação entre
motor e pack de conteúdo exigida pela decisão 0047.

Note que existe um segundo modelo de conteúdo em `src/content/tacticalCatalogs.ts`, com quatro
atributos de nomes diferentes. **Esta tarefa não reconcilia os dois modelos** — isso é a tarefa
05. Aqui você apenas remove o travamento de tipos do modelo que hoje move o combate.

## Trabalho

### 1. Identificadores viram `string`

Converta para `string`, no nível do tipo, todos os identificadores de conteúdo:

- `CombatAttributeKey` → `string`
- `CombatSkillId` → `string`
- qualquer outro identificador de conteúdo que hoje seja união literal

`CombatAttributeSet` deixa de ser `Record<CombatAttributeKey, number>` e passa a ser
`Record<string, number>`.

**Não converta** uniões literais que descrevem *estrutura do motor* em vez de conteúdo.
Exemplos que devem permanecer fechados: `kind: 'offensive' | 'defensive'`, `kind: 'main'`,
`slot: 'main_hand' | 'off_hand'`, faixas de alcance de arma, e os `type` de evento de encontro.
A distinção é: se um autor de conteúdo precisaria acrescentar um valor novo, é conteúdo e vira
`string`; se acrescentar um valor exigiria lógica nova no motor, é estrutura e continua fechado.
Em caso de dúvida, pare e pergunte — não decida sozinho.

### 2. O pack declara o que existe

Em `src/content/`, declare explicitamente como dado:

- o conjunto de chaves de atributo válidas (hoje seis: `strength`, `dexterity`, `constitution`,
  `intelligence`, `wisdom`, `charisma`) — como dado, **não** como tipo;
- as definições de perícia, que já existem como dado em `COMBAT_SKILL_DEFINITIONS`.

Mantenha os mesmos valores e os mesmos nomes. Nada de comportamento muda nesta tarefa.

### 3. Validação em tempo de carga

Crie uma função pura de validação do pack de conteúdo, com testes próprios. Ela substitui a
garantia que o compilador dava, e deve verificar no mínimo:

- toda `attributeKey` referenciada por perícia, defesa, ação ou dano existe no conjunto de
  atributos declarado;
- todo `skillId` referenciado por uma ação existe nas definições de perícia;
- todo `weaponId` referenciado por uma ação existe entre as armas da ficha;
- todo `resourceId` referenciado por custo de habilidade existe entre os recursos da ficha;
- não há identificadores duplicados dentro de uma mesma coleção.

Ela retorna resultado estruturado — lista de erros com identificador e motivo — no mesmo estilo
dos resultados estruturados que o projeto já usa em `src/rules/`. **Não lance exceção** e não
use `console`.

Coloque-a onde ela é pura e testável, coerente com as fronteiras de `docs/ARCHITECTURE.md`.
Ela é cálculo determinístico sobre dado, não orquestração.

Chame a validação nos pontos onde o pack é resolvido, de modo que um pack inválido falhe de
forma explícita e legível em vez de produzir `NaN` ou `undefined` silencioso.

### 4. Contexto do compartimento

Crie `src/content/CONTEXT.md`, no máximo 60 linhas, em inglês, seguindo a decisão 0049.
Deve responder exatamente cinco perguntas:

1. Do que este diretório é responsável.
2. O que ele pode importar e o que nunca pode.
3. **Como adicionar uma perícia, um atributo e uma habilidade nova** — concreto, passo a passo,
   com o caminho do arquivo.
4. Onde está um exemplo representativo.
5. O que aqui exige decisão humana e não de agente.

Este arquivo é o teste da tarefa inteira: se depois dele um agente ainda precisa ler o motor
para adicionar conteúdo, a tarefa não atingiu o objetivo.

## Regras duras

- Nenhuma mudança de comportamento observável. Mesmos valores, mesmos cálculos, mesma saída.
- Não reconcilie `tacticalCatalogs.ts` com `combatPresets.ts`. Tarefa 05.
- Não renomeie atributos, perícias, ações ou habilidades existentes.
- Não altere `src/game/scenes/PrototypeScene.ts` além do necessário para os tipos.
- Não adicione dependência nova.
- Não crie arquivo novo em `docs/`.

## Critérios objetivos de aceite

1. Nenhuma união literal de identificador de conteúdo permanece em `src/`. Em particular,
   `CombatAttributeKey` e `CombatSkillId` não são mais uniões fechadas.
2. Fora de `src/content/`, o motor não menciona nenhum identificador de conteúdo literal. Estes
   comandos devem retornar vazio:
   ```
   grep -rn "'strength'\|'dexterity'\|'constitution'\|'intelligence'\|'wisdom'\|'charisma'" src --include=*.ts | grep -v "^src/content/"
   grep -rn "'melee'" src --include=*.ts | grep -v "^src/content/"
   ```
   Testes que precisem de um id concreto devem obtê-lo do pack de conteúdo ou de uma fixture,
   nunca escrevê-lo literalmente.
3. **Os 430 testes existentes continuam passando.** Esta tarefa **está autorizada** a aumentar
   a contagem, exclusivamente com os testes novos da função de validação. Nenhum teste
   existente pode ser alterado, exceto por nome de tipo. Reporte a nova contagem.
4. `typecheck` passa.
5. `build` passa.
6. `src/content/CONTEXT.md` existe, tem no máximo 60 linhas, e um leitor que só leia esse
   arquivo consegue adicionar uma perícia nova sem abrir mais nada.

## Entrega

1. Nova entrada em `docs/DECISIONS.md` no formato existente, registrando a conversão e a
   validação de pack em tempo de carga.
2. Commit único, mensagem em inglês.
3. No relatório final: lista de tipos convertidos, lista dos que você deliberadamente manteve
   fechados **com a justificativa de cada um**, o que a validação cobre, contagem final de
   testes, e a saída dos comandos de verificação.
