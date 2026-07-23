# External Asset Intake Pipeline - Guidelines & Catalog Registration

This directory contains the public static boundary and folders for the Playable Presentation assets of the custom d20-inspired tactical RPG prototype.

---

## 1. Directory Structure

Each directory represents a specific presentation domain:

- **`actors/`**: Character and creature visuals.
  - **`player/`**: Player-controlled character sprites, spritesheets, or static tokens.
  - **`enemies/`**: Adversary character sprites, spritesheets, or static tokens (e.g. monsters, guards).
- **`terrain/`**: Environmental background grids and flooring textures.
  - **`exploration/`**: Tilesets and terrain textures for adventure map navigation.
  - **`combat/`**: Battle field terrain grid graphics or textures.
- **`world/`**: Interactive, static, or structural environmental props.
  - **`obstacles/`**: Solid structural elements like walls, trees, blockages.
  - **`points-of-interest/`**: Interactive props like switches, levers, survey scrolls, search items.
  - **`objectives/`**: Objective/exit points, destination markers, portal arches.
- **`effects/`**: Combat and exploration visual feedback assets.
  - **`attacks/`**: Weapon swings, projectile arrows, magical discharges, or visual strikes.
  - **`impacts/`**: Splashes, hit flares, defensive blocks, shield deflects, resource floating feedback.
  - **`defeat/`**: Crumple, fade-out overlays, death states, or static remains.
- **`ui/`**: Interface design frames, HUD textures, and iconography.
  - **`icons/`**: Ability, action (melee, short, long, back), or status indicator badges.
  - **`panels/`**: HUD panel backgrounds, borders, or standard text windows (e.g. for nine-slice layout).
- **`manifests/`**: Metadata configuration registries, catalogs, or frame indices.

---

## 2. File Format Specifications

To maintain performance, memory limits, and seamless rendering, strictly adhere to the following formats:

- **PNG (`.png`)**:
  - Mandatory for all transparent actors, props, icons, panels, and combat effects.
  - Recommended for standard UI elements.
  - Colors must be exported in 8-bit or 24-bit with alpha channel enabled (RGBA).
- **WebP (`.webp`)**:
  - Preferred for opaque terrain textures (e.g., stone flooring, tiled dirt) due to high compression efficiency.
- **JSON (`.json`)**:
  - Only allowed in combination with `.png` files when implementing Phaser textures atlas packs.
- **No SVG (`.svg`)**:
  - Vector files are prohibited due to runtime rendering overhead and browser security policies unless explicitly approved.

---

## 3. Filename Conventions

- Use **lowercase alphanumeric** characters separated by hyphens (kebab-case).
- Prefix files with their category role if helpful.
- Examples:
  - `/assets/actors/player/warrior-idle.png`
  - `/assets/terrain/exploration/moss-ground.webp`
  - `/assets/world/points-of-interest/lever-active.png`

---

## 4. Visual & Technical Expectations

### Transparency
- Actors, effects, UI icons, and interactive props **must have a transparent background**.
- Avoid rough borders, anti-aliased halos, or remaining background colors. Edges should blend cleanly with dark (#10141b) and light background overlays.

### Tileability
- Terrain textures (exploration/combat ground) **must be perfectly tileable** (seamless horizontal and vertical looping).
- Standard tiling bounds are matching power-of-two grids (e.g. 32x32, 64x64, 128x128).

### Sprite Anchors
- Actor sprites must anchor at their ground contact point rather than the geometric center.
  - Recommended player/enemy anchor: `(x: 0.5, y: 0.82)`.
  - Wall obstacles, panels, and basic terrain anchor at the center: `(x: 0.5, y: 0.5)`.

### Logical Sizing vs. Source Resolution
- Game logic positions entities using an orthogonal grid. The presentation scales source textures to match their **Logical Dimensions** in the catalog.
- Standard logical dimensions:
  - Exploration tile/obstacle: `32 x 32` logical pixels.
  - Combat cell: dynamic (maximum `42 x 42` logical pixels).
  - UI Icons: `16 x 16` logical pixels.
- The actual source resolution can be higher (e.g., `64x64` or `128x128` pixels for high-DPI display density) but must scale proportionally to fit the logical dimensions configuration.

### Spritesheet Frame Conventions
- Spritesheet frames must be uniform in dimensions (`frameWidth` and `frameHeight`).
- Frame indexes start at `0` from the top-left corner, progressing horizontally then vertically.
- Use explicit `margin` and `spacing` fields if the source sheet has grid borders.

---

## 5. Catalog Integration & Boundaries

- **Strict Domain Logic Boundary**: Direct file paths, filenames, and asset keys are strictly forbidden within the rules, combat, movement, or exploration code layers. These layers remain pure.
- **Register Every Asset**: Every visual asset used at runtime must be defined in the typed catalog in `src/game/visual/assetCatalog.ts` and bound to a stable key from `src/game/visual/assetKeys.ts`.
- **Deterministic Fallbacks**: If an asset path is `null`, is disabled, or fails to load, the presentation layer must resolve to a deterministic, code-drawn Phaser Graphics fallback. Game loop logic never crashes due to a missing file.

### Asset Replacement Workflow
1. Export the new asset to the correct folder under `public/assets/` following filename conventions.
2. Log its origin, licensing, and processing notes in `public/assets/PROVENANCE.md`.
3. Locate its stable key in `src/game/visual/assetKeys.ts`.
4. Update the catalog entry in `src/game/visual/assetCatalog.ts`:
   - Change `path` from `null` to the valid `/assets/...` path.
   - Configure the appropriate `resourceKind` ('image' or 'spritesheet').
   - Set `loadByDefault: true` (if required to load at boot).
   - Enter logical width, height, anchor, and spritesheet frame dimensions.
5. Re-run validation (`npm run test`) to confirm no metadata mismatch.
6. Verify visual rendering inside the game scene at runtime.
