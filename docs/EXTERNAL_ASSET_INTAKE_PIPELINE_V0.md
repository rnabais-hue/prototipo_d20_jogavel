# External Asset Intake Pipeline v0

## 1. Purpose and Status

- **Status**: Milestone 6.5 Infrastructure Complete.
- **Purpose**: Prepare the project to accept externally created images, map textures, character sprites, spritesheets, effects, props, and UI images in a controlled, validated, and repeatable way. 
This pipeline establishes directory layouts, typed catalog extensions, loading boundaries, pure metadata validators, and quality checklists. No final raster assets are integrated under this milestone, ensuring the existing code-native Phaser Graphics fallbacks remain fully functional.

---

## 2. Directory Structure

All visual assets must reside in the static assets layout under `public/assets/`:

- **`actors/`**: Character and monster tokens/spritesheets.
  - **`player/`**: Playable characters.
  - **`enemies/`**: Hostile adversaries.
- **`terrain/`**: Flooring backgrounds.
  - **`exploration/`**: Tilesets for exploration mode.
  - **`combat/`**: Tilesets for tactical combat arena.
- **`world/`**: Interactive and decorative environment objects.
  - **`obstacles/`**: Solid wall blockages.
  - **`points-of-interest/`**: Levers, switches, survey points.
  - **`objectives/`**: Exit portal arches, victory markers.
- **`effects/`**: Combat animations and visual feedback.
  - **`attacks/`**: Weapon arc/swing visuals.
  - **`impacts/`**: Hit frames, floats, flashes.
  - **`defeat/`**: Actor death visual sequences.
- **`ui/`**: HUD layouts and options indicators.
  - **`icons/`**: Action selection badges.
  - **`panels/`**: Dialog frames, menus, nine-slice background tiles.
- **`manifests/`**: Metadata indexes or future texture atlas description JSONs.

---

## 3. Supported Resource Kinds

The visual subsystem categorizes and loads resources using a strongly-typed discriminated union:

1. **Static Images (`resourceKind: 'image'`)**:
   - Single-frame raster files (primarily PNG or WebP).
   - Require stable keys, paths under `/assets/`, logical size config, and anchors.
2. **Spritesheets (`resourceKind: 'spritesheet'`)**:
   - Multi-frame textures for grid movements, impact flashes, and death animations.
   - Require uniform frame width and frame height, alongside optional margin, spacing, and range bounds.

---

## 4. Workflows

### Catalog Registration Workflow
1. Identify or add the unique semantic key in `src/game/visual/assetKeys.ts`.
2. Open `src/game/visual/assetCatalog.ts`.
3. Add the entry mapping to `VISUAL_ASSET_CATALOG` using the helpers:
   - For images: `entry(...)`
   - For spritesheets: `createSpritesheetEntry(...)`
4. Set `path` to the absolute path starting with `/assets/`.
5. Specify correct logical sizes and anchors.

### Loading Workflow
1. Scenes invoke `queueVisualAssets(scene, catalog)`.
2. The loader checks if the catalog item has `loadByDefault === true` and a valid non-null path.
3. For image entries: queues via `scene.load.image`.
4. For spritesheet entries: verifies frame dimensions are positive, then queues via `scene.load.spritesheet`.
5. Duplicate entries within the same loading boundary call are blocked to prevent console warnings or multiple fetches.

### Provenance Workflow
1. For every added asset, append an entry to `public/assets/PROVENANCE.md`.
2. Log creation date, creator details, model specs (for AI-generated work), licensing constraints, and modification logs.
3. Verify that the `provenanceRef` property in the catalog matches `public/assets/PROVENANCE.md` or a local sub-folder markdown document.

---

## 5. Visual Standards and Constraints

- **Sprite Anchor & Scale Rules**:
  - Ground-based actors (players, enemies) must anchor at their feet, standard: `(x: 0.5, y: 0.82)`.
  - Static world objects (walls, tiles, tilesets) anchor at the center: `(x: 0.5, y: 0.5)`.
  - Scaled sprites are drawn using catalog logical widths and heights rather than raw source pixels.
- **Terrain Texture Rules**:
  - Must tile seamlessly on both the X and Y axes.
  - Sized at power-of-two ratios (e.g. 32x32, 64x64, 128x128).
- **Spritesheet Frame Rules**:
  - Frames must be uniform in dimensions (no variable sizes).
  - Config must detail exact positive frame width and height.

---

## 6. Fallback Behavior

If any asset load fails, if the path is `null`, or if the item is disabled:
- `resolveVisualAsset` marks the key resolution as `'fallback'`.
- Visual drawing views (`createCombatantView`, `createCombatArenaView`, `drawExplorationActor`, etc.) catch this resolution.
- They render the corresponding detailed, high-contrast, code-native Phaser Graphics shapes, outlines, and emblems.
- Gameplay logic remains completely unaffected by loading failures.

---

## 7. Asset Acceptance Checklist

Before approving any incoming asset for integration, check off the following criteria:

- [ ] **Correct Directory**: Placed inside the appropriate folder structure under `public/assets/`.
- [ ] **Stable Semantic Key**: Registered in `src/game/visual/assetKeys.ts`.
- [ ] **Catalog Entry**: Configured correctly with proper resourceKind in `src/game/visual/assetCatalog.ts`.
- [ ] **Documented Provenance**: Logged inside `public/assets/PROVENANCE.md`.
- [ ] **License or Generation Record**: Verified as legally permissive or generated with documented models, prompt, and tool tags.
- [ ] **Correct Transparency**: Background is transparent (for actors, UI icons, effects) and does not leave a visible color halo.
- [ ] **No Unwanted Background**: Actor borders blend smoothly into dark backgrounds.
- [ ] **Correct Perspective**: Matches orthogonal top-down flat perspective (no isometric angles).
- [ ] **Correct Anchor**: Contact points align correctly on actors (`y: 0.82`) and tiles (`y: 0.5`).
- [ ] **Correct Logical Dimensions**: Catalog parameters match proportional gameplay grid dimensions.
- [ ] **Tileable Edges**: Seamless tiling verified for all ground textures.
- [ ] **Frame Consistency**: Uniform frames verified for spritesheets.
- [ ] **No Blank/Cropped Frames**: Checked all frames inside sheet animations for clipping or visual gaps.
- [ ] **Visible Fallback**: Native fallback graphics draw correctly if the file path is disabled.
- [ ] **Runtime Load**: Game launches with the asset enabled without generating console warnings or errors.
- [ ] **Viewport Review**: Reviewed layout spacing and positioning on normal desktop and smaller viewports.

---

## 8. Validation Performed

1. **Discriminated Union Compiler Guarantees**:
   - Compiler throws error if frame dimension properties are attached to image entries.
   - Spritesheets are constrained to require frame dimensions.
2. **Pure Unit Checks (`validateVisualAssetCatalog`)**:
   - Missing/unexpected keys, duplicate definitions.
   - Zero/negative logical width/height, out-of-range anchors.
   - Spritesheet frame range mismatches (e.g. start > end, negative margins).
   - Paths outside `/assets/`, enabled entries with null paths, malformed provenance strings.
3. **Phaser Loader Queue Unit Checks**:
   - Queueing image vs spritesheet calls.
   - Double queueing filters.
   - Safe validation guards prior to queueing.

---

## 9. Known Limitations

- **No Binary Assets**: Visual representations are still code-native Graphics fallbacks, as no actual image assets are packed in this milestone.
- **No Atlas Integration**: Only static images and standard spritesheets are handled. Texture atlas loading (JSON + PNG) is not implemented.
