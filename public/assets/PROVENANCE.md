# Asset Provenance Log & Templates

This file tracks the provenance, licensing, creation method, and modification history of all visual assets in this repository.

> [!IMPORTANT]
> **Strict Verification Requirements**:
> - No visual assets may be committed without a corresponding entry in this log.
> - Artificial Intelligence (AI) generated assets are permitted only if they are fully traceable, documented, and reviewed for license compliance.
> - Do not invent provenance entries for assets that do not yet exist in the repository.

---

## 1. Asset Provenance Template

Use this markdown template for every new asset registered in `src/game/visual/assetCatalog.ts`:

```markdown
### [Asset Key: e.g. visual.actor.player]

- **Semantic Asset Key**: `[Insert Key]`
- **Repository Path**: `[e.g., /assets/actors/player/warrior.png]`
- **Category**: `[actors | terrain | world | effects | ui]`
- **Source Type**: `[generated-raster | permissive-external | repository-graphics | temporary-fallback]`
- **Creator or Generator**: `[Author name or AI tool name]`
- **Model/Tool & Version**: `[Only for AI-generated assets: e.g., Midjourney v6.0, Stable Diffusion XL]`
- **Creation Date**: `[YYYY-MM-DD]`
- **Original Prompt or Prompt-Reference Path**: `[Only for AI-generated: prompt text or path to prompt text file]`
- **Source/Reference Images**: `[URLs to source references or original license links]`
- **License or Usage Basis**: `[e.g., CC0, Public Domain, Custom Permissive License]`
- **Modifications Performed**: `[e.g., cropped to 32x32, removed background color, converted to indexed colors, adjusted alpha borders]`
- **Approval Status**: `[Pending | Approved]`
- **Replacement Status**: `[Original | Replaced by <version/date>]`
- **Notes**: `[Any additional comments on scaling, anchoring, or frame limits]`
```

---

## 2. Provenance Logs

### visual.exploration.terrain.ground

- **Semantic Asset Key**: `visual.exploration.terrain.ground`
- **Repository Path**: `/assets/terrain/exploration/abandoned-temple-floor-e2p1.png`
- **Category**: `terrain`
- **Source Type**: `generated-raster`
- **Creator or Generator**: OpenAI built-in image generator
- **Model/Tool & Version**: model and version are not exposed by the built-in tool; no model identifier is inferred
- **Creation Date**: `2026-07-15`; periodic correction and human approval: `2026-07-16`
- **Original Prompt or Prompt-Reference Path**: candidate `E2` prompt in `C:\Users\rnaba\.codex\visualizations\2026\07\16\019f6857-f391-7ef1-9b8a-48979bee1290\A2_TERRAIN_PROOF_REVIEW_V0.md`, section `E2`. The prompt requests an original orthographic, seamless abandoned-underground-temple exploration floor with large orderly worn slabs, packed dark earth, subtle dampness, sparse shallow moss, low-saturation earth/moss colors, diffuse nearly uniform light, medium-low detail, no objects, symbols, grid, text, protected identity, franchise reference, or named-artist imitation.
- **Source/Reference Images**: no third-party reference images; generated E2 master: `C:\Users\rnaba\.codex\generated_images\019f686d-4aa7-7a01-82bc-557a49559b0c\exec-63152bda-88e6-4e3b-a0ff-7b98079c073a.png`
- **License or Usage Basis**: generated specifically for this private project with the OpenAI built-in image generator; use remains subject to the applicable OpenAI service terms; no third-party asset license is claimed
- **Modifications Performed**: approved E2 RGB master processed by periodic-plus-smooth FFT decomposition independently per RGB channel; the smooth boundary-discontinuity component was removed; output rounded and clipped to 8-bit sRGB-compatible RGB; no crop, blur, repaint, rescale, new content, or alpha modification. Final file is opaque RGB PNG, `1254 x 1254`.
- **Integrity**: SHA-256 `2A3BFB97F180AB0E58838F0BC271F21C5361611C023D96EF68619DBCD10A3226`
- **Approval Status**: `Approved` by the user on `2026-07-16` as `E2P1`
- **Replacement Status**: `Original` runtime integration of the approved A2 candidate
- **Notes**: center anchor `(0.5, 0.5)`; catalog logical size `32 x 32`; validated as a `3 x 3` repeat and at the supported `32 px` exploration size. Deterministic Phaser Graphics terrain fallback remains active when the texture is unavailable.

### visual.combat.terrain.ground

- **Semantic Asset Key**: `visual.combat.terrain.ground`
- **Repository Path**: `/assets/terrain/combat/ruined-sanctuary-floor-c2p1.png`
- **Category**: `terrain`
- **Source Type**: `generated-raster`
- **Creator or Generator**: OpenAI built-in image generator
- **Model/Tool & Version**: model and version are not exposed by the built-in tool; no model identifier is inferred
- **Creation Date**: `2026-07-15`; periodic correction and human approval: `2026-07-16`
- **Original Prompt or Prompt-Reference Path**: candidate `C2` prompt in `C:\Users\rnaba\.codex\visualizations\2026\07\16\019f6857-f391-7ef1-9b8a-48979bee1290\A2_TERRAIN_PROOF_REVIEW_V0.md`, section `C2`. The prompt requests an original orthographic, seamless ruined-inner-sanctuary combat floor with cold dark worn slabs, broad abrasion, restrained dampness, sparse cracks, optional nearly erased non-symbolic inlay, low-saturation charcoal-blue colors, quiet contrast at `42/32/22/16/14 px`, no objects, tactical markings, readable symbols, text, protected identity, franchise reference, or named-artist imitation.
- **Source/Reference Images**: no third-party reference images; generated C2 master: `C:\Users\rnaba\.codex\generated_images\019f686d-4aa7-7a01-82bc-557a49559b0c\exec-3073c1a7-17d6-47d4-b2de-192143a92789.png`
- **License or Usage Basis**: generated specifically for this private project with the OpenAI built-in image generator; use remains subject to the applicable OpenAI service terms; no third-party asset license is claimed
- **Modifications Performed**: approved C2 RGB master processed by periodic-plus-smooth FFT decomposition independently per RGB channel; the smooth boundary-discontinuity component was removed; output rounded and clipped to 8-bit sRGB-compatible RGB; no crop, blur, repaint, rescale, new content, or alpha modification. Final file is opaque RGB PNG, `1254 x 1254`.
- **Integrity**: SHA-256 `01D201B6B86C0624DE0A14EB33E669D87F3270F0D0519E298E6B133E5988348E`
- **Approval Status**: `Approved` by the user on `2026-07-16` as `C2P1`
- **Replacement Status**: `Original` runtime integration of the approved A2 candidate
- **Notes**: center anchor `(0.5, 0.5)`; catalog nominal logical size `42 x 42`; runtime `TileSprite` scale derives from the loaded texture dimensions and current responsive combat cell size. Validated as a `3 x 3` repeat and at `22 px` and `14 px`. Deterministic Phaser Graphics terrain fallback remains active when the texture is unavailable.

### visual.actor.player

- **Semantic Asset Key**: `visual.actor.player`
- **Repository Path**: `/assets/actors/player/guardian-explorer-p2r1.png`
- **Category**: `actors`
- **Source Type**: `generated-raster`
- **Creator or Generator**: OpenAI built-in image generator
- **Model/Tool & Version**: model and version are not exposed by the built-in tool; no model identifier is inferred
- **Creation Date**: `2026-07-17`
- **Original Prompt or Prompt-Reference Path**: exact P2 generation prompt in `C:\Users\rnaba\.codex\visualizations\2026\07\16\019f6857-f391-7ef1-9b8a-48979bee1290\A3-player-proofs\A3_PLAYER_P1_P2_MANIFEST.md`, section `P2 — Guardian-explorer`; exact sword-edit prompt and processing record in the sibling `A3_PLAYER_P2R1_MANIFEST.md`
- **Source/Reference Images**: no third-party reference images; P2R1 precisely edited the generated `A3-player-P2-source-magenta.png`; built-in edit generation identifier `exec-248cb662-736f-4fe6-a4f5-3711bb25a806`
- **License or Usage Basis**: generated specifically for this private project with the OpenAI built-in image generator; use remains subject to the applicable OpenAI service terms; no third-party asset license is claimed
- **Modifications Performed**: the P2 hammer/mace was replaced with a compact one-handed sword by a built-in image edit. Chroma background sampled near `#f703ef` and removed with border auto-key, soft matte, thresholds `12/220` and despill; alpha bounds were cropped and normalized with Lanczos into a `256 x 256` RGBA master; feet baseline placed at y=`210` for anchor `(0.5, 0.82)`. The edit caused a subtle incidental repaint outside the weapon: whole alpha IoU versus P2 `94.37%`, outside-weapon RGB MAE `10.556/255`.
- **Integrity**: SHA-256 `E4C4EA636A5780F47976C7F18C8637E3F033ED33C3BDD9CBC4F04A10DABB861C`
- **Approval Status**: `Approved` by the user on `2026-07-17` as `P2R1`, including acceptance of the measured incidental repaint
- **Replacement Status**: `Original` runtime integration of the approved A3 player candidate
- **Notes**: static image; catalog logical size `32 x 32`; anchor `(0.5, 0.82)`; validated at `32/29/22/16/14/10 px`. The exact sword category becomes secondary below `16 px`. Deterministic player fallback remains available if the texture is disabled, missing or not loaded.

### visual.actor.enemy

- **Semantic Asset Key**: `visual.actor.enemy`
- **Repository Path**: `/assets/actors/enemies/sanctuary-guardian-m2.png`
- **Category**: `actors`
- **Source Type**: `generated-raster`
- **Creator or Generator**: OpenAI built-in image generator
- **Model/Tool & Version**: model, version and seed are not exposed by the built-in tool; no identifier is inferred
- **Creation Date**: `2026-07-17`
- **Original Prompt or Prompt-Reference Path**: exact prompt and processing record in `C:\Users\rnaba\.codex\visualizations\2026\07\16\019f6857-f391-7ef1-9b8a-48979bee1290\a3-actor-proofs\ENEMY_PROOF_MANIFEST.md`, section `M2 — Tall triangular sanctuary guardian`
- **Source/Reference Images**: no third-party reference images; original built-in generation identifier `exec-424dadd6-a47c-4fb1-ba45-16f9f177787c`
- **License or Usage Basis**: generated specifically for this private project with the OpenAI built-in image generator; use remains subject to the applicable OpenAI service terms; no third-party asset license is claimed
- **Modifications Performed**: flat chroma background removed with border auto-key, soft matte, thresholds `12/220`, despill and one-pixel edge contraction; normalized with Lanczos to a `256 x 256` RGBA canvas; feet baseline placed at y=`210`; translucent edge RGB neutralized and alpha below `5` cleared. Final alpha bounds are `(73, 10)–(183, 210)` with transparent corners and no visible magenta-like pixels.
- **Integrity**: SHA-256 `207044C9651E3C584979B5FB4504CB492112AC2958C243C786451F5FA7222150`
- **Approval Status**: `Approved` by the user on `2026-07-17` as `M2`
- **Replacement Status**: `Original` runtime integration of the approved A3 enemy candidate
- **Notes**: static image; catalog logical size `32 x 32`; anchor `(0.5, 0.82)`; validated at `32/29/22/16/14/10 px`. The intentionally faceted mineral rendering is harder-edged than the player's softer painterly treatment; at `10 px` only the tall triangular hostile mass remains. M2 is unarmed and does not depict the current `Gladiator Crossbow` equipment label. Deterministic enemy fallback remains available if the texture is disabled, missing or not loaded.

### visual.world.obstacle.wall

- **Semantic Asset Key**: `visual.world.obstacle.wall`
- **Repository Path**: `/assets/world/obstacles/A4-wall-W1R1-master.png`
- **Category**: `world`
- **Source Type**: `generated-raster`
- **Creator or Generator**: Gemini 3.5 Flash via Antigravity `generate_image`
- **Creation Date**: `2026-07-18`
- **Original Prompt or Prompt-Reference Path**: Prompts in `D:\Codex\home\visualizations\2026\07\18\019f729e-cca7-7e03-9d9c-5ad472887e17\A4-P1R2\proofs\A4-P1R2-GENERATION-PROCESSING-MANIFEST.md`
- **Source/Reference Images**: Target edit image is `D:\Codex\home\visualizations\2026\07\18\019f729e-cca7-7e03-9d9c-5ad472887e17\A4-P1\sources\A4-wall-W1-heavy-earth-masonry-source.png` (SHA-256: `A6C36C204397D432742CE2A2E03ACCBC5D541355A4B78903356F3C5905BAF75D`)
- **License or Usage Basis**: Generated specifically for this private project; use remains subject to applicable terms.
- **Modifications Performed**: Chroma key `#08f306` removed. Cropped to subject alpha bbox `[72, 79, 951, 945]`, resized with Lanczos scale `0.27303754` into `256 x 256` transparent canvas centered, bbox `240 x 236`.
- **Integrity**: SHA-256 `D71892CD729B9EEFDB56D4F69651279CACE4E28D6F0551DA7A1815895A191DF7`
- **Approval Status**: `Approved` by the user on `2026-07-18` as `W1R1`
- **Replacement Status**: `Original` runtime integration of the approved A4 wall candidate
- **Notes**: center anchor `(0.5, 0.5)`; catalog logical size `32 x 32`.

### visual.poi.switch

- **Semantic Asset Key**: `visual.poi.switch`
- **Repository Path**: `/assets/world/points-of-interest/A4-switch-S1R1-spritesheet.png`
- **Category**: `world`
- **Source Type**: `generated-raster`
- **Creator or Generator**: Gemini 3.5 Flash via Antigravity `generate_image`
- **Creation Date**: `2026-07-18`
- **Original Prompt or Prompt-Reference Path**: Prompts in `D:\Codex\home\visualizations\2026\07\18\019f729e-cca7-7e03-9d9c-5ad472887e17\A4-P1R2\proofs\A4-P1R2-GENERATION-PROCESSING-MANIFEST.md`
- **Source/Reference Images**: Target edit image is `D:\Codex\home\visualizations\2026\07\18\019f729e-cca7-7e03-9d9c-5ad472887e17\A4-P1\sources\A4-switch-S1-low-lever-off-source.png` (SHA-256: `830C805B17AE06E3E5B854D639881E678C1D72A9033BE785A5C78C02A5B180E9`) for OFF state, and the raw OFF JPEG `a4_switch_s1r1_off_proof_1784373217750.jpg` (SHA-256: `47E07E223B8097B4F4A8E73D9AD84B3D3576377FDC6E631950FBEC5993D042EE`) as edit reference target for ON state.
- **License or Usage Basis**: Generated specifically for this private project; use remains subject to applicable terms.
- **Modifications Performed**: Chroma key `#0ef208` (OFF) and `#11f107` (ON) removed. Cropped to union alpha bbox `[173, 169, 811, 688]`, resized with Lanczos scale `0.20062696` to `128 x 104`, centered at `(8, 20)` in `144 x 144` canvas. Combined side-by-side into a `288 x 144` spritesheet (Frame 0: OFF, Frame 1: ON).
- **Integrity**: SHA-256 `C7E729E9A7DF8118007CBF842718745CAE17C973D18F6F53209DCAB981A6832B`
- **Approval Status**: `Approved` by the user on `2026-07-18` as `S1R1`
- **Replacement Status**: `Original` runtime integration of the approved A4 switch candidate
- **Notes**: center anchor `(0.5, 0.5)`; catalog logical size `18 x 18`; spritesheet frame dimensions `144 x 144`.

### visual.poi.exit

- **Semantic Asset Key**: `visual.poi.exit`
- **Repository Path**: `/assets/world/points-of-interest/A4-exit-X1R1-spritesheet.png`
- **Category**: `world`
- **Source Type**: `generated-raster`
- **Creator or Generator**: Gemini 3.5 Flash via Antigravity `generate_image`
- **Creation Date**: `2026-07-18`
- **Original Prompt or Prompt-Reference Path**: Prompts in `D:\Codex\home\visualizations\2026\07\18\019f729e-cca7-7e03-9d9c-5ad472887e17\A4-P2\proofs\A4-P2-GENERATION-PROCESSING-MANIFEST.md`
- **Source/Reference Images**: Locked base generated from prompt, other frames precisely edited from the locked and available candidates.
- **License or Usage Basis**: Generated specifically for this private project; use remains subject to applicable terms.
- **Modifications Performed**: Chroma key `#09f804` (locked), `#07f404` (available) and `#09f204` (completed) removed. Cropped to union alpha bbox `[132, 38, 896, 984]`, resized with Lanczos scale `0.18604651` to `142 x 176` and placed centered on a `192 x 192` canvas. Combined side-by-side into a `576 x 192` spritesheet.
- **Integrity**: SHA-256 `73E4EAF8B16775D5DD67FD97B6C0EE964C0FC9DBCAA8A438633BE87154194BFC`
- **Approval Status**: `Approved` by the user on `2026-07-18` as `X1R1`
- **Replacement Status**: `Original` runtime integration of the approved A4 exit portal candidates
- **Notes**: center anchor `(0.5, 0.5)`; catalog logical size `24 x 24`; spritesheet frame dimensions `192 x 192`.

### visual.poi.encounter

- **Semantic Asset Key**: `visual.poi.encounter`
- **Repository Path**: `/assets/world/points-of-interest/A4-encounter-E1R2-master.png`
- **Category**: `world`
- **Source Type**: `generated-raster`
- **Creator or Generator**: Gemini 3.5 Flash via Antigravity `generate_image`
- **Creation Date**: `2026-07-18`
- **Original Prompt or Prompt-Reference Path**: Prompts in `D:\Codex\home\visualizations\2026\07\18\019f729e-cca7-7e03-9d9c-5ad472887e17\A4-P2\proofs\A4-P2-GENERATION-PROCESSING-MANIFEST.md`
- **Source/Reference Images**: Generated from scratch via revised E1R2 prompt.
- **License or Usage Basis**: Generated specifically for this private project; use remains subject to applicable terms.
- **Modifications Performed**: Chroma key `#0afa05` removed. Cropped to subject alpha bbox `[147, 163, 878, 847]`, resized with Lanczos scale `0.17510260` to `128 x 120` and placed centered on a `144 x 144` master canvas.
- **Integrity**: SHA-256 `815987F4721DDABA0A07CD699AE51F15A390B7E29E0E7019602EBCE08E862DA7`
- **Approval Status**: `Approved` by the user on `2026-07-18` as `E1R2`
- **Replacement Status**: `Original` runtime integration of the approved A4 encounter trigger candidate
- **Notes**: center anchor `(0.5, 0.5)`; catalog logical size `18 x 18`.

### visual.effect.attack

- **Semantic Asset Key**: `visual.effect.attack`
- **Repository Path**: `/assets/effects/attacks/A5-attack-effect.png`
- **Category**: `effects`
- **Source Type**: `generated-raster`
- **Creator or Generator**: Gemini 3.5 Flash via Antigravity `generate_image`
- **Creation Date**: `2026-07-18`
- **Original Prompt or Prompt-Reference Path**: Prompts in `D:\Codex\home\visualizations\2026\07\18\019f729e-cca7-7e03-9d9c-5ad472887e17\A5-P1R4\proofs\A5-P1R4-GENERATION-PROCESSING-MANIFEST.md`
- **Source/Reference Images**: Copied byte-for-byte from `A5-P1/processed/A5-attack-effect-master.png`
- **License or Usage Basis**: Generated specifically for this private project; use remains subject to applicable terms.
- **Modifications Performed**: Copied canonical master.
- **Integrity**: SHA-256 `0588AFB2E03D9ABDA7A7A1AB1DB6FFCA7EE1E818232F4EE972FE3BEA33108BD8`
- **Approval Status**: `Approved` by the user on `2026-07-19` as `A5-ATTACK`
- **Replacement Status**: `Original` runtime integration of the approved A5 attack effect
- **Notes**: center anchor `(0.5, 0.5)`; catalog logical size `42 x 42`.

### visual.effect.damage

- **Semantic Asset Key**: `visual.effect.damage`
- **Repository Path**: `/assets/effects/impacts/A5-damage-effect.png`
- **Category**: `effects`
- **Source Type**: `generated-raster`
- **Creator or Generator**: Gemini 3.5 Flash via Antigravity `generate_image`
- **Creation Date**: `2026-07-19`
- **Original Prompt or Prompt-Reference Path**: Prompts in `D:\Codex\home\visualizations\2026\07\18\019f729e-cca7-7e03-9d9c-5ad472887e17\A5-P1R4\proofs\A5-P1R4-GENERATION-PROCESSING-MANIFEST.md`
- **Source/Reference Images**: Reprocessed from `DAMAGE-R3` raw generator output.
- **License or Usage Basis**: Generated specifically for this private project; use remains subject to applicable terms.
- **Modifications Performed**: Chroma key `#09f006` removed. Cropped to subject alpha bbox, resized with Lanczos scale, HSL/HSV color remapped to shift yellow/olive `(45°-75°)` to warm orange/rust `(15°-35°)`, and green capped at `G <= 0.72 * R` to eliminate olive tints. Center aligned in a `256 x 256` transparent canvas.
- **Integrity**: SHA-256 `3863A8CCC4150009FC0A97FFDE34299BB313C26F19AF3999AA8944B46D636890`
- **Approval Status**: `Approved` by the user on `2026-07-19` as `A5-DAMAGE-R4`
- **Replacement Status**: `Original` runtime integration of the approved A5 damage effect
- **Notes**: center anchor `(0.5, 0.5)`; catalog logical size `42 x 42`.

### visual.effect.defeat

- **Semantic Asset Key**: `visual.effect.defeat`
- **Repository Path**: `/assets/effects/defeat/A5-defeat-effect.png`
- **Category**: `effects`
- **Source Type**: `generated-raster`
- **Creator or Generator**: Gemini 3.5 Flash via Antigravity `generate_image`
- **Creation Date**: `2026-07-18`
- **Original Prompt or Prompt-Reference Path**: Prompts in `D:\Codex\home\visualizations\2026\07\18\019f729e-cca7-7e03-9d9c-5ad472887e17\A5-P1R4\proofs\A5-P1R4-GENERATION-PROCESSING-MANIFEST.md`
- **Source/Reference Images**: Copied byte-for-byte from `A5-P1R1/processed/A5-defeat-effect-master.png`
- **License or Usage Basis**: Generated specifically for this private project; use remains subject to applicable terms.
- **Modifications Performed**: Copied canonical master.
- **Integrity**: SHA-256 `10C1DFC33B9F18C2876B873ED2E018482231FAA5B8A45EFA55D1A0BA14887ADE`
- **Approval Status**: `Approved` by the user on `2026-07-19` as `A5-DEFEAT-R1`
- **Replacement Status**: `Original` runtime integration of the approved A5 defeat effect
- **Notes**: center anchor `(0.5, 0.5)`; catalog logical size `42 x 42`.

### visual.ui.icon.attack

- **Semantic Asset Key**: `visual.ui.icon.attack`
- **Repository Path**: `/assets/ui/icons/icon-attack.png`
- **Category**: `ui`
- **Source Type**: `generated-raster`
- **Creator or Generator**: Gemini 3.5 Flash via Antigravity `generate_image`
- **Creation Date**: `2026-07-19`
- **Original Prompt or Prompt-Reference Path**: "A clean, flat, minimalist icon of crossed steel swords or a d20 die with a sword slash. Color: warm orange #f28f3b. Background is solid bright neon green chroma key color #00FF00..."
- **License or Usage Basis**: Generated specifically for this private project; use remains subject to applicable terms.
- **Modifications Performed**: Chroma key `#00FF00` removed, despilled, auto-cropped and centered, resized with Lanczos scale to 32x32.
- **Integrity**: SHA-256 `9BAB4D7AF86C5DB642080CF6AD0B58055F77EADCA08021084EC354749921013B`
- **Approval Status**: `Rejected` for runtime integration by the user on `2026-07-21`; the fallback-only A6 UI gate was approved.
- **Replacement Status**: `Rejected candidate retained for provenance only; catalog loading remains disabled`
- **Notes**: center anchor `(0.5, 0.5)`; catalog logical size `16 x 16`. The available file is a 32 x 32 runtime derivative, not the recommended 128 x 128 proof master. Alpha touches the source bounds and requires margin/crop review in the A6 proof package.

### visual.ui.icon.move

- **Semantic Asset Key**: `visual.ui.icon.move`
- **Repository Path**: `/assets/ui/icons/icon-move.png`
- **Category**: `ui`
- **Source Type**: `generated-raster`
- **Creator or Generator**: Gemini 3.5 Flash via Antigravity `generate_image`
- **Creation Date**: `2026-07-19`
- **Original Prompt or Prompt-Reference Path**: "A clean, flat, minimalist icon of a medieval boots footprint or walking paths. Color: silver-white #c8d3df. Background is solid bright neon green chroma key color #00FF00..."
- **License or Usage Basis**: Generated specifically for this private project; use remains subject to applicable terms.
- **Modifications Performed**: Chroma key `#00FF00` removed, despilled, auto-cropped and centered, resized with Lanczos scale to 32x32.
- **Integrity**: SHA-256 `BCFD0991F3963DD0B4F94D00C3AA9ED69089ABD786190716D3048A4BD7228D90`
- **Approval Status**: `Rejected` for runtime integration by the user on `2026-07-21`; the fallback-only A6 UI gate was approved.
- **Replacement Status**: `Rejected candidate retained for provenance only; catalog loading remains disabled`
- **Notes**: center anchor `(0.5, 0.5)`; catalog logical size `16 x 16`. The available file is a 32 x 32 runtime derivative, not the recommended 128 x 128 proof master. Alpha touches the source bounds and requires margin/crop review in the A6 proof package.

### visual.ui.icon.inspect

- **Semantic Asset Key**: `visual.ui.icon.inspect`
- **Repository Path**: `/assets/ui/icons/icon-inspect.png`
- **Category**: `ui`
- **Source Type**: `generated-raster`
- **Creator or Generator**: Gemini 3.5 Flash via Antigravity `generate_image`
- **Creation Date**: `2026-07-19`
- **Original Prompt or Prompt-Reference Path**: "A clean, flat, minimalist icon of an open eye or magnifying glass. Color: silver-white #c8d3df. Background is solid bright neon green chroma key color #00FF00..."
- **License or Usage Basis**: Generated specifically for this private project; use remains subject to applicable terms.
- **Modifications Performed**: Chroma key `#00FF00` removed, despilled, auto-cropped and centered, resized with Lanczos scale to 32x32.
- **Integrity**: SHA-256 `85FED7EFCA83CAFA9DBC1B250166C8BE2525CA2251AE441C44B832555B28A58F`
- **Approval Status**: `Rejected` for runtime integration by the user on `2026-07-21`; the fallback-only A6 UI gate was approved.
- **Replacement Status**: `Rejected candidate retained for provenance only; catalog loading remains disabled`
- **Notes**: center anchor `(0.5, 0.5)`; catalog logical size `16 x 16`. This inspect/search candidate must not represent Abilities or Focused Drive; those prompts use text-only code-native fallback until a semantically correct ability icon is approved.

### visual.ui.icon.end_turn

- **Semantic Asset Key**: `visual.ui.icon.end_turn`
- **Repository Path**: `/assets/ui/icons/icon-end-turn.png`
- **Category**: `ui`
- **Source Type**: `generated-raster`
- **Creator or Generator**: Gemini 3.5 Flash via Antigravity `generate_image`
- **Creation Date**: `2026-07-19`
- **Original Prompt or Prompt-Reference Path**: "A clean, flat, minimalist icon of a clockwise circular arrow or an hourglass. Color: silver-white #c8d3df. Background is solid bright neon green chroma key color #00FF00..."
- **License or Usage Basis**: Generated specifically for this private project; use remains subject to applicable terms.
- **Modifications Performed**: Chroma key `#00FF00` removed, despilled, auto-cropped and centered, resized with Lanczos scale to 32x32.
- **Integrity**: SHA-256 `A1BB1D31FF4246BEDD0DA20BD3106DCC35F16324DCB6F03CFF2AA5059432A1D3`
- **Approval Status**: `Rejected` for runtime integration by the user on `2026-07-21`; the fallback-only A6 UI gate was approved.
- **Replacement Status**: `Rejected candidate retained for provenance only; catalog loading remains disabled`
- **Notes**: center anchor `(0.5, 0.5)`; catalog logical size `16 x 16`. The available file is a 32 x 32 runtime derivative, not the recommended 128 x 128 proof master.

### visual.ui.icon.turn_marker

- **Semantic Asset Key**: `visual.ui.icon.turn_marker`
- **Repository Path**: `/assets/ui/icons/icon-turn-marker.png`
- **Category**: `ui`
- **Source Type**: `generated-raster`
- **Creator or Generator**: Gemini 3.5 Flash via Antigravity `generate_image`
- **Creation Date**: `2026-07-19`
- **Original Prompt or Prompt-Reference Path**: "A clean, flat, minimalist circular turn marker pip icon. A glowing runic gem or smooth circular orb, with thick dark border. Color: white-gray #ffffff. Background is solid bright neon green chroma key color #00FF00..."
- **License or Usage Basis**: Generated specifically for this private project; use remains subject to applicable terms.
- **Modifications Performed**: Chroma key `#00FF00` removed, despilled, auto-cropped and centered, resized with Lanczos scale to 32x32.
- **Integrity**: SHA-256 `2B878DFD98ABFA6BB235A9F1E8E19FD0FB8CBBED5CC2EFC7252F199B722ECC9B`
- **Approval Status**: `Rejected` for runtime integration by the user on `2026-07-21`; the fallback-only A6 UI gate was approved.
- **Replacement Status**: `Rejected candidate retained for provenance only; catalog loading remains disabled`
- **Notes**: center anchor `(0.5, 0.5)`; catalog logical size `16 x 16`. The available file is a 32 x 32 runtime derivative, not the recommended 128 x 128 proof master. Alpha reaches the source bounds and requires crop review.

### visual.ui.panel.standard

- **Semantic Asset Key**: `visual.ui.panel.standard`
- **Repository Path**: `/assets/ui/panels/panel-standard.png`
- **Category**: `ui`
- **Source Type**: `generated-raster`
- **Creator or Generator**: Gemini 3.5 Flash via Antigravity `generate_image`
- **Creation Date**: `2026-07-19`
- **Original Prompt or Prompt-Reference Path**: "A seamless, tileable texture of dark slate stone slate block, flat design, very dark charcoal color #10141b..."
- **License or Usage Basis**: Generated specifically for this private project; use remains subject to applicable terms.
- **Modifications Performed**: Resized with Lanczos scale to 64x64.
- **Integrity**: SHA-256 `3C32B8A9DFD0C73BEE9859B6C18A68821395E4A8CFF3CD288FCEAA8BF6DE576C`
- **Approval Status**: `Rejected` for runtime integration by the user on `2026-07-21`; the fallback-only A6 UI gate was approved.
- **Replacement Status**: `Rejected candidate retained for provenance only; catalog loading remains disabled`
- **Notes**: center anchor `(0.5, 0.5)`; catalog logical size `32 x 32`. Nine-slice appearance still requires review at actual 800 x 450 and 640 x 360 runtime panels.

### visual.ui.border.standard

- **Semantic Asset Key**: `visual.ui.border.standard`
- **Repository Path**: `/assets/ui/panels/border-standard.png`
- **Category**: `ui`
- **Source Type**: `generated-raster`
- **Creator or Generator**: Gemini 3.5 Flash via Antigravity `generate_image`
- **Creation Date**: `2026-07-19`
- **Original Prompt or Prompt-Reference Path**: "A thin, minimalist square frame border for a game UI panel. Clean, straight lines of 1-2 pixels thickness. Color: slate blue-gray #3c4c63. Background inside and outside the square frame is solid bright neon green chroma key color #00FF00..."
- **License or Usage Basis**: Generated specifically for this private project; use remains subject to applicable terms.
- **Modifications Performed**: Chroma key `#00FF00` removed, despilled, auto-cropped and centered, resized with Lanczos scale to 64x64.
- **Integrity**: SHA-256 `84D2AAEF0FEC62507A5A933BED9F33A97BA83B01B21573D579D5D1AFE551121E`
- **Approval Status**: `Rejected` for runtime integration by the user on `2026-07-21`; the fallback-only A6 UI gate was approved.
- **Replacement Status**: `Rejected candidate retained for provenance only; catalog loading remains disabled`
- **Notes**: center anchor `(0.5, 0.5)`; catalog logical size `32 x 32`. Nine-slice border thickness and corner behavior still require review at actual 800 x 450 and 640 x 360 runtime panels.

---

## 3. A7 approved actor spritesheets

The following nine state sheets were approved by the user for experimental runtime integration on `2026-07-21`. They were copied byte-for-byte from `artifacts/A7-actor-spritesheet-proof-2026-07-21`. The enemy movement candidate was rejected/not applicable and is intentionally absent from both `public/assets` and the runtime catalog.

- **Category**: `actors`
- **Source Type**: `generated-raster`
- **Creator or Generator**: OpenAI built-in image generator
- **Model/Tool & Version**: model, version, and seed were not exposed by the built-in tool and are not inferred
- **Creation Date**: `2026-07-21`
- **Original Prompt or Prompt-Reference Path**: `artifacts/A7-actor-spritesheet-proof-2026-07-21/sources/PROMPTS.md`
- **Source/Reference Images**: approved P2R1 and M2 masters copied into `artifacts/A7-actor-spritesheet-proof-2026-07-21/sources/`
- **License or Usage Basis**: generated specifically for this private project with the OpenAI built-in image generator; use remains subject to the applicable OpenAI service terms; no third-party asset license is claimed
- **Modifications Performed**: chroma removal with soft matte and despill; three source panels split per state; conservative per-actor normalization to uniform `256 x 256` RGBA frames; horizontal centering and common feet baseline at master `y=210`; three frames combined side-by-side into each `768 x 256` sheet
- **Approval Status**: `Approved` by the user on `2026-07-21` for experimental runtime integration
- **Replacement Status**: player/enemy idle sheets replace the prior static runtime textures under their existing semantic keys; action-state sheets are original additions
- **Notes**: each frame is `256 x 256`; catalog logical size `32 x 32`; anchor `(0.5, 0.82)`; deterministic graphics fallbacks remain available when textures are unavailable. Attack, hit, and defeat are one-shot states; idle loops; player movement loops only while the player moves.

| Semantic Asset Key | Repository Path | SHA-256 |
| --- | --- | --- |
| `visual.actor.player` | `/assets/actors/player/A7-player-idle-3f-256.png` | `4E4C29CCE66B720F42FC0CCFFE2A63F2DAE51A12C77B78192C3E8E9FFC28D7EB` |
| `visual.actor.player.movement` | `/assets/actors/player/A7-player-movement-3f-256.png` | `D16F75748D32BE5CB3625F20690384EC42F82AFAB293431E39295113CD86184A` |
| `visual.actor.player.attack` | `/assets/actors/player/A7-player-attack-3f-256.png` | `73E658F2567F0E2C05AA2353824789C1A9AC441DF8C297B156FF9C775085FB3A` |
| `visual.actor.player.hit` | `/assets/actors/player/A7-player-hit-3f-256.png` | `E04E50EA72940D4F6894A46B7F59A681A88BB828D622903F58820D8236C35774` |
| `visual.actor.player.defeat` | `/assets/actors/player/A7-player-defeat-3f-256.png` | `D36FDA0382DEEE267DE47F62AB0D015860A31437CF570AF82FCDDAAF32F44A97` |
| `visual.actor.enemy` | `/assets/actors/enemies/A7-enemy-idle-3f-256.png` | `3F39ABA91727F1DF642EE665DC9088469B24C9F3F0262DA66D8ABC311A70314B` |
| `visual.actor.enemy.attack` | `/assets/actors/enemies/A7-enemy-attack-3f-256.png` | `880CECC6CD57D9F53CE8CC74683D94592EEA8210D8D85770BCC3AF7DFB9439ED` |
| `visual.actor.enemy.hit` | `/assets/actors/enemies/A7-enemy-hit-3f-256.png` | `EFB1C23BED20145905E79B25624015D23234EA1EF3971B8AD2357315A16F9716` |
| `visual.actor.enemy.defeat` | `/assets/actors/enemies/A7-enemy-defeat-3f-256.png` | `91393B0EA194B212F759E287A4468929EB5DA332AD184BEAA3A0A1D9AC38E5F9` |
