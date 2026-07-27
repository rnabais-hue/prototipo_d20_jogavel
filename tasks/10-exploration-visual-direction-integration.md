# Task 10: Exploration Visual Direction Integration

## Status

Specification only. Do not execute until this file has been reviewed and merged to `master`.

Tasks 07 through 09 are complete. This task applies the approved visual direction and modular
character model to exploration without reopening either direction.

In this task, the **main screen** means the exploration screen shown before combat and restored
after combat. It does not mean a title screen, main menu, launcher, or new application mode.

## Objective

Replace the earlier painterly and debug-placeholder exploration presentation with one coherent
native-pixel environment in the approved 16-bit-era top-down three-quarter direction.

The result must:

1. present the existing exploration map cleanly at the established `640 x 360` logical
   resolution and integer display scale;
2. keep the existing exploration map, state, movement, interactions, objective, combat entry,
   and combat return behavior unchanged;
3. show the same generic modular player appearance before, during, and after combat;
4. make cells, routes, interaction points, and world-state changes readable without making the
   exploration screen look like a debug harness; and
5. keep future free or commercial asset replacements behind provider-neutral catalog,
   appearance, and rendering data.

This is a presentation integration task. It is not a new exploration system, map, menu,
character system, content feature, or asset-authoring pipeline.

## Required reading

Read in this order before making any implementation change:

1. `AGENTS.md`
2. `docs/ARCHITECTURE.md`
3. `tasks/README.md`
4. the last 12 entries of `docs/DECISIONS.md`, including decisions 0057 through 0059
5. `README.md`
6. `docs/COMBAT_VISUAL_DIRECTION_VERTICAL_SLICE_CLOSEOUT_V1.md`
7. `docs/MODULAR_CHARACTER_VISUAL_BREADTH_CLOSEOUT_V1.md`
8. the `CONTEXT.md` of every `src/` directory touched by the implementation, when present
9. this file
10. `public/assets/README.md`
11. `public/assets/PROVENANCE.md`

Do not read other archive documents unless this task names them.

## Baseline and dependency

Implementation starts from the completed Task 09 state:

- authoritative `master` is aligned with its tracked remote;
- the suite contains exactly **60 test files and 469 tests**;
- the logical game canvas is `640 x 360` and uses integer display scaling;
- combat uses the approved native-pixel Tiled arena and generic modular actor renderer;
- the generic player override is `visual.player=<profile-id>`;
- the combat appearance model supports `body`, `outfit`, `mainHand`, `offHand`, `accessory`,
  and `effectSet`, with north, east, south, and west facings;
- the existing exploration map is an `18 x 10` logical grid with orthogonal pathfinding,
  blocked cells, switch-controlled blockers, interest points, click-to-move, camera controls,
  combat entry, and return from combat; and
- the public production build uses the GitHub Pages project-site base
  `/prototipo_d20_jogavel/`.

Before implementation, verify the current `master` commit, tracked-remote alignment, clean
task scope, and passing baseline suite. Preserve unrelated local changes. If the base or test
count differs, stop and reconcile this specification before changing production files.

## Authoritative state and presentation boundary

Logical exploration state remains authoritative in `src/exploration/`, `src/movement/`, and
the existing scene orchestration. A tilemap, tile layer, sprite, animation, overlay, icon,
particle, label, or other visual object may represent that state but must not determine or
mutate it except through the existing input and command paths.

In particular:

- the existing `18 x 10` grid dimensions remain unchanged;
- blocked and walkable cells come from the existing exploration map state;
- switch-controlled blocker changes come from the existing switch/map transition;
- reachable cells and accepted paths come from the existing pure movement and pathfinding
  results;
- interest-point kind, position, activation, inspection, and completion come from the existing
  interest-point and objective state;
- combat begins only through the existing combat-trigger interaction;
- returning from combat restores the same exploration state and presentation selection; and
- tilemap collision, object properties, layer names, sprite bounds, alpha, depth, animation
  frames, and pixel colors are never alternative sources of gameplay truth.

No visual helper may duplicate pathfinding, movement range, collision, switch, exit,
interaction, objective, encounter, or combat-return rules.

## Exploration visual contract

All new exploration runtime art must conform to the visual direction established by decision
0057 and Tasks 07 and 08:

- native `16 x 16` pixel unit, or a documented compatible multiple composed without
  resampling;
- top-down three-quarter perspective compatible with the combat arena and actor profiles;
- integer world positions and integer display scale;
- hard-edge sampling with no texture interpolation;
- consistent ground-contact anchors and depth ordering;
- coherent outline weight, proportions, palette range, saturation, and shadow treatment;
- one declared lighting direction across terrain, blockers, props, interaction points, and
  characters;
- declared frame dimensions, frame order, facing coverage, timing, and reuse for every
  animated asset; and
- no stretched raster background, fractional scaling, or downsample-then-upsample runtime
  pipeline.

The exploration environment must be assembled from native tiles. Logical cells may span a
documented integer number of native tiles, but the tilemap must remain a presentation
projection of the existing logical grid.

## Modular character continuity

Exploration must consume the same generic appearance profile selected for combat. The existing
`visual.player` override must choose one profile for the entire exploration-combat-exploration
flow without changing rules or content data.

The exploration actor must:

- resolve the same `body`, `outfit`, `mainHand`, `offHand`, and `accessory` assignments as the
  selected combat profile;
- use the same profile id and generic resolver rather than an exploration-specific identity
  table;
- keep all visible layers synchronized to one facing, frame clock, anchor, integer position,
  scale, depth policy, and movement timeline;
- support idle and movement presentation for north, east, south, and west;
- derive facing from the existing orthogonal path segments using the Task 08 mapping;
- retain the last facing while idle and across the combat transition where the existing flow
  permits it; and
- never branch on a literal profile, content, participant, class, archetype, weapon, armor, or
  equipment identifier.

Exploration may adapt animation-state data to its idle/movement-only needs, but it must not
flatten modular layers into a combined character sprite or create a second appearance model.

## Interaction and overlay presentation

The exploration presentation must communicate gameplay state through pixel-art-compatible
shape, silhouette, animation, or iconography as well as color. Text may supplement state but
must not be the only way to distinguish it.

The overlay system must provide distinct, readable presentation for:

- selected cells;
- reachable cells;
- accepted path preview;
- blocked destination or no-path feedback;
- movement targets;
- interactable targets; and
- successful interaction feedback.

Overlays must align to logical cells at integer coordinates, remain legible over every terrain
variation, and avoid obscuring the player, interest points, blockers, or path destination.
They may not change pointer projection, selectable cells, path computation, movement range, or
interaction range.

Survey, switch, exit, and combat-trigger points must each have a distinct silhouette or
symbolic treatment. Their recognition must not rely only on labels or color.

Switch and exit presentation must visibly preserve the existing state transitions:

- switch inactive and active;
- exit locked and available; and
- exit completed after the existing completion condition is satisfied.

Completed or inspected point presentation must be derived from existing state. Do not add a
new completion, quest, or persistence model to support a visual state.

## Normal-mode and debug-mode boundary

Normal mode must be a clean player-facing exploration composition:

- remove the normal-mode `exploration placeholder / debug movement` message;
- hide technical map-state blocks, debug coordinates, diagnostic legends, internal status
  strings, and test-harness framing;
- retain only concise player-facing movement, interaction, and objective feedback that is
  necessary to understand the existing controls and current goal; and
- keep the world, actor, interest points, overlays, and essential feedback readable at the
  reference viewports.

Debug mode must keep diagnostics accessible through the existing presentation toggle. It may
show technical HUD sections, coordinates, state labels, pathfinding reasons, and diagnostic
legend information, but enabling it must not alter logical state, input rules, camera policy,
map projection, profile selection, or gameplay outcomes.

The existing camera controls and normal/debug toggle remain available. A visual redesign may
reflow their presentation but must not add a new menu or control scheme.

## Responsibility and extensibility boundary

Do not expand `src/game/scenes/PrototypeScene.ts` with new drawing, asset-selection, tilemap
construction, overlay-style, animation-frame, or modular-layer responsibilities.

New exploration presentation responsibilities belong in focused helpers under
`src/game/visual/`, including as appropriate:

- exploration tilemap construction and redraw;
- logical-grid-to-tilemap projection;
- exploration modular actor view;
- interest-point visual-state projection;
- overlay visual-state projection;
- normal-mode composition; and
- pure validation of visual data.

`PrototypeScene` may retain the minimum lifecycle and input orchestration needed to create,
update, hide, restore, and destroy those focused views. It must pass authoritative state into
the views rather than letting the views read or infer hidden gameplay state.

The asset catalog, appearance data, and renderer must remain provider-neutral. Provider,
product, purchase, license, receipt, and source-pack identifiers belong only in provenance or
asset-intake records and must not select runtime behavior.

## Scope

Allowed production changes:

- focused exploration presentation helpers under `src/game/visual/`;
- the minimum `src/game/` scene and debug-controller adaptation needed to delegate to those
  helpers and synchronize the existing state;
- exploration-only asset catalog records and loading declarations;
- one presentation-only Tiled JSON map and the minimum native-pixel runtime art actually used;
- focused pure tests for new presentation projection, appearance, animation, overlay, and
  visual-state helpers;
- narrowly identified updates to existing exploration-only visual assertions when they encode
  a deliberately retired painterly or debug-placeholder contract;
- `public/assets/README.md` and `public/assets/PROVENANCE.md`;
- the implementation closeout and required updates to `README.md` and `docs/MVP_SCOPE.md`; and
- a new decision entry only if implementation introduces an architectural decision not already
  governed by decisions 0057 through 0059 or this specification.

Do not change:

- exploration grid dimensions, map topology, initial state, or logical cell coordinates;
- blocked-cell rules or switch-controlled blocker behavior;
- interest-point definitions, objective flow, or interaction effects;
- movement range, pathfinding, click-to-move, collision, or movement completion;
- camera controls or presentation-toggle control;
- combat trigger, encounter selection, combat session behavior, or return-from-combat behavior;
- combat rules, statistics, actions, resources, range, turn order, damage, outcomes, or enemy
  decisions;
- content ids or content-pack data;
- the `640 x 360` logical resolution, integer display-scale policy, or combat presentation;
- GitHub Pages workflow or production base-path configuration;
- dependencies, `package.json`, `pnpm-lock.yaml`, any other lockfile, or installed dependency
  versions.

## Acceptance criterion 1: exploration composition and layout

All of the following must hold:

- the main screen is the existing exploration screen before and after combat, not a new title
  screen or main menu;
- exploration renders inside the existing `640 x 360` logical canvas;
- the canvas remains centered and displays at exactly 2x in a `1280 x 720` viewport and exactly
  3x in a `1920 x 1080` viewport;
- the entire existing `18 x 10` logical map remains reachable through the unchanged camera
  controls;
- player, terrain, blockers, interest points, overlays, and essential normal-mode feedback do
  not overlap in a way that hides actionable state;
- normal mode contains no placeholder banner or debug-harness framing; and
- entering combat and returning from combat restores a clean, playable exploration
  composition with the same logical map state.

## Acceptance criterion 2: environmental tilemap and pixel-art consistency

All of the following must hold:

- the exploration environment is a `Phaser.Tilemaps.Tilemap` loaded from repository-authored
  Tiled JSON;
- it uses native `16 x 16` tiles, or a documented integer composition of those tiles, at
  integer scale;
- it contains at least ground, blocker/boundary, and decoration/variation presentation layers;
- it visually represents all existing logical blocked cells and switch-controlled blockers;
- tile and object layers do not determine collision, walkability, pathfinding, interaction,
  or world-state transitions;
- no single environment painting is stretched across the map;
- no exploration texture is fractionally scaled, interpolated, or reduced and then enlarged
  at runtime; and
- full-scene captures at both reference viewports show hard pixel edges and a coherent
  top-down three-quarter environment.

## Acceptance criterion 3: modular character continuity

All of the following must hold:

- exploration and combat resolve the player through the same selected generic appearance
  profile;
- `visual.player=<profile-id>` selects the same body, outfit, main-hand, off-hand, and
  accessory assignments before combat, during combat, and after returning to exploration;
- selecting a profile changes no participant, sheet, statistic, action, range, resource,
  movement, objective, interaction, or outcome;
- all declared visible layers remain separately addressable and synchronized in exploration;
- no flattened exploration-only character sheet replaces the modular layers;
- production code contains no behavior branch keyed by a literal profile, content,
  participant, class, archetype, weapon, armor, or equipment id; and
- comparable captures of at least the combatant, caster, specialist, and one-slot alternate
  profile show recognizable continuity across exploration and combat.

## Acceptance criterion 4: orientation and movement animation

All of the following must hold:

- exploration idle and movement support north, east, south, and west;
- each orthogonal path segment drives the Task 08 cardinal mapping before its visual movement;
- zero-length state retains the previous facing and no diagonal visual shortcut is introduced;
- body, outfit, main-hand, off-hand, and accessory layers share facing, animation frame,
  anchor, integer position, scale, and movement timeline;
- idle retains the last movement facing;
- visual duration follows the existing path traversal and cannot complete or extend logical
  movement independently;
- Space still completes the current movement through the existing path, with all layers
  reaching the authoritative destination together; and
- a human reviewer approves a north/east/south/west exploration movement sequence with at least
  three visible layers synchronized.

## Acceptance criterion 5: interaction points and world-state readability

All of the following must hold:

- survey, switch, exit, and combat-trigger points are distinguishable by silhouette, symbol,
  or motion without labels and without relying only on color;
- each point remains anchored to its existing logical cell and interaction range;
- switch inactive and active states are visibly distinct and track the authoritative switch
  flag;
- the switch-controlled blocker visibly changes when, and only when, the existing logical map
  changes;
- exit locked, available, and completed states are visibly distinct and track the existing
  exit/objective state;
- inspected or completed presentation does not create a new gameplay flag or persistence
  system;
- interaction feedback is visible in normal mode without exposing internal debug messages; and
- the existing survey, switch, exit, combat-trigger, objective, combat-entry, and combat-return
  flows complete with unchanged results.

## Acceptance criterion 6: path, selection, and movement overlays

All of the following must hold:

- selected, reachable, path-preview, blocked-path, movement-target, interaction-target, and
  successful-interaction states have distinct presentations;
- overlay distinctions use shape, pattern, animation, or iconography in addition to color where
  two states could otherwise be confused;
- overlays snap to logical cells and render at integer coordinates and scale;
- overlays remain legible over every terrain variation at both reference viewports;
- overlays do not hide the actor, destination, blocker, or interest-point silhouette;
- blocked and no-path feedback does not draw an accepted route;
- overlay helpers consume existing selection, reachability, path, and result data and contain
  no pathfinding, range, collision, or interaction rule; and
- pointer projection, selected destinations, computed routes, movement range, and interaction
  range are unchanged.

## Acceptance criterion 7: normal-mode UI and debug-mode separation

All of the following must hold:

- normal mode does not display `exploration placeholder / debug movement`;
- normal mode hides coordinates, internal ids, raw pathfinding reasons, technical state blocks,
  and the diagnostic legend;
- normal mode retains concise player-facing objective, movement, blocked-action, and
  interaction feedback;
- debug mode keeps the existing diagnostic information accessible through the existing toggle;
- normal and debug modes use the same authoritative map, actor, profile, camera, input, and
  overlay state;
- toggling debug presentation changes visibility/composition only and cannot change gameplay;
  and
- no title screen, main menu, modal debug launcher, or new control scheme is added.

## Acceptance criterion 8: artistic consistency

All of the following must hold:

- terrain, blockers, decorations, player layers, interest points, overlays, and UI accents use
  a compatible native pixel unit and top-down three-quarter perspective;
- outline weight, proportions, palette range, saturation, lighting direction, shadow
  treatment, anchor, depth ordering, and animation cadence form one coherent visual contract;
- modular character layers do not drift, clip incorrectly, change apparent body scale, or
  expose halos across facings and frames;
- interest points and overlays are readable without looking detached from the environment;
- neither environment nor character recognition depends only on hue;
- no fractional pixel position or scale is visible in the delivered exploration composition;
  and
- a human reviewer approves normal-mode full-scene captures, the cardinal movement sequence,
  the interaction-state sequence, and an exploration/combat continuity comparison.

## Acceptance criterion 9: IP, licensing, provenance, and public distribution

All of the following must hold:

- every new runtime file has a complete entry in `public/assets/PROVENANCE.md`;
- every entry records creator, authoritative source URL, actual license name and URL, retrieval
  date, source archive/file SHA-256, exact selected source files, runtime SHA-256, repository
  path, frame/tile mapping, transformations, approval state, and public-replacement status;
- no paid or proprietary asset is described as `CC0` or under a guessed permissive license;
- every license permits the actual modification, public web deployment, and public-repository
  distribution performed by this project;
- purchased assets have explicit license text or written provider confirmation permitting the
  selected runtime files to be stored in this public repository; permission to use an asset in
  a published game alone is not sufficient;
- repository access, source-file redistribution, sublicensing, transfer, team/automation
  access, editable-source handling, post-subscription use, and AI-use restrictions are recorded
  and satisfied before a purchased file is copied into the repository;
- ambiguous public-repository permission stops asset intake pending written clarification;
- receipts, credentials, billing data, purchase archives, editable masters, complete demos,
  and unused source files are not committed;
- no licensed file is supplied to an AI system contrary to its license;
- no unlicensed, official, trademarked, protected, setting-specific, or official-derived
  source material is added; and
- the deployed artifact remains compatible with the public, non-commercial distribution
  boundary in decisions 0058 and 0059.

## Acceptance criterion 10: mechanical and behavioral preservation

All of the following must hold:

- all 60 baseline test files and 469 baseline tests remain present, enabled, and passing unless
  an exploration-only visual assertion is narrowly updated under the authorization below;
- no rules, content, combat, movement, pathfinding, collision, interest-point, objective,
  camera-control, encounter, or outcome assertion is deleted, skipped, weakened, or rewritten;
- the `18 x 10` map, logical coordinates, initial player cell, blocked cells,
  switch-controlled blockers, interest points, and objective states are unchanged;
- movement allowance, accepted and rejected paths, click-to-move, Space completion, F
  interaction, camera controls, debug toggle, combat trigger, encounter, and return behavior
  are unchanged;
- combat statistics, actions, resources, ranges, positions, damage, turn order, outcomes, and
  enemy behavior are unchanged;
- the terminal combat harness is unaffected; and
- runtime review records the same logical state transitions before and after the visual
  integration.

Existing exploration-only visual tests may be edited only when they assert a painterly asset,
generated-raster exploration resource, placeholder string, debug-only normal-mode layout, or
other presentation contract explicitly retired by this task. Every such change must be listed
and justified in the closeout. Existing mechanical tests must remain byte-for-byte unchanged.

## Acceptance criterion 11: tests, build, and online-preview compatibility

All of the following must hold:

- focused new tests cover pure tilemap projection, modular exploration-layer synchronization,
  facing retention, overlay-state projection, interest-point visual states, and normal/debug
  visibility without importing Phaser where a pure helper is sufficient;
- `pnpm test` passes and the closeout records final file and test counts;
- `pnpm typecheck` passes;
- `pnpm build` passes with no new warning beyond the known chunk-size advisory;
- no dependency declaration, lockfile, installed dependency, Pages workflow, or base-path
  configuration changes;
- local development continues to resolve at `/`;
- production HTML, Tiled JSON, tilesets, actor layers, interest-point art, and other exploration
  runtime assets resolve under `/prototipo_d20_jogavel/`;
- the production build is served or inspected under that project-site base with no root-path
  asset assumption or 404;
- browser console review at `1280 x 720` and `1920 x 1080` reports no exploration asset,
  tilemap, animation, or runtime errors; and
- the live-preview candidate completes exploration, combat entry, combat resolution, and
  return to exploration with the same selected appearance.

## Explicit exclusions

Do not implement:

- a title screen, new main menu, launcher, or additional application mode;
- new maps, encounters, quests, narrative, dialogue, audio, save/load, or authoring tools;
- changes to combat rules or exploration mechanics;
- inventory, character selection, character creation, progression, mechanical equipment
  swapping, or a paper-doll editor;
- new actions, abilities, statistics, objectives, interest-point kinds, or content ids;
- fractional pixel scaling, interpolated textures, stretched raster backgrounds, flattened
  character sprites, or downsample-then-upsample runtime art;
- production behavior that branches on profile, content, participant, class, archetype,
  equipment, provider, product, or license identifiers;
- a runtime Tiled dependency, renderer replacement, or dependency change; or
- unlicensed, official, trademarked, protected, setting-specific, or official-derived source
  material.

## Verification and review evidence

Run without installing, removing, upgrading, or reconciling dependencies:

```text
pnpm test
pnpm typecheck
pnpm build
```

If the local package-manager wrapper attempts to change installed dependencies, stop it and use
the already-installed project binaries or existing package scripts. Record the exact fallback.

Capture and review:

- normal-mode exploration at `1280 x 720`;
- normal-mode exploration at `1920 x 1080`;
- the entire `18 x 10` map through the existing camera controls;
- combatant, caster, specialist, and the one-slot alternate in exploration and combat;
- north, east, south, and west exploration movement;
- selected, reachable, accepted-path, blocked-path, movement-target, and interaction-target
  overlays;
- survey inspection;
- switch inactive, activation, and active states, including the controlled blocker;
- exit locked, available, and completed states;
- combat-trigger recognition, combat entry, and return to exploration;
- normal/debug toggle comparison; and
- the production build under `/prototipo_d20_jogavel/`.

Automated tests cannot establish visual coherence. A human reviewer must approve the two
full-scene reference captures, modular-character continuity comparison, cardinal movement
sequence, overlay comparison, interaction/world-state sequence, normal/debug comparison, and
project-site preview before merge.

## Completion hygiene

On implementation completion:

- append exact provenance and transformations for every new runtime file;
- record the actual license and explicit public-repository permission for any purchased asset;
- write `docs/EXPLORATION_VISUAL_DIRECTION_INTEGRATION_CLOSEOUT_V1.md`;
- update `README.md` and `docs/MVP_SCOPE.md` in the same work;
- record the base commit, final test count, every authorized visual-test update, and the
  unchanged mechanical-test comparison;
- append a new numbered decision only for a genuinely new architectural decision;
- use one dedicated implementation branch and one pull request containing only Task 10; and
- do not merge before the required human visual approvals.
