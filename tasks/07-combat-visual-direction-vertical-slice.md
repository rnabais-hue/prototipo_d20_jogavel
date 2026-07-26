# Task 07: Combat Visual Direction Vertical Slice

## Status

Specification only. Do not execute until this file and decision 0057 have been reviewed and
merged to `master`.

## Objective

Replace the combat scene's painterly placeholder presentation with one small, coherent,
combat-only vertical slice of modular 16-bit-era top-down three-quarter pixel art.

The slice proves four concerns independently:

1. sharp integer-scaled rendering;
2. legible player and enemy scale;
3. readable frame-based motion and combat choreography;
4. a tilemap-composed arena.

The slice must also prove that one visible equipment change is data-driven. It is not a complete
equipment, character customization, exploration, or art-production system.

## Required reading

Read in this order before making any change:

1. `AGENTS.md`
2. `docs/ARCHITECTURE.md`
3. `tasks/README.md`
4. the last 12 entries of `docs/DECISIONS.md`, including decision 0057
5. this file
6. any `CONTEXT.md` in a `src/` directory touched by the implementation
7. `public/assets/README.md`
8. `public/assets/PROVENANCE.md`

Do not read other archive documents unless this task names them.

## Source asset gate

Use `16x16 DungeonTileset II` version 1.7 by 0x72 as the preferred base candidate for the
vertical slice:

- source: `https://0x72.itch.io/dungeontileset-ii`
- declared asset license: Creative Commons Zero v1.0 Universal
- native tile unit: 16 x 16 pixels
- source page declares that no generative AI was used

Before copying any runtime file:

1. download the original archive from the source page;
2. record its filename, version, download date, source URL, creator, declared license, and
   SHA-256 in `public/assets/PROVENANCE.md`;
3. inspect the archive and list the exact source files selected;
4. copy only files used by the slice, never the complete archive or demo;
5. record every crop, atlas repack, palette adjustment, filename change, or other derivative;
6. reject any supplementary asset whose page adds restrictions that conflict with its declared
   permissive license;
7. keep all art generic and free of protected setting expression, logos, and trademarks.

A different source may replace this candidate only through a reviewed amendment to this task.
The replacement must satisfy the same license and visual-contract requirements.

## Visual contract

Every runtime asset in this slice must declare or normalize:

- a 16 x 16 native pixel unit;
- top-down three-quarter perspective;
- integer display scale;
- integer world position;
- feet or ground-contact anchor;
- facing direction;
- frame dimensions and ordered animation frames;
- compatible outline weight, palette range, and lighting direction;
- provenance for the exact source and derivative.

A character appearance is data composed from generic visual slots:

- `body`
- `outfit`
- `mainHand`
- `offHand`
- `accessory`
- `effectSet`

The exact TypeScript shape and naming may differ, but it must remain generic. Production code
must not contain a conditional or lookup keyed by a literal archetype, class, weapon, armor, or
other content id. Adding a second appearance or swapping the demonstrated weapon must be a data
change after the generic visual shape exists.

All visible character layers must share facing, frame clock, anchor, depth policy, and motion
timeline. Do not build a full paper-doll editor, inventory system, or gameplay equipment
integration.

## Scope

Allowed production changes:

- `src/main.ts` render and scale configuration;
- `src/game/visual/` generic visual-profile, scale, animation, and choreography helpers;
- combat presentation helpers under `src/game/`;
- the minimum combat-scene orchestration required to use those helpers;
- combat-only Tiled JSON and the exact runtime art files under `public/assets/`;
- focused unit tests for pure presentation helpers;
- `public/assets/README.md` and `public/assets/PROVENANCE.md`;
- the minimum exploration layout compatibility required by the global 640 x 360 render change,
  without replacing exploration assets or redesigning exploration presentation.

Do not change:

- `src/rules/`;
- `src/content/`;
- `src/combat/`;
- `src/movement/`;
- `src/exploration/`;
- combat calculations, actor statistics, action availability, range, turn order, outcomes, or
  controls;
- package dependencies or either lockfile.

Do not introduce Spine, Rive, a new renderer, a runtime Tiled dependency, an inventory system,
character creation, equipment rules, audio, narrative content, or AI-generated runtime art.

## Acceptance criterion 1: sharp rendering

All of the following must hold:

- the logical game resolution is 640 x 360;
- `pixelArt` is `true`;
- `antialias` and `antialiasGL` are `false`;
- `roundPixels` is `true`;
- the displayed canvas is centered and uses an integer CSS scale;
- a 1280 x 720 viewport displays the 640 x 360 canvas at exactly 2x;
- a 1920 x 1080 viewport displays it at exactly 3x;
- cameras, tile layers, actor layers, and combat effects used by the slice have integer
  position and integer scale;
- no slice texture is reduced and subsequently enlarged in the runtime pipeline;
- browser captures at both reference viewports show hard pixel edges without interpolation.

## Acceptance criterion 2: actor legibility

All of the following must hold:

- neither combat actor uses the existing 256 x 256 generated-raster sheets;
- player and enemy use frames normalized to the visual contract;
- transparent padding is not used as the basis for display scale;
- ground-contact anchors remain on their logical combat cells;
- character art may extend above its occupied cell but does not visually drift between frames;
- player and enemy remain distinguishable in a full-scene capture without relying solely on
  labels, HP bars, team-colored rings, or the target reticle;
- one appearance is rendered from at least separate body/outfit and main-hand data;
- changing the demonstrated main-hand visual requires changing profile data only.

## Acceptance criterion 3: motion and choreography

All of the following must hold:

- the slice presents distinct `idle`, `movement`, `attack`, `hit`, and `defeat` states;
- every source frame selected for a demonstrated animation is used in its declared order;
- combat movement duration is proportional to traversed Manhattan distance using a constant
  duration per cell;
- an attack timeline emits or processes anticipation, contact, target reaction, and recovery in
  that order;
- damage flash, target recoil, and impact presentation begin at contact rather than at attack
  start;
- weapon and body layers remain synchronized through facing and frame changes;
- reduced-motion behavior remains supported;
- pure tests verify event order, duration-per-cell calculation, profile resolution, and layer
  synchronization without importing Phaser where a pure helper is sufficient.

## Acceptance criterion 4: tilemap arena

All of the following must hold:

- the combat arena is a `Phaser.Tilemaps.Tilemap` loaded from Tiled JSON;
- the map uses native 16 x 16 tiles at integer scale;
- it contains at least a ground layer, a boundary or obstacle layer, and a decoration or
  variation layer;
- no single environment painting is stretched across the arena;
- the selected player, enemy, floor, walls, and decoration share the visual contract;
- tile layers do not change logical combat-grid occupancy, range, movement, or collision;
- only combat presentation changes; exploration continues to render and behave as before.

## Verification

Run:

```text
pnpm test
pnpm typecheck
pnpm build
```

The 57 existing test files and 452 existing tests must continue to pass without deleted or
weakened mechanical assertions. Existing assertions that encode the explicitly superseded
painterly renderer settings or 800 x 450 layout may be replaced with assertions for decision
0057; no rules, content, combat, movement, or exploration behavior assertion may change. New
focused tests may increase the counts; record the final count in the closeout.

Also capture and review:

- combat at 1280 x 720;
- combat at 1920 x 1080;
- idle player and enemy;
- the demonstrated weapon swap;
- movement;
- attack anticipation;
- attack contact and target reaction;
- defeat;
- exploration after returning from combat, confirming that it remains playable and unclipped
  at the new logical resolution even though its art is not migrated in this task.

A human reviewer must approve the two full-scene reference captures before merge. Automated
tests cannot establish visual coherence by themselves.

## Completion hygiene

On completion:

- append the exact asset provenance and transformations;
- write a closeout named by the implementation PR;
- update `README.md` and `docs/MVP_SCOPE.md` in the same work;
- record the final test count;
- keep the repository private;
- open one pull request containing only this task.
