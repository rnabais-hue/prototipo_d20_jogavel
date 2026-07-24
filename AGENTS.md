# Agent Instructions

This repository is a local and private **custom d20-inspired tactical RPG prototype**.

## Non-Negotiable IP Rule

This project targets **mechanical compatibility** with an existing published d20-derived
tabletop system, while sharing none of its protected expression. Compatibility is achieved by
reimplementation, never by reproduction.

### Engine and content pack are separate

The **engine** is every layer except `src/content/`. It must contain no term, identifier,
constant, comment or displayed string specific to any published system. The engine does not
know which system it is running. It is publishable on its own.

The **content pack** is `src/content/`. It is data only, no logic. System-compatible values
live here and nowhere else.

An engine that cannot run a completely different ruleset by swapping `src/content/` has failed
this rule.

### Always forbidden

- Verbatim rules text, tables, stat blocks, adventure text or descriptions from any published
  work, in any language, including translated or lightly paraphrased text.
- Setting content: character names, place names, organizations, deities, factions, cosmology,
  timeline, lore.
- Trademarks, logos, product names, edition names, publisher names.
- Official art, or art derived from official art.

### Allowed

- Mechanical structure and procedure, reimplemented from scratch and expressed in this
  project's own wording: attribute-plus-modifier resolution, degrees of training, action
  economy, damage application, and similar generic d20-lineage constructs.
- Generic functional identifiers used as data keys.
- Original placeholder content of any kind.

If a task cannot be completed without reproducing protected expression, stop and report. Do not
paraphrase your way around this rule.

### Distribution

This repository is **private and non-commercial**, and stays that way until the project owner
decides otherwise in writing. Do not add publishing configuration, public deployment, package
registry metadata, or public build targets.

The reason is specific and verified: the publisher's open license covers static text media and
expressly excludes applications and dynamic media, so it does not authorize distributing a
video game. Private, non-commercial use among a small group falls outside the license's
restrictions, which is where this project sits today. Any change to distribution is a decision
for the project owner, not for an agent, and requires its own entry in `docs/DECISIONS.md`.

## Scope Discipline

Keep the MVP small. Do not implement features unless the user asks for them in the current task.

Do not implement any of the following unless explicitly requested:

- Combat systems.
- Movement systems.
- Narrative systems.
- Powers, abilities, spells, feats, or class features.
- Grid logic.
- Click-to-move.
- Inventory.
- Playable character systems.
- Lore or setting content.
- Complex assets.

## Architecture Rules

Keep pure rules separate from Phaser and presentation layers.

`src/rules/` must not depend on:

- Phaser.
- `src/game/`.
- `src/ui/`.
- `src/narrative/`.
- Browser-only APIs.

Allowed dependency direction should move inward toward pure rules and content, not outward from rules into UI/game implementation.

## Expected Layers

- `src/rules/`: pure deterministic rules and calculations.
- `src/content/`: typed custom content data, no official IP.
- `src/game/`: Phaser bootstrapping, scenes, adapters, rendering orchestration.
- `src/exploration/`: future exploration orchestration.
- `src/combat/`: future combat orchestration.
- `src/movement/`: future movement orchestration.
- `src/narrative/`: future narrative orchestration.
- `src/ui/`: future UI components and presentation state.

## Validation

This project uses **pnpm**, pinned in `package.json` under `packageManager` and enabled with
`corepack enable`. Before completion, run when relevant:

```bash
pnpm test
pnpm typecheck
pnpm build
```

If the local environment lacks pnpm or corepack, explain the limitation and validate with the
available local runtime when possible.

## Change Hygiene

- Do not create gameplay code while doing documentation-only tasks.
- Do not mix Phaser into `src/rules/`.
- Keep changes small and traceable.
- Add tests for pure rules when rules are introduced later.
- Update `docs/DECISIONS.md` when making an architectural decision.
- When closing any milestone, update the current state in `README.md` and `docs/MVP_SCOPE.md` in
  the same piece of work. A closeout that leaves those two documents describing the previous
  state is not finished. They are the current-state documents; everything else in `docs/` is
  historical record and is never edited after the fact.
