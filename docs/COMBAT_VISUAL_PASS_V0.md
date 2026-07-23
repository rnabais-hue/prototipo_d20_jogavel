# Combat Visual Pass v0

Status: Delivered
Track: Playable Presentation - Milestone 4

---

## 1. Delivered Combat Visual Treatment

This milestone replaced the primary geometric combat placeholders (dark navy grid, green/red labeled circles P/O) with a coherent fantasy tactical arena and recognizable combatants. All combat mechanics, movement, ranges, inputs, action economy, outcomes, and session behavior are preserved unchanged.

### Arena Treatment

The combat surface now presents as a stone/earth tactical floor:

- Dark stone base fill (0x161e2a) covers the entire 10x8 grid area.
- Alternating warm-stone cell accent (0x1c2535, 28% alpha) creates a subtle checkerboard variation on every other cell, giving the floor a stone-tile quality without visual noise.
- Stone border frame (0x2e3d52, 2px) outlines the arena perimeter.
- Grid cell boundaries are drawn over the floor with low-contrast stone gray (0x5c6470, 60% alpha), remaining readable without dominating.

The arena is intentionally quieter than the combatant tokens and overlays.

### Player Combatant Treatment

The player is presented as a warrior token:

- Circular base in adventurous green (0x65c98c) with a translucent drop shadow (0x2e6644).
- Ivory/gold rim (0xb4f0cd) rim highlight.
- Sword emblem: a vertical line with a crossguard, drawn in ivory (0xf4f0e8). A small arc below represents a shield bottom.
- Team accent: persistent green - matches the exploration player token color for consistency.

### Enemy Combatant Treatment

The enemy is presented as an adversary token:

- Circular base in danger coral (0xe85d5d) with a dark shadow (0x6e2020).
- Coral/light rim (0xffc1b9) rim highlight.
- Claw emblem: three angled slashes fanning downward, drawn in bone ivory (0xf0ece8).
- Team accent: persistent coral - distinct from player by silhouette, value, and hue.

### Silhouette Distinction

Player and enemy are distinguishable without color:

- Sword glyph vs claw glyph are readable even in grayscale.
- Player shadow is warm/dark green; enemy shadow is dark red.
- Neither token uses a letter label.

---

## 2. Active, Target, and Reachable-Cell Treatments

### Active-Turn Marker

When a combatant owns the current turn, a gold outer ring (0xffd166, 3px stroke) is drawn around their token, offset 6px beyond the main circle radius. The ring is drawn on a lower layer so it appears clearly beneath the token without obscuring it.

### Target Reticle

When the player enters the Attacks or Abilities submenu, the opponent receives a hostile coral reticle:

- Four cardinal arm lines extending from a radius equal to 46% of cell size.
- Arms terminate at the center-facing edge, leaving a gap for readability.
- Coral (0xe85d5d) reticle lines + small gold (0xffd166) accent dots at the four cardinal tips.
- Distinct from the active marker: different color (coral vs gold), different shape (crosshair vs ring).

### Reachable Movement Cells

When in main interaction mode, reachable cells show:

- Cyan inset fill (0x4fb3d9, 18% alpha) across the cell interior.
- Cyan stroke (0x6ed8ff, 55% alpha, 1px) around the inset border.
- Inset of ~14% of cell size from each edge.
- Hidden immediately when entering attacks or abilities submenus (unchanged behavior).

Active token, target reticle, and reachable cells all use distinct visual treatments with no shared colors or shapes.

---

## 3. Range-Band Presentation & Runtime Menu Integration

The three weapon range bands are mapped to distinct visual roles.

| Band | Color | Weight | Display Label | Style Weight | Notes |
|---|---|---|---|---|---|
| melee | Amber 0xf2c14e | Heavy | Melee | Bold | Adjacent-cell treatment |
| short | Violet 0xb983ff | Medium | Short | Normal | Medium dashed/ring treatment |
| long | Steel blue 0x6aadcc | Light | Long | Italic | Thin extended endpoint cue |

### Runtime Menu Integration

A small dedicated combat range/menu presentation view (`CombatMenuView`) is used at runtime.
The menu consumes the presentation mappings from `src/game/visual/combatRangePresentation.ts` and `src/game/visual/combatantPresentation.ts`.

It renders separate Phaser Text objects for each attack menu option dynamically:
- Melee options use the amber color and bold fontStyle.
- Short options use the violet color and normal fontStyle.
- Long options use the steel-blue color and italic fontStyle.
- The READY/BLOCKED availability status remains explicit in the text (e.g. `[1] Practice Strike - Melee 1 - READY` or `[2] Crossbow - Short 4 - BLOCKED (distance 5)`).
- The BACK option (`[0] Back`) is rendered in neutral ivory color.

---

## 4. Defeated State

When a combatant's HP reaches zero:

- Token body is replaced with a desaturated stone-gray circle (0x4c5968, 70% alpha).
- A gray X overlay (0x7b8491) is drawn across the token.
- All emblems are hidden in defeated state.
- The session remains authoritative; the visual reflects `getCombatSessionLife().current <= 0`.

---

## 5. Asset Catalog & Fallback Resolution

The combat arena and combatant factories are connected to stable keys and deterministic resolution:

- `VISUAL_ASSET_KEYS.combatGround`
- `VISUAL_ASSET_KEYS.playerActor`
- `VISUAL_ASSET_KEYS.enemyActor`

At runtime, the scene calls `getVisualAssetEntry` to fetch the metadata, and then resolves the asset via `resolveVisualAsset(entry, (key) => scene.textures.exists(key))`.

- **Missing-Texture Path (Fallback)**: When no textures are loaded (since no combat raster assets exist yet), the resolution returns a fallback mode (`fallback`). The factories visibly retain the delivered code-native Phaser Graphics.
- **Future Loaded Textures Path**: If a texture becomes loaded, the factories automatically render the loaded texture key:
  - The arena ground renders the texture using a `Phaser.GameObjects.TileSprite`.
  - The combatants render the texture using a `Phaser.GameObjects.Sprite` scaled to the cell size, positioned using the catalog entry's anchor config. In the defeated state, the sprite is tinted gray and overlayed with the gray X.

---

## 6. Files Changed in Milestone 4

The following files were created or modified during Milestone 4 implementation and correction pass:

### New Modules - `src/game/visual/`

- [`combatLayerDepths.ts`](../src/game/visual/combatLayerDepths.ts) - Pure typed depth constants (no Phaser).
- [`combatVisualConfig.ts`](../src/game/visual/combatVisualConfig.ts) - Combat palette, arena, token, overlay config.
- [`combatantPresentation.ts`](../src/game/visual/combatantPresentation.ts) - Pure mapping helpers: role, state, team palette, availability.
- [`combatRangePresentation.ts`](../src/game/visual/combatRangePresentation.ts) - Range band -> presentation config mapping.
- [`combatMenuView.ts`](../src/game/visual/combatMenuView.ts) - Renders attack range roles and availability at runtime.
- [`combatOverlayPresentation.ts`](../src/game/visual/combatOverlayPresentation.ts) - Grid line and reachable-cell drawing helpers.
- [`createCombatArenaView.ts`](../src/game/visual/createCombatArenaView.ts) - Stone arena ground view factory supporting fallback and textures.
- [`createCombatantView.ts`](../src/game/visual/createCombatantView.ts) - Warrior/adversary token drawing supporting fallback and textures.
- [`combatVisuals.test.ts`](../src/game/visual/combatVisuals.test.ts) - Focused tests for range presentation, fallback resolution, and catalog mapping.

### Modified

- [`debugCombatGridView.ts`](../src/game/debug/debugCombatGridView.ts) - Internal implementation rewritten to delegate to new visual factories.
- [`PrototypeScene.ts`](../src/game/scenes/PrototypeScene.ts) - Integrated `CombatMenuView` at runtime.

---

## 7. Tests Added & Final Count

**File**: `src/game/visual/combatVisuals.test.ts`
**New Tests**: 45 focused tests verifying layer depths, palette distinction, role mapping, state mapping, range presentation output, catalog fallback resolution, and explicit status labels.

### Final Verification Results

- `npm run typecheck` - PASSED
- `npm run test` - PASSED (42 test files, 365 tests successfully completed)
- `npm run build` - PASSED (bundle size warnings within standard parameters)

---

## 8. Runtime Validation & Viewports Reviewed

The following manual and runtime checks were completed via the local browser console:

- **Initial combat**: Player warrior at (2,4) and gargoyle at (6,4) render code-native fallback tokens on stone floor.
- **Attacks submenu**: Displays the actions with colors and styles mapped to their range bands (Strike in amber/bold, Crossbow in violet/normal, Bow in steel-blue/italic).
- **Reachable cells**: Shown during movement/main mode, hidden in submenus.
- **Melee blocked at distance 4**: Shows BLOCKED.
- **Melee ready at distance 1**: Shows READY.
- **Short/Long ready states**: Correctly evaluated at distance 4.
- **Asset fallback path**: Resolves to fallback mode and draws graphics correctly.
- **Browser console**: Zero errors, warning, or log duplicates.
- **Reset**: Restores positions and redraws all elements cleanly.
- **Outcome**: Banners for victory/defeat display correctly.
- **Return to exploration**: Destroys combat view container/graphics and restores exploration mode cleanly.
- **Desktop & Smaller viewport**: Clean resize scaling without overlaps or visual clipping.
