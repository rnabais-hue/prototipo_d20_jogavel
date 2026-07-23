# External Art Direction Design Cut v0

## 1. Status, decision and scope

- **Track:** External Art Production & Integration
- **Milestone:** A1 — Art Direction Design Cut v0
- **Status:** approved design direction; no image production or runtime integration in this milestone
- **Approval basis:** the user approved the recommended package on 2026-07-15 and then approved the **abandoned underground temple** terrain theme for A2
- **Project:** `G:\Meu Drive\Ideias Ruins\Jogo Tormenta\prototipo_d20_jogavel`

The approved direction is **original illustrated tactical fantasy**: orthographic terrain, actors and props with a restrained three-quarter sense of volume, medium-low detail, strong silhouettes, an abandoned underground temple environment, and an earthy palette with preserved tactical accents.

This document governs future image generation, review and integration. It does not approve any generated image in advance. No asset may enter the runtime catalog until it passes human approval and the technical checks defined here.

### A1 boundaries

- Do not generate images during A1.
- Do not add binary assets during A1.
- Do not edit gameplay, rules, movement, combat, exploration or presentation behavior.
- Preserve semantic keys, deterministic fallbacks, normal/debug modes, resize behavior, motion and feedback.
- Keep all protected settings, characters, symbols, logos, costumes and visual identities out of prompts and outputs.
- Do not imitate a named franchise or living artist.

## 2. Inspected baseline

The baseline below was confirmed from the current repository, not only from prior closeout claims.

### Runtime and layout

- Phaser `3.90`, TypeScript, Vite and Vitest.
- Logical canvas: `800 x 450`, using Phaser FIT and centered scaling.
- Supported smaller landscape viewport: `640 x 360`.
- Portrait layouts are not currently supported.
- Exploration grid: orthogonal `18 x 10`, `32 px` cells, origin `(112, 68)`, total map area `576 x 320`.
- Combat grid: orthogonal `10 x 8`, responsive cell size capped at `42 px`.
- Current combat layout yields approximately `22.25 px` cells at `800 x 450` and `14.5 px` cells at `640 x 360`, because the console and HUD reserve vertical space.
- Tactical readability must therefore be tested at `32 px`, `22 px`, `16 px` and `14 px`, not only on enlarged source images.

### Visual infrastructure

- Fourteen stable semantic asset keys exist for terrain, obstacles, actors, points of interest, effects and UI.
- All catalog entries remain `loadByDefault: false`.
- No binary image asset is currently present under `public/assets/`.
- Catalog paths may be reserved while files remain absent and disabled.
- Image and uniform-grid spritesheet resources are supported; texture atlases are not yet supported.
- Missing, disabled or unloaded textures resolve to visible deterministic Phaser Graphics fallbacks.
- Pure rules and domain layers do not depend on filenames, textures, Phaser or visual timing.

### Validation observed during A1

- Typecheck passed with the installed local TypeScript compiler.
- Vitest passed: `401` tests in `47` files.
- Build was not rerun during this documentation-only inspection because it would rewrite `dist`.
- A fresh browser screenshot was not obtained: Windows browser control stopped when it could not verify the active URL with sufficient confidence. Runtime visual claims in this document therefore come from the inspected implementation and existing validated closeout, not a new screenshot session.

## 3. Approved art direction

### Experience target

The game should read as a compact tactical adventure taking place in an **abandoned underground temple**: old stone chambers, dungeon-like passages, moisture, sparse moss and traces of a forgotten original culture. The image family should feel authored and coherent without becoming visually dense. Every image must support cell recognition, actor recognition and state overlays before atmosphere or ornament.

Desired qualities:

- grounded, inviting fantasy rather than grim horror;
- old temple stone, packed earth in joints, sparse moss, moisture and worn metal;
- mystery without visual murkiness;
- strong, compact silhouettes;
- controlled color accents tied to tactical meaning;
- painterly surfaces simplified enough to survive heavy reduction;
- no photorealism and no pixel-art treatment.

### Perspective

- Terrain remains orthographic and aligned to the authoritative square grid.
- Terrain must not contain projected walls, diagonally receding planes or baked camera tilt.
- Actors and freestanding props may use a **soft three-quarter volume cue**: the viewer sees a restrained amount of front/side surface while the footprint remains centered in one cell.
- The three-quarter cue must never imply isometric movement, a diamond grid or a different facing system.
- Walls and obstacles must occupy exactly one square-cell footprint unless a later approved key specifies otherwise.
- Actor contact remains stable at the feet anchor; hats, weapons or silhouettes may extend upward but should not create a false occupied cell.

### Lighting

- Primary light comes from the upper left of the image.
- Light is broad and diffuse, not theatrical.
- Contact shadows fall subtly toward the lower right.
- Terrain uses nearly uniform illumination so repeated tiles do not reveal a strong lighting seam.
- No long cast shadows across neighboring cells.
- No rim lighting that competes with selection, target or active-turn overlays.
- Effects may be self-luminous, but their brightest area must remain transparent enough to preserve actor and grid information.

### Shape language

- Use broad readable masses before surface detail.
- Prefer slightly irregular hand-worked stone and practical fantasy construction.
- Corners may be softened by wear, but blocked-cell boundaries must remain visually firm.
- Player-facing forms lean stable, upright and shield-like.
- Hostile forms lean angular, claw-like and forward-weighted.
- Interactive props use a distinctive central silhouette plus one controlled accent color.
- Avoid micro-ornament, filigree, tiny runes and thin detached pieces.

### Detail level

The approved level is **medium-low**.

- At full source resolution, include enough material variation to avoid flat placeholders.
- At logical size, preserve two or three large value groups and one dominant silhouette.
- Details that disappear below `32 px` are optional texture, never required identification cues.
- At `14–22 px`, combatants must remain distinguishable by silhouette and value even with color removed.

## 4. Palette bible

The existing presentation colors remain the semantic source of truth. Generated assets may use nearby material colors, but must not appropriate reserved accents for unrelated decoration.

| Role | Baseline | Use |
| --- | --- | --- |
| Canvas charcoal | `#15181F` | outer background, deepest neutral |
| Slate | `#283548` | structure, cool stone support |
| Ground moss dark | `#28382C` | exploration ground base |
| Ground moss shadow | `#202D23` | quiet ground variation |
| Earth | `#8A6846` | soil, worn wood, warm material |
| Wall earth dark | `#403024` | blocked terrain mass |
| Player green | `#65C98C` | player identity only |
| Enemy coral | `#E85D5D` | hostile identity and danger |
| Movement cyan | `#4FB3D9` / `#6ED8FF` | reachable/movement information |
| Selection amber | `#F2C14E` / `#FFD166` | selection and active emphasis |
| Range/portal violet | `#B983FF` | short range, portal and path roles |
| Long-range steel blue | `#6AADCC` | long-range role |
| Ivory | `#F4F0E8` | emblems and high-value neutral |
| Disabled gray | `#7B8491` | disabled and defeated states |

### Palette rules

- Terrain saturation stays low.
- Player green and enemy coral may appear in actors, related small badges and state-specific accents only.
- Cyan, amber and violet must remain scarce in world art so overlays retain priority.
- Black is replaced by deep charcoal or colored shadow where possible.
- Highlights are warm ivory or muted mineral light, not pure white.
- Generated terrain candidates require grayscale inspection and overlay tests using cyan, amber, coral and violet.

## 5. Material bible

### Exploration ground — abandoned temple passages

- Worn temple flagstones with packed dark soil in the joints, shallow moss, moisture and occasional small stone fragments.
- Broad mottling rather than discrete scenic objects.
- No flowers or bright leaves that resemble tactical markers.
- No baked grid lines; Phaser owns grid presentation.

### Combat ground — dungeon chamber / ruined sanctuary

- Dark, worn dungeon stone slabs or the floor of a ruined inner sanctuary.
- Cooler and more neutral than exploration ground.
- Low-frequency material breakup with restrained cracks and abrasion.
- No painted circles, arrows, borders or encounter-specific symbols. Any geometric inlay must be original, nearly erased and too subtle to read as a rule marker.

### Walls and obstacles

- Heavy earth-brown or cool-gray masonry with clear mass and top edge.
- Mortar and bevels must survive at `32 px` without becoming a checker pattern.
- Avoid deep perspective and long shadows outside the cell.

### Wood, parchment and metal

- Wood: desaturated brown, broad grain only.
- Parchment: warm ivory with orange-brown rolls; no readable text.
- Common metal: dark iron or desaturated steel.
- Active mechanisms may use a restrained cyan glow.

### Magical material

- Portal energy uses violet with pale lilac highlights.
- Magic stays translucent and locally contained.
- Do not use broad bloom that hides tile boundaries.

## 6. Scale, anchors and source specifications

| Category | Logical bounds | Anchor | Recommended master | Review sizes |
| --- | ---: | ---: | ---: | --- |
| Exploration terrain tile | `32 x 32` | `(0.5, 0.5)` | `512 x 512` seamless master | `64`, `32`, tiled `3x3` |
| Combat terrain texture | nominal `42 x 42` | `(0.5, 0.5)` | `512 x 512` seamless master | `42`, `32`, `22`, `16`, `14` |
| Wall/obstacle | `32 x 32` | `(0.5, 0.5)` | `256 x 256` RGBA | `64`, `32` |
| Player actor | catalog `32 x 32` | `(0.5, 0.82)` | `256 x 256` RGBA | `32`, `22`, `16`, `14` |
| Enemy actor | catalog `32 x 32` | `(0.5, 0.82)` | `256 x 256` RGBA | `32`, `22`, `16`, `14` |
| Small POI | `18 x 18` | `(0.5, 0.5)` | `144 x 144` RGBA | `36`, `18` |
| Exit/portal | `24 x 24` | `(0.5, 0.5)` | `192 x 192` RGBA | `48`, `24` |
| Combat effect | up to cell bounds | `(0.5, 0.5)` | `256 x 256` RGBA per frame | `42`, `22`, `14` |
| UI icon | `16 x 16` | `(0.5, 0.5)` | `128 x 128` RGBA | `32`, `16` |
| UI panel sample | minimum `32 x 32` | `(0.5, 0.5)` | determined after UI proof | actual runtime panel |

### Technical rules

- Transparent categories export as PNG RGBA.
- Opaque terrain may use lossless/lossless-quality WebP after approval; proof masters remain lossless.
- Terrain must be mathematically seamless on both axes.
- Masters and runtime derivatives must use sRGB color space.
- Alpha edges must be checked on `#10141B`, `#F4F0E8` and a saturated diagnostic magenta background.
- No premultiplied-color fringe or opaque corner pixels.
- Downsampling must use a high-quality filter followed by restrained manual cleanup; do not sharpen into halos.
- Uniform spritesheet frames are mandatory when animation begins in A7.
- The runtime currently supports images and uniform spritesheets, not atlases.

## 7. Category specifications

### Terrain

- Seamless X/Y repetition.
- No unique landmark in a single repeat.
- No baked tactical grid.
- Quiet value range behind overlays.
- Exploration and combat surfaces share lighting and brush character but differ in hue and material.
- Every candidate is reviewed as a `3x3` repeat and at all target reductions.

### Actors

- One-cell footprint with feet centered on the anchor.
- Strong head/torso/weapon mass; avoid thin limbs as primary cues.
- Player and enemy distinguishable in grayscale and silhouette.
- Transparent background and no decorative ground disc baked into the sprite.
- Static neutral-ready poses precede animation.
- Weapons remain inside a conservative bounding box unless a later effect carries the attack arc.

### World props

- Central silhouette and one obvious interaction cue.
- Survey point: parchment/record object, warm neutral, no readable writing.
- Switch: lever-like mechanical form with separate inactive and active states if required.
- Exit: stone arch plus contained violet energy; locked, available and completed states remain mechanically derived.
- Encounter point: compact threat symbol or prop without protected heraldry.

### Effects

- Transparent, short-lived and centered on the resolved action.
- Attack, damage, miss and defeat remain distinct by timing, shape and color.
- Grid and actor silhouettes remain visible through most pixels.
- No effect may imply a rule such as area, cover or line of sight that the game does not implement.

### UI

- Flat, dark, compact and subordinate to text.
- Borders remain readable at `1–2 px` logical thickness.
- Icons require silhouette recognition at `16 px`.
- Do not bake text into images.
- Do not replace crisp dynamic tactical overlays with raster art unless separately approved.

### Animation spritesheets

- Deferred until static actor approval.
- Uniform frames, consistent footprint and anchor in every frame.
- Idle motion remains subtle; no perpetual bobbing that changes perceived cell position.
- Movement, attack and reaction poses must preserve cancellation-safe runtime behavior.

## 8. Prioritized asset list

1. Exploration terrain proof family.
2. Combat terrain proof family.
3. Static player actor.
4. Static primary enemy actor.
5. Walls and obstacles.
6. Survey point and switch.
7. Exit portal states and encounter trigger.
8. Combat attack, impact, miss, damage and defeat effects.
9. UI icons, borders and panels.
10. Actor animation spritesheets.

The first proof set is a joint **terrain family**, with exploration and combat candidates reviewed together for lighting, brush character and palette consistency. No candidate is approved merely because it looks good enlarged.

## 9. Approval criteria

An asset may be marked `Approved` only when all applicable criteria pass.

### Artistic approval

- Original generic fantasy with no recognizable protected identity.
- Consistent with the approved perspective, lighting, palette and material bible.
- Coherent with the other members of its proof family.
- Strong silhouette and controlled detail.
- Tactical accent colors remain available to overlays.

### Technical approval

- Correct source format, dimensions, alpha behavior and color space.
- Correct logical scale and anchor.
- No crop, halo, matte, stray pixel or unwanted background.
- Terrain repeats seamlessly in X and Y.
- Actor/prop footprint does not imply occupancy outside its authoritative cell.
- Recognizable at required logical sizes.
- Survives grayscale and dark-background checks.
- Does not obscure cyan, amber, coral or violet overlays.
- File has complete provenance and an explicit human approval record.

### Runtime approval before catalog enablement

- Correct semantic key and catalog metadata.
- Fallback remains available when the asset is disabled or missing.
- No console loading warning or blank texture.
- Normal and debug modes both work.
- `800 x 450` and `640 x 360` remain readable.
- Resize, transition, reset and motion cancellation remain safe.
- Tests, typecheck and build pass.

## 10. Rejection criteria

Reject or return for revision if any of the following is present:

- recognizable imitation of a franchise, existing character, logo or living artist;
- photorealism, pixel-art styling or dramatic concept-art background;
- isometric or oblique terrain perspective;
- inconsistent light direction or long baked shadows;
- non-tileable seam, mirrored edge artifact or obvious repeated landmark;
- tactical grid, arrows, labels, letters or readable text baked into terrain;
- excessive micro-detail that becomes noise at logical size;
- actor silhouette indistinguishable at `14–22 px`;
- player/enemy distinction dependent only on hue;
- opaque background, alpha halo or contaminated edge pixels;
- asset extends into adjacent occupied cells in a misleading way;
- cyan, amber, coral or violet used as broad decoration that competes with overlays;
- generated anatomical, architectural or material artifacts;
- inconsistent family brushwork, contrast or palette;
- missing prompt/model/date/license/processing record;
- enabled catalog entry before explicit approval.

## 11. Prompt framework

Prompts describe observable visual and technical properties. They must not name a franchise, commercial game, protected setting or living artist.

### Shared positive prompt block

```text
Original generic tactical fantasy game asset, cohesive illustrated production style, orthographic square-grid gameplay, stylized medium-low detail, broad readable shapes, strong value grouping, restrained painterly texture, ancient weathered ruins, diffuse light from upper left, subtle short contact shadows toward lower right, earthy low-saturation materials, controlled accent colors, readable after strong downscaling, no text, no logo, no protected characters or setting, production asset rather than concept art.
```

### Shared negative prompt block

```text
photorealistic, pixel art, voxel art, isometric grid, diamond grid, dramatic perspective, horizon, landscape scene, cinematic background, long cast shadow, hard spotlight, excessive bloom, dense micro-detail, ornate filigree, tiny runes, readable writing, letters, numbers, logo, watermark, border, frame, tactical grid lines, arrows, UI labels, franchise character, copyrighted symbol, imitation of a named artist, blurry edges, compression artifacts, color fringe, alpha halo, cropped object, duplicate object, malformed geometry.
```

### Terrain prompt base

```text
Create one seamless square terrain texture for an original tactical fantasy game. The surface is viewed directly from above and must tile perfectly on both axes. Use broad low-contrast material variation with no unique landmark, no baked grid and no directional cast shadow. Keep the texture quiet behind tactical overlays and readable when reduced to 32x32, 22x22, 16x16 and 14x14 pixels. Use diffuse upper-left illumination so subtly that repetition does not expose the light direction. Output an opaque square lossless master suitable for technical seam correction and downsampling.
```

### Actor prompt base

```text
Create one isolated full-body one-cell tactical fantasy character sprite on a transparent background. Use a soft three-quarter view while keeping the footprint centered for an orthographic square grid. Neutral ready pose, compact silhouette, broad head-torso-weapon masses, feet clearly visible for an anchor at x 0.5 y 0.82, diffuse upper-left light, short lower-right contact shadow only if it remains inside the sprite. No scenic base, no background, no text. The character must remain identifiable at 32, 22, 16 and 14 pixels and must differ from opposing actors by silhouette and value, not color alone.
```

### Prop prompt base

```text
Create one isolated tactical fantasy world prop on a transparent background, centered in a single orthographic square cell. Soft three-quarter volume, compact silhouette, medium-low detail, upper-left diffuse light, no long shadow and no scenic background. Preserve a clear interaction identity at 18 or 24 logical pixels without letters, readable writing or protected symbols.
```

### Effect prompt base

```text
Create one isolated transparent tactical combat effect with a compact centered shape and clean alpha edges. The effect must remain translucent enough to preserve the actor and square grid beneath it, fit within one cell unless explicitly specified, avoid text and avoid implying unimplemented area or line-of-sight rules. Use a small number of broad shapes and remain readable at 42, 22 and 14 pixels.
```

### UI prompt base

```text
Create one isolated functional fantasy UI asset on a transparent background. Flat dark treatment, restrained material texture, strong silhouette, clean edges, no baked text, no decorative flourish that reduces legibility. Preserve recognition at 16 logical pixels and maintain contrast on #10141B and #F4F0E8 test backgrounds.
```

## 12. Provenance and approval record

Every generated or externally sourced image must be represented in `public/assets/PROVENANCE.md` before runtime integration. Do not invent a provenance entry for an asset that does not yet exist.

Required fields:

- semantic asset key;
- repository path after approval;
- category and source type;
- creator or generator;
- exact model/tool and version when available;
- creation date;
- complete original prompt or durable prompt reference;
- source/reference images, if any;
- license or usage basis;
- all processing operations, including seam correction, crop, alpha cleanup, downsampling and color adjustment;
- approval status and approving human/date;
- replacement status and notes about scale/anchor.

Generated proofs remain outside runtime asset directories until approved. A proof may be labeled `Candidate`, `Rejected`, `Revision Requested` or `Approved`. Only `Approved` files may be copied to `public/assets/`, registered/enabled in the catalog and used by the runtime.

## 13. Track milestones

| Milestone | Deliverable | Human gate |
| --- | --- | --- |
| A1 | approved direction, specifications and prompts | completed by approval of this document |
| A2 | exploration/combat terrain proof family | approve/reject candidates before integration |
| A3 | static player and primary enemy proof | approve perspective, scale and anchor |
| A4 | walls, obstacles and world props | approve state clarity and footprint |
| A5 | combat effects | approve transparency, timing role and readability |
| A6 | UI asset pass | approve text hierarchy and icon readability |
| A7 | actor spritesheets | only after static actors are approved |
| A8 | integrated-art refinement | approve consistency across viewports and fallbacks |
| A9 | provenance, screenshots and closeout | final track validation |

Do not continue automatically from one milestone to the next. Each milestone requires an explicit user decision.

## 14. Complete prompt for A2 — Terrain Proof Set v0

```text
You are executing only Milestone A2: Terrain Proof Set v0 for the original TypeScript/Vite/Vitest/Phaser tactical RPG at:

G:\Meu Drive\Ideias Ruins\Jogo Tormenta\prototipo_d20_jogavel

The orchestrator owns scope, art direction, review and approval. You are a bounded image generator or proof-preparation executor. Do not continue to actors, props, effects, UI, animation or integration.

READ FIRST

- AGENTS.md
- docs/EXTERNAL_ART_DIRECTION_DESIGN_CUT_V0.md
- docs/EXTERNAL_ASSET_INTAKE_PIPELINE_V0.md
- public/assets/README.md
- public/assets/PROVENANCE.md
- src/game/visual/visualScale.ts
- src/game/visual/assetCatalog.ts
- src/game/visual/explorationVisualConfig.ts
- src/game/visual/combatVisualConfig.ts
- src/game/debug/debugExplorationConfig.ts
- src/game/debug/combatLayoutHelper.ts

GOAL

Produce a small coherent terrain proof family for human review:

1. two exploration-ground candidates;
2. two combat-ground candidates;
3. for every candidate, a seamless 3x3 repeat proof;
4. for every candidate, reductions at 64, 42, 32, 22, 16 and 14 pixels where applicable;
5. overlay legibility proofs using cyan, amber, coral and violet tactical marks;
6. grayscale proofs;
7. a candidate manifest containing prompt, generator/model/version, date, seed or generation identifier when available, processing steps and provisional status.

APPROVED DIRECTION

- original illustrated tactical fantasy;
- orthographic terrain viewed directly from above;
- ancient overgrown ruins;
- stylized medium-low detail;
- broad readable shapes and low-frequency texture;
- diffuse upper-left illumination with no long cast shadows;
- earthy low-saturation materials;
- no pixel art and no photorealism;
- no franchise, protected identity or imitation of a named living artist.

EXPLORATION FAMILY

Create two variants of seamless abandoned-temple passage flooring: worn flagstones with packed dark earth in the joints, shallow moss, moisture and occasional small stone fragments. One candidate may be more dungeon-like and irregular; the other may use larger, more orderly temple slabs. There must be no unique landmark, flower-like tactical marker, readable symbol, baked grid or discrete object. Use the established dark moss and earth family near #28382C, #202D23 and #8A6846. Keep cyan, amber, coral and violet scarce so runtime overlays dominate.

COMBAT FAMILY

Create two variants of seamless dark worn temple stone for combat: one dungeon chamber floor and one ruined inner-sanctuary floor. Use broad abrasion, moisture variation and restrained cracks. The sanctuary candidate may contain extremely subtle, original and nearly erased geometric inlay, but it must not read as a circle, arrow, border, heraldry, real religious symbol or tactical marker. There must be no readable symbol or baked grid. The floor must remain quiet below combatants and overlays near the current arena family #161E2A, #1C2535 and #2E3D52.

SHARED POSITIVE PROMPT

Original generic tactical fantasy game terrain, cohesive illustrated production style, orthographic square-grid gameplay, seamless square texture, stylized medium-low detail, broad readable material shapes, low-frequency restrained painterly texture, ancient weathered ruins, diffuse upper-left light, earthy low-saturation palette, quiet tactical background, readable after strong downscaling, no unique landmark, no text, no logo, no protected setting, production texture rather than concept art.

SHARED NEGATIVE PROMPT

photorealistic, pixel art, voxel art, isometric, diamond grid, perspective plane, horizon, landscape scene, cinematic background, long cast shadow, hard spotlight, bloom, dense micro-detail, filigree, runes, readable writing, letters, numbers, logo, watermark, frame, border, tactical grid lines, arrows, circles, map marker, franchise imagery, copyrighted symbol, named artist imitation, obvious repeated landmark, mirrored seam, blurry texture, compression artifact.

TECHNICAL REQUIREMENTS

- Generate lossless square masters, preferably 512x512 or larger.
- Make every candidate mathematically seamless on X and Y; generation claims alone are insufficient.
- Perform an offset/seam inspection and repair before presenting a candidate.
- Preserve sRGB color behavior.
- Produce 3x3 repeat contact sheets with no seam guides covering the actual joins.
- Downsample with a high-quality filter and inspect the real target sizes.
- Do not add tactical grid lines to the image.
- Do not place any proof in public/assets/.
- Do not edit assetKeys.ts, assetCatalog.ts, loader code, renderer code or provenance approval logs.
- Do not set loadByDefault to true.
- Do not alter gameplay or presentation code.
- Do not claim a candidate is final art or approved.

LEGIBILITY TEST

For each candidate, create a neutral proof showing representative one-cell overlays in:

- movement cyan #4FB3D9 / #6ED8FF;
- selection amber #F2C14E / #FFD166;
- hostile coral #E85D5D;
- path/range violet #B983FF.

The overlay must remain immediately visible at 32, 22, 16 and 14 pixels. If a candidate competes with any overlay, reduce local contrast/saturation and regenerate the proof.

DELIVERY AND HUMAN GATE

Present the four labeled candidates to the orchestrator with:

- full master preview;
- 3x3 tiling preview;
- real-size reductions;
- overlay and grayscale proofs;
- exact prompt and negative prompt;
- generator/model/version and generation identifier;
- all post-processing steps;
- known limitations;
- a recommendation, without marking it approved.

Stop after presentation. Ask the user to approve, reject or request revision for each candidate. Do not integrate any file and do not begin Milestone A3.
```

## 15. A1 completion gate

A1 is complete when:

- this document exists at `docs/EXTERNAL_ART_DIRECTION_DESIGN_CUT_V0.md`;
- it records the approved direction and technical baseline;
- it contains prompts, negative prompts, provenance rules and A2 executor instructions;
- no image or binary asset was generated or integrated;
- no runtime/catalog behavior changed;
- the next action is explicitly a user-authorized A2 proof generation step.
