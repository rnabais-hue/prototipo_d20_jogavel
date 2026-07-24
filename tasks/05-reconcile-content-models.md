# Task 05 — Reconcile the Parallel Content Models

**Type:** content-model refactor with an explicitly authorized attribute-data migration.
**Depends on:** tasks 04 and 06 completed. Work on a dedicated branch and leave it ready for
local review; this repository has no remote, so do not attempt to open or merge a pull request.

Before starting, read in this order:

1. `AGENTS.md`.
2. `docs/ARCHITECTURE.md`, especially "Engine and Content Pack", "Dependency Direction", and
   "Context Compartments".
3. `tasks/README.md`.
4. The last ten entries of `docs/DECISIONS.md`, through decision 0055.
5. `README.md`.
6. `src/content/CONTEXT.md`.
7. This task file.

Do not read the rest of `docs/` unless this task names a file. All text written to the
repository must be in English.

## Problem

The content pack still contains two parallel models:

- `src/content/combatPresets.ts` declares the six attributes, skills, combat sheets, actions,
  abilities, weapons, resources, and encounter presets used by the playable combat flow.
- `src/content/tacticalCatalogs.ts` declares ancestries, archetypes, attribute presets,
  features, equipment, and action definitions used by `buildTacticalParticipant`, but it uses a
  different four-attribute vocabulary.

The four-key vocabulary is also closed into the engine as:

```ts
export type AttributeKey = 'force' | 'agility' | 'mind' | 'presence';
```

That union in `src/rules/tacticalParticipant.ts` is the last known closed content-identifier
union identified by decision 0055. The two vocabularies can drift, and neither model by itself
contains all of the structure the project needs.

Decision 0055 already fixes the result. Do not revisit it:

- the canonical attribute declaration is the existing six-key
  `COMBAT_ATTRIBUTE_KEYS` data set;
- the four-key vocabulary is absorbed into that set;
- `AttributeKey` becomes `string`;
- ancestries, archetypes, attribute presets, features, equipment, and equipment-granted
  actions remain part of the unified model.

This task reconciles the model. It does not add character creation, progression, inventory,
new gameplay, or new content.

## Work

### 1. Use one canonical attribute declaration

`COMBAT_ATTRIBUTE_KEYS` in `src/content/combatPresets.ts` remains the only declaration of which
attribute keys exist in this content pack:

```text
strength
dexterity
constitution
intelligence
wisdom
charisma
```

Every combat sheet, attribute preset, ancestry modifier, archetype modifier, and equipment
modifier must use keys from that declaration. Do not create another attribute-key array, enum,
or literal union in `tacticalCatalogs.ts`, `tacticalParticipant.ts`, or elsewhere.

Physical file consolidation is not required. The two files may remain separate if that keeps
the data readable, but they must be parts of one model: one attribute declaration, one
reference graph, and one load-time validation gate. Do not move data merely to make the task
look complete.

### 2. Remove the last closed attribute identifier from the engine

In `src/rules/tacticalParticipant.ts`:

- change `AttributeKey` to `string`;
- make `AttributeSet` a string-keyed numeric record;
- keep `AttributeModifiers` as a partial set of numeric attribute entries;
- make `applyAttributeModifiers` work for arbitrary declared content keys without branching
  on or naming a specific key.

Do not weaken the closed unions that describe engine structure. In particular, action kinds,
equipment slots, participant status values, and encounter event types remain closed because a
new value in any of them requires engine behavior.

### 3. Migrate the four-key catalog data without changing its arithmetic

Apply this mechanical mapping to `mvpTacticalCatalogs` and to the affected rule tests:

| Old key | Canonical key |
| --- | --- |
| `force` | `strength` |
| `agility` | `dexterity` |
| `mind` | `intelligence` |
| `presence` | `charisma` |

Every complete attribute preset must contain all six canonical keys. Give `constitution` and
`wisdom` a base value of `0` where the old four-key preset had no corresponding axis. Do not
invent modifiers for those keys.

This mapping must preserve the existing arithmetic. For example, the current MVP participant
must resolve to:

```ts
{
  strength: 4,
  dexterity: 2,
  constitution: 0,
  intelligence: 1,
  wisdom: 0,
  charisma: 1,
}
```

Apply the same key mapping to alternate catalogs constructed in tests. This is the only
authorized observable data change in the task. Combat sheet values in `COMBAT_ACTORS` do not
change.

### 4. Preserve the richer catalog structure

The unified content model must retain all of these collections and relationships:

- ancestries with attribute modifiers and granted feature/action ids;
- archetypes with attribute modifiers, granted feature/action ids, and starting equipment ids;
- complete attribute presets;
- features;
- equipment with slots, attribute modifiers, and granted action ids;
- action definitions.

`buildTacticalParticipant` must continue to assemble ancestry, archetype, feature, equipment,
attribute, and action data with the same precedence, de-duplication, and structured missing-id
failure behavior. Equipment must continue granting actions by id.

Do not replace these collections with the fixed actors in `COMBAT_ACTORS`, and do not derive or
rewrite the playable combat sheets in this task. The fixed combat presets and the extensible
catalog structure are different views of the same content pack, not substitutes for each
other.

### 5. Validate the unified reference graph at pack load

Extend the existing pure pack validation so the load-time gate covers both the combat preset
data and the retained catalog structure. Keep the validator in `src/rules/`; it must remain
content-id agnostic, deterministic, non-throwing, and free of `console` and browser APIs. The
content module remains responsible for turning an invalid structured result into one legible
load-time error.

In addition to the checks already implemented, validation must report at least:

- an unknown attribute key in an attribute preset or any ancestry, archetype, or equipment
  modifier;
- a complete attribute preset that is missing a declared canonical key;
- an unknown feature id granted by an ancestry or archetype;
- an unknown equipment id listed as archetype starting equipment;
- an unknown action id granted by an ancestry, archetype, or equipment;
- a duplicate id in ancestries, archetypes, attribute presets, features, equipment, or action
  definitions.

Use structured issues containing the offending id, its scope, and a reason. Extend the
validator tests with one focused case for each new failure class and a valid unified-pack case.
Do not hard-code any of the six canonical key values in the validator; they must be supplied as
data.

There must be one effective load-time gate for the unified pack. Do not leave one independent
validation path for `combatPresets.ts` and another for `tacticalCatalogs.ts`.

**Circular-import hazard — read before implementing this section.** The canonical key
declaration `COMBAT_ATTRIBUTE_KEYS` lives in `combatPresets.ts`, the catalogs live in
`tacticalCatalogs.ts`, and the gate is evaluated eagerly in a module body. If the gate module
imports the other file *and* that file imports back, the cycle can leave one side `undefined` at
load, producing a failure that looks like invalid data rather than an import loop. Keep the
dependency between the two content files strictly one-directional, or place the gate in a third
content module that imports both. Whichever you choose, state it in the report.

### 6. Update the content compartment

Update `src/content/CONTEXT.md`, keeping it at 60 lines or fewer. It must describe the
reconciled model and tell a cold agent where to:

- add or modify an attribute;
- add an ancestry, archetype, feature, or equipment entry;
- connect equipment to an action by id;
- add combat skills, actors, abilities, and encounters;
- find the single load-time validation gate.

The instructions must not imply that the four-key vocabulary still exists.

## Hard Rules

- Do not revisit the six-attribute choice in decision 0055.
- Do not add, remove, or rename any existing ancestry, archetype, feature, equipment, action,
  skill, ability, actor, or encounter id.
- Do not change combat actor numbers, labels, ranges, costs, defenses, actions, or encounter
  composition.
- Do not add character creation, inventory, progression, UI, Phaser behavior, or public
  distribution work.
- Do not move resolution logic back into `src/content/`.
- Do not introduce a dependency from `src/content/` to an orchestration or presentation layer.
- Do not add a dependency or modify either lockfile or dependency declarations.
- Do not create a new archive document under `docs/`.

## Test-Change Rule

Existing assertions may change only where an expected four-key attribute object is mechanically
rewritten to the mapped six-key object above. Import paths may change only if a content data
export is moved or renamed as part of the reconciliation. No combat, damage, encounter,
resource, range, turn-order, or presentation expectation may change.

The baseline is **57 test files and 442 tests**. This task may increase the test count only with
new focused validation tests required by section 5. It may not remove or skip a test, and it
may not reduce either baseline number. Report the final file and test counts.

## Objective Acceptance Criteria

1. `AttributeKey` is `string`, `AttributeSet` is string-keyed, and no closed literal union of
   attribute identifiers remains anywhere in the engine.
2. The absorbed four-key vocabulary is gone from production code **and from test data**. Both
   commands must return nothing. Verified against the current tree: together they report
   exactly the eight lines this task exists to migrate, so anything left over is a real miss.
   ```bash
   rg -n "\b(force|agility|mind|presence)\b" src/content src/rules/tacticalParticipant.ts --glob "*.ts"
   rg -n "\b(force|agility|mind|presence)\b" src/rules/tacticalParticipant.test.ts
   ```
   The second command matters because `AttributeKey` is now `string`: a four-key object left in
   an alternate test catalog still typechecks, so the compiler will not catch it for you.
3. `COMBAT_ATTRIBUTE_KEYS` remains exactly the six-key canonical declaration from decision
   0055, and no second attribute-key declaration exists.
4. Every complete attribute preset contains exactly the six declared keys. Every attribute
   modifier and every combat attribute reference is accepted against that same declaration.
5. The MVP participant resolves to the mapped six-key object specified in section 3, and the
   existing alternate-catalog test still proves that the engine does not depend on MVP ids.
6. Ancestries, archetypes, attribute presets, features, equipment, action definitions, and all
   grant/start relationships listed in section 4 remain present and are exercised by tests.
7. The unified load-time validator reports every failure class listed in section 5, returns no
   issues for the real pack, names no specific content id in engine production code, and has one
   effective content-pack call site.
8. No file under `src/content/` imports from `src/combat/`, `src/game/`, `src/ui/`,
   `src/exploration/`, `src/movement/`, Phaser, or a browser API.
9. `src/content/CONTEXT.md` is accurate and has no more than 60 lines.
10. The validation gate passes:
    ```bash
    pnpm test
    pnpm typecheck
    pnpm build
    ```
    If pnpm or corepack is unavailable, use `npm run test`, `npm run typecheck`, and
    `npm run build` and report that fallback. Do not change dependencies or lockfiles.
11. The final suite has at least 57 files and 442 tests; any increase consists only of the new
    validator coverage authorized above. No test is skipped or removed.

If any criterion conflicts with the current tree or with another criterion, stop and report
the collision with file-and-line evidence. Do not alter a test, weaken a criterion, or invent a
workaround.

## Delivery

1. Append the next numbered entry to `docs/DECISIONS.md`, following its existing
   `Decision:` / `Reason:` format. Record the completed reconciliation, the six-key migration,
   preservation of the richer catalogs, and the unified validation gate. Do not restate or
   supersede decision 0055.
2. Make one commit with an English message on the task branch. Do not merge it.
3. In the final report, include:
   - the files changed;
   - the old-to-canonical attribute mapping and final MVP participant attributes;
   - the retained catalog structures and relationships;
   - every validation class added;
   - confirmation that combat preset values did not change;
   - final test file/test counts;
   - the package manager used and the results of test, typecheck, and build.
