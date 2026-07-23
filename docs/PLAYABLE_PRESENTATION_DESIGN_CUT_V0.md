# Playable Presentation Design Cut v0

## 1. Purpose and Status

Status: Milestone 1 design cut. No runtime implementation is included.

The Playable Presentation track will make the functioning exploration and tactical combat prototype read as a cohesive fantasy adventure instead of a geometric debug tool. It changes how existing state and results are presented without changing rules, movement, range, actions, encounters, sessions, or outcomes. The target is coherent, replaceable prototype art, not final production art or a final setting. This document establishes direction, architecture, milestones, boundaries, and validation.

## 2. Current Visual Baseline

### Exploration

- [`src/main.ts`](../src/main.ts) configures one 800 x 450 Phaser game with `Phaser.AUTO`, `pixelArt`, a `#15181f` background, FIT scaling, and centered canvas.
- [`PrototypeScene.ts`](../src/game/scenes/PrototypeScene.ts) is the only configured scene. It orchestrates exploration and combat input, mode transitions, view creation, updates, resize, reset, and cleanup.
- [`debugExplorationConfig.ts`](../src/game/debug/debugExplorationConfig.ts) defines a fixed 18 x 10 orthogonal grid, 32 px cells, origin `(112, 68)`, range 4, fixed blocked cells, four points of interest, and one switch-controlled blocked segment.
- [`drawDebugExplorationMap.ts`](../src/game/debug/drawDebugExplorationMap.ts) uses Phaser `Graphics` for a dark blue-gray checker grid, blue-gray lines and border, and red crossed boxes for blocked cells.
- [`DebugActorController.ts`](../src/game/debug/DebugActorController.ts) owns actor, point, reachable-cell, selection, target, and path graphics. It translates existing pure exploration/movement state into views.
- The player is a green circle with a coordinate label. Survey, switch, exit, and combat trigger are orange diamond, cyan square, purple circle, and red triangle markers. Inspected, active-switch, and completed-exit states add muted or explicit line treatments.
- Reachable cells are cyan inset squares, selection is gold, the move target is a green crosshair, and route cells are purple dots. These are useful encodings but remain geometric placeholders.
- A fixed legend and five text blocks expose objective, interaction, entity, world, and movement state. The footer calls the surface an exploration placeholder/debug view.
- Approved route movement is rendered as a 500 ms total linear segmented tween. The tween is presentation; Space can complete movement immediately. Camera pan, zoom, and reset affect the world while HUD/legend stay screen-fixed.

### Combat

- Interacting with the combat trigger hides exploration views, creates the existing combat session, and creates combat views in the same scene. It does not create a second domain state model.
- [`debugCombatGridView.ts`](../src/game/debug/debugCombatGridView.ts) draws a dark navy 10 x 8 grid. [`combatLayoutHelper.ts`](../src/game/debug/combatLayoutHelper.ts) calculates responsive cells, capped at 42 px and floored at 8 px.
- Combatants are green/red circles labeled `P`/`O`. A gold ring marks the active combatant; attack/ability submenu state adds a gold target ring to the opponent.
- Reachable combat cells use cyan inset fills only in main mode. Combat movement updates session position immediately; it has no interpolation.
- The combat console lists melee, short, and long weapon range, distance, and `READY`/`BLOCKED`. Current spatial overlays do not distinguish the three bands.
- [`debugCombatHpBar.ts`](../src/game/debug/debugCombatHpBar.ts) renders two 200 x 12 bars with 200 ms tweened green/yellow/red fills. [`debugCombatTurnIndicator.ts`](../src/game/debug/debugCombatTurnIndicator.ts) renders a centered turn panel, team-colored pip, and short pulse.
- [`debugCombatFloatingText.ts`](../src/game/debug/debugCombatFloatingText.ts) raises/fades damage or `MISS` for 1200 ms. A 200 ms half-screen flash accompanies hits. [`debugCombatOutcomeBanner.ts`](../src/game/debug/debugCombatOutcomeBanner.ts) dims the screen and scales in a victory/defeat panel over 500 ms.
- The bounded combat history shows up to four lines of rolls, damage, blocked actions, turns, errors, and outcomes. Context prompts provide numeric controls. Phaser text uses Arial; page CSS uses a system UI stack.

### Classification

| Kind | Current examples | Direction |
| --- | --- | --- |
| Functional debug information | Coordinates, raw HUD state, preset/action details, legend | Keep behind a later debug toggle. |
| Player-facing feedback | Reachable/selected/target cells, HP, turn, availability, damage/miss, outcome, essential log | Preserve meaning and improve hierarchy. |
| Geometric placeholders | Actor circles/letters, point polygons, crossed obstacles, flat grids | Replace incrementally with recoverable fallbacks. |
| Reusable components | Layout helper, projections, HP, turn, floating text, flash, banner, cleanup handles | Evolve without moving rules into presentation. |

### Resize, lifecycle, and assets

Phaser FIT preserves the logical aspect ratio. The resize handler recalculates combat layout, reserving a 144 px console, 24 px bottom margin, and at least a 12 px grid gap; it repositions the grid, HP bars, turn indicator, prompts, and footer. Exploration map/HUD geometry is mostly fixed.

Reset clears transient handles and history, restarts the session, redraws the grid, and recreates HP/turn/outcome views. Victory return destroys combat bars, grid, indicator, banner, and transient feedback before restoring exploration. Defeat remains available for reset.

There is no `preload()`, Phaser loader call, asset catalog, texture lookup, or missing-texture policy in the inspected code. The repository has no `public/`, `assets/`, or `static/` directory and no repository-owned image, font, or audio assets outside dependency/build directories. All current visuals are code-native Phaser `Graphics` and `Text`.

## 3. Audience and Intended Experience

The target is a grounded, colorful, immediately readable tactical fantasy adventure for prototype playtests. Players should distinguish the world, player, enemy, terrain, obstacles, objectives, interactables, movement, attack range, selection, damage, and disabled states without reading raw state. Richness must support decisions rather than become ornamental or noisy. Assets remain provisional and replaceable.

The game stays custom and generic. Do not reproduce protected settings, characters, logos, symbols, costumes, maps, or proprietary visual identities.

## 4. Provisional Visual Direction

- Keep orthogonal top-down presentation. Do not introduce isometric projection, rotation, or perspective depth while grid cells remain authoritative.
- Retain 32 logical px as exploration tile baseline. Combat assets fit the responsive cell (maximum 42 px) rather than changing grid math. One-cell actors occupy about 70-85% of cell width and anchor at ground contact.
- Exploration roles: charcoal `#15181F`, slate `#283548`, moss `#587A4D`, earth `#8A6846`, cyan `#4FB3D9`, violet `#B983FF`, amber `#F2C14E`, danger coral `#E85D5D`.
- Combat roles: navy `#172231`, stone `#4C5968`, player green `#65C98C`, enemy coral `#E85D5D`, selection gold `#FFD166`, movement cyan `#6ED8FF`, range violet `#B983FF`, damage `#FF6B4A`, healing mint `#75E6A4`, disabled gray `#7B8491`.
- Use a restrained multi-color palette. Avoid one-hue UI, broad gradients, decorative blobs, busy textures, or effects that obscure cells.
- Terrain stays quieter than actors/overlays. Obstacles need mass, edge, and value contrast, not color alone. Player and enemy need distinct silhouettes, facing cues, values, and team accents.
- Points of interest pair small world props with distinct shaped badges for survey, switch, objective/exit, and encounter.
- Selection uses gold corner brackets/outline; reachable cells use cyan inset borders; move target uses a green crosshair; hostile target uses a coral/gold reticle. Overlays remain below actors and above terrain.
- Melee uses a compact one-cell edge/arc, short range a medium dashed treatment, and long range a thinner extended treatment with selected-target endpoint. Do not imply line of sight, cover, or terrain rules that do not exist.
- Damage combines orange-red signed text and local flash/recoil; healing uses mint with `+`; miss uses pale cool text and a whiff cue; defeat settles into a clear pose. Disabled controls use desaturation/value plus text/icon, not opacity alone.
- Use one compact readable UI family with tabular numerals where possible. Until a licensed font exists, system/Arial fallback is acceptable. Favor 12 px secondary and 14 px primary logical sizes, flat dark panels, 1-2 px borders, and consistent 8 px spacing.
- Combat log prioritizes actor, action, result, and damage; raw math/codes move behind debug mode. Keep bounded history, wrapping, and redundant labels.
- Motion is short and interruptible: roughly 80-150 ms selection, 150-250 ms impact, 250-500 ms movement/outcome emphasis. No perpetual bobbing or required screen shake.
- Visual timing never resolves rules. Provide a later reduced-motion path. Preserve contrast, stable cell anchors, text readability, and shape/text redundancy for color-vision accessibility.

## 5. Asset Strategy

No assets are added in this milestone.

| Category | Initial source | Fallback/notes |
| --- | --- | --- |
| Exploration terrain | Generated raster | Current code checker. |
| Combat terrain | Repository-native Phaser graphics | Current clean arena; raster texture may follow. |
| Walls/obstacles | Generated raster | Crossed-box graphics. |
| Player character | Generated raster | Green circle/label. |
| Enemy character | Generated raster | Red circle/label. |
| Points of interest | Repository-native graphics | Existing distinct shapes; optional later props. |
| Objectives/exits | Generated raster | Violet/completion graphics. |
| Selection markers | Repository-native graphics | Crisp scalable overlay. |
| Movement/range overlays | Repository-native graphics | Dynamic state-derived overlay. |
| Attack effects | Repository-native graphics | Lines/arcs/flashes first. |
| Damage/defeat effects | Repository-native graphics | Text, tint, tween first. |
| UI icons | Public-domain or permissively licensed | Code glyph fallback; normalized style. |
| UI panels/textures | Temporary fallback graphics | Flat panels before optional nine-slice. |

Every asset requires a stable semantic key, replaceable path, size/anchor, source, author/tool, license, modification note, and date in the catalog or adjacent provenance record. External assets retain exact source and license. Generated assets record tool/model and prompt summary. Gameplay rules never use filenames or keys. Missing or failed loads must create a deterministic visible fallback, never a blank actor.

## 6. Presentation Architecture

```text
src/game/visual/
  visualScale.ts
  assetKeys.ts
  assetCatalog.ts
  animationKeys.ts
  loadVisualAssets.ts
  fallbackGraphics.ts
  createExplorationVisuals.ts
  createCombatVisuals.ts
  presentationEffects.ts
public/assets/
  exploration/
  combat/
  effects/
  ui/
  PROVENANCE.md
```

`public/assets/` is proposed because Vite supports a root public directory and this repository has no established static directory. It is not created in this milestone.

Scenes retain loader/input/mode/view/resize/cleanup orchestration. Presentation modules may import Phaser and read typed state from pure layers. Catalog/config validation should stay pure where practical. Dependency direction is `src/game/visual/ -> pure layers`, never the reverse. Keys, filenames, animation names, colors, and scale do not enter `src/rules/`, `src/combat/`, `src/movement/`, or `src/exploration/`.

Sprites cache only view identity; existing combat/exploration state remains authoritative. Presentation callbacks may release input or clean a visual queue, but cannot decide legality, hit, damage, movement, turn, or outcome.

`PrototypeScene.ts` currently owns broad orchestration plus formatting, effects, layout, and view lifecycle. Later milestones extract cohesive construction/update/cleanup into small factories while leaving scene sequencing intact. Do not broadly rewrite the scene or create another controller state hierarchy.

## 7. Replacement and Fallback Strategy

1. Establish keys, typed catalog, scale, loader, and fallbacks before reskinning.
2. Load optional assets through scene lifecycle. Asset availability is presentation-only and cannot change gameplay.
3. Factories return the same update/visibility/destroy contract for sprite or graphics fallback.
4. Project authoritative grid cells into pixels; do not store independent logical positions in sprites.
5. Layer terrain, props, underlay markers, actors, target accents, effects, fixed UI, and modal outcome in that order.
6. Effects consume resolved snapshots/events. Cancellation snaps to current state and removes transient objects.
7. Cleanup is idempotent for reset, mode transition, resize reconstruction, shutdown, and interruption.
8. Resize reprojects state, never infers state from prior pixels; pixel art uses intentional rounding.
9. Exploration-to-combat hides recoverable exploration views, clears path/effects, creates combat views, then reveals them. Missing assets do not affect transition.
10. Reset uses the existing session API before refreshing views. Victory/defeat read resolved outcome. Return destroys all combat presentation before restoring exploration.
11. Keep current debug graphics recoverable as factories/fallbacks and later via a debug toggle. Replace incrementally, not all at once.

## 8. Milestone Sequence

### 1. Playable Presentation Design Cut v0
- Goal: Direction, architecture, boundaries, milestones, validation.
- Files/ownership: This document only.
- User test: Review/traceability only.
- Non-goals: Runtime, tests, config, dependencies, assets.
- Acceptance: Complete design cut and executor prompt; only this file changes.
- Validation: Links, ownership, path, and change-scope checks.

### 2. Visual Asset Foundation v0
- Goal: Keys, catalog, scale, loader boundary, deterministic fallback.
- Files/ownership: Focused `src/game/visual/` modules/tests; minimal scene hook; asset-location documentation.
- User test: Existing prototype unchanged; isolated load/fallback proof at most.
- Non-goals: Reskins, final effects, rules, broad refactor.
- Acceptance: Typed unique keys, validated catalog, visible fallback, intact debug view.
- Validation: Typecheck/test/build, scans, console, success/failure proof.

### 3. Exploration Visual Pass v0
- Goal: Recognizable fantasy exploration.
- Files/ownership: Exploration factories/catalog/assets/provenance and narrow scene/controller calls.
- User test: Terrain, walls, player, points, objective, exit; unchanged movement/interactions/encounter entry.
- Non-goals: Maps, quests, terrain costs, new rules.
- Acceptance: Roles distinct, fallbacks work, overlays readable, transition/resize valid.
- Validation: Gates/scans, full exploration flow, fallback, screenshots, console/canvas.

### 4. Combat Visual Pass v0
- Goal: Coherent arena, combatants, and tactical markers.
- Files/ownership: Combat factories/catalog/assets/provenance and narrow grid/scene adaptation.
- User test: Sprites, ground, selection, target, movement/range with unchanged combat.
- Non-goals: AI, cover, line of sight, terrain, math/economy changes.
- Acceptance: Cell/team/active/target clear; all range bands understandable; cleanup/fallback work.
- Validation: Gates/scans, ranges/movement/reset/outcome/return, screenshots, console/canvas.

### 5. Motion and Impact Feedback v0
- Goal: Short movement, anticipation, hit/miss, damage, defeat presentation.
- Files/ownership: Effect/animation helpers and resolved-event scene calls.
- User test: Feedback plays and rapid reset/return leaves no stale effects.
- Non-goals: Rule-delaying cinematics, physics, final animation set.
- Acceptance: Rules resolve independently; callbacks presentation-only; interruption safe.
- Validation: Gates, timing audit, interruption/repeat/reset/return review.

### 6. Debug Presentation Toggle v0
- Goal: Hide technical data normally while retaining it for development.
- Files/ownership: Debug visibility config/input under `src/game/`.
- User test: Toggle coordinates/raw state/diagnostics without hiding essential feedback.
- Non-goals: Delete debug code, settings system, UI redesign.
- Acceptance: Both modes support full flow and resize.
- Validation: Gates and both-mode flow/screenshots.

### 7. Presentation Refinement v0
- Goal: Consistency, contrast, layout, resize, transitions, log readability.
- Files/ownership: Existing visual config/factories/layout and keyed replacements.
- User test: Desktop/smaller viewports fit and share one hierarchy.
- Non-goals: New systems, final-art claim, broad rewrite.
- Acceptance: No bad overlap/crop; readable contrast/text; unobscured tactics.
- Validation: Gates, viewport matrix, console/canvas/baseline comparison.

### 8. Playable Presentation Closeout v1
- Goal: Document visual, functional, provenance, and architecture closure.
- Files/ownership: Closeout document and only validation-required small fixes.
- User test: Complete exploration-combat-outcome/reset-return loop with debug/fallback recovery.
- Non-goals: Features, content expansion, final-art claim.
- Acceptance: Boundaries/provenance audited; automated/runtime/visual gates pass; limitations documented.
- Validation: Full suite, scans, normal/debug/fallback paths, screenshots, baseline comparison.

## 9. Track-Wide Boundary Rules

`src/rules/` must not receive Phaser, asset keys, sprite/animation state, browser APIs, presentation timing, colors, or layout.

`src/combat/` must not receive Phaser, asset keys, sprite state, animation callbacks, rendering, input, or visual timing.

`src/movement/` must not receive Phaser, asset keys, sprites, visual interpolation, or combat presentation concepts.

`src/exploration/` must not receive Phaser, asset keys, rendering, animation state, or UI concepts.

`src/game/` may own loading, sprites, animations, catalogs, overlays, layout, effects, input routing, and pure-state-to-view translation.

Additionally: do not alter combat math, ranges, movement allowance, positioning, action economy, encounter outcomes, or exploration rules. Animation never determines resolution. Do not duplicate domain state in sprites. Do not broadly rewrite `PrototypeScene.ts`. Preserve debug fallbacks until replacements pass validation. Do not claim final art. External assets need provenance/licenses; generated assets need provenance and stable replaceable keys. No protected visual content or direct filenames in domain logic.

## 10. Validation Strategy

Implementation milestones run:

```text
npm run typecheck
npm run test
npm run build
```

Boundary scans cover `src/rules/`, `src/combat/`, `src/movement/`, and `src/exploration/` for Phaser, presentation imports/state, asset keys/paths/extensions, browser APIs, rendering, and input. Confirm no filenames in domain logic and no second authoritative state.

Runtime checks: no console errors; no silent missing assets; nonblank canvas; correct anchors/positions; playable exploration and combat; readable movement and melee/short/long availability; correct reset/outcome/return cleanup; resize separation among grid, actors, HP, turn, history, prompts, and banner.

Visual checks: normal desktop and smaller supported viewport screenshots; current-baseline comparison; actor/team visibility; text fitting; contrast; coherent layers; no overlaps, crops, blank textures, or effects hiding grid information; useful canvas-pixel checks; load-success and forced-fallback checks per introduced category.

## 11. First Implementation Prompt

```text
You are implementing Milestone 2: Visual Asset Foundation v0 in the TypeScript/Vite/Vitest/Phaser project at:

G:\Meu Drive\Ideias Ruins\Jogo Tormenta\prototipo_d20_jogavel

You are an executor. The orchestrator defines scope and validates delivery. Do not continue beyond this milestone.

Use G:\Meu Drive\Ideias Ruins\Jogo Tormenta\prototipo_d20_jogavel for every read, edit, command, and report. Do not use unrelated directories or create copies, links, mirrors, or temporary repositories. Verify package.json, src/game/, src/combat/, src/movement/, src/exploration/, docs/PLAYABLE_PRESENTATION_DESIGN_CUT_V0.md, and docs/COMBAT_GRID_MOVEMENT_CLOSEOUT_V1.md. Read AGENTS.md. If inaccessible or unwritable, report the actual error for this exact G: path and stop.

Read first: docs/PLAYABLE_PRESENTATION_DESIGN_CUT_V0.md, docs/COMBAT_GRID_MOVEMENT_CLOSEOUT_V1.md, docs/COMBAT_VISUAL_FEEDBACK_CLOSEOUT_V1.md, docs/EXPLORATION_COMBAT_INTEGRATION_CLOSEOUT_V1.md, docs/EXPLORATION_DEBUG_BASELINE.md, docs/ARCHITECTURE.md, src/main.ts, src/game/scenes/PrototypeScene.ts, src/game/debug/debugExplorationConfig.ts, src/game/debug/debugCombatGridView.ts, and src/game/debug/combatLayoutHelper.ts.

Goal: infrastructure only. Add stable semantic asset keys, a typed asset catalog, presentation-only visual scale/sizing/anchors, an explicit Phaser loading boundary owned by src/game/, deterministic visible missing/unloaded-asset fallback, focused Vitest tests for pure catalog/config/fallback-selection helpers, and documentation of future asset/provenance locations. Include at most a tiny isolated loading proof if it does not begin a reskin.

Prefer small modules under src/game/visual/ such as assetKeys.ts, assetCatalog.ts, visualScale.ts, loadVisualAssets.ts, and fallback helpers. Keep validation/selection pure where practical. If public/assets/ is established, add directory/provenance documentation or one strictly justified original proof asset only; do not add an asset pack.

Catalog entries must be typed by kind and include path, logical size/anchor, and provenance reference or repository-native/fallback classification. Call sites use keys, not filenames. Failed assets select deterministic Phaser graphics/text fallbacks and never change gameplay state.

Boundaries: scenes own loader and mode lifecycle. Presentation may depend on Phaser and pure state reads. src/rules/, src/combat/, src/movement/, and src/exploration/ must not import Phaser, src/game/visual/, assets, sprites, animations, browser APIs, or visual config. Rules/session state never depend on loading/animation. Do not add a second state model. Keep current debug graphics as fallback. Any PrototypeScene hook must be minimal.

Non-goals: no complete exploration or combat reskin; no rules, combat, exploration, movement, range, economy, positioning, outcome, or input changes; no enemy AI, terrain mechanics, line of sight, cover, authored maps, final animations, protected content, broad PrototypeScene rewrite, dependency additions, commit, or push.

Acceptance: keys are typed/unique/stable; catalog is typed; scale/config is tested and presentation-only; loading boundary is explicit; fallback is visible/deterministic/testable; existing behavior/debug rendering remains unchanged except an optional isolated proof; future asset/provenance locations are documented; no reskin starts.

Run npm run typecheck, npm run test, and npm run build. Scan pure layers for Phaser/assets/browser/rendering/sprite/animation dependencies and direct filenames. Test forced fallback. If runtime is available, confirm no console errors, nonblank canvas, unchanged exploration/combat, and both proof load/fallback paths. Report all files, infrastructure, tests, validation, scans, runtime proof or omission, and confirm all work occurred under G:\Meu Drive\Ideias Ruins\Jogo Tormenta\prototipo_d20_jogavel.
```
