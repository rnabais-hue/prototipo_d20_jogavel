# Combat Visual Direction Vertical Slice Closeout V1

## Status

Implementation complete on `agent/combat-visual-vertical-slice`. Automated verification and
runtime capture review are complete. Merge remains blocked until a human reviewer approves the
two full-scene reference captures.

## Delivered

- Changed the logical game canvas from `800 x 450` to `640 x 360` and enabled Phaser pixel-art
  rendering with antialiasing disabled, rounded pixels, integer maximum zoom, and pixelated CSS
  image rendering.
- Replaced the combat painting with a repository-authored `12 x 10` Tiled JSON map using native
  `16 x 16` CC0 floor, boundary, and decoration tiles. The inner `10 x 8` cells remain the
  authoritative combat grid.
- Added generic appearance profiles with `body`, `outfit`, `mainHand`, `offHand`, `accessory`,
  and `effectSet` slots. The delivered player and enemy use a body/outfit base plus an independent
  main-hand layer.
- Added sword and spear player profiles and an axe enemy profile. Selecting
  `?visual.player=combat.player.spear` changes only profile data; production logic has no
  class-, archetype-, armor-, or weapon-id branch.
- Normalized every visible combat layer to twenty `32 x 32` frames with one shared
  ground-contact anchor, frame clock, state timeline, integer scale, and integer position.
- Added distinct idle, movement, attack, hit, and defeat state ranges. Movement duration is
  Manhattan distance times `120 ms` per cell. Attack presentation now processes anticipation,
  contact/target reaction, recovery, and defeat in order.
- Replaced painterly combat effect textures with small code-native pixel impacts and smoke.
- Moved combat status into a side panel and kept the Tiled arena free of title, HP-bar, and
  command-text overlap. Exploration rendering and controls remain mechanically unchanged.

## Asset and IP record

The only new art source is `16x16 DungeonTileset II` v1.7 by 0x72 (Robert), declared CC0-1.0.
The source page states that no generative AI was used. The archive hash, exact selected files,
all derivative operations, runtime hashes, anchors, frame order, and approval state are recorded
in `public/assets/PROVENANCE.md`. No protected setting expression, official name, logo, or
trademark was added.

## Verification

- `npm run test`: 58 files, 457 tests passed.
- The original baseline remains intact: all 57 existing files and all 452 existing tests pass.
  One focused pure test file adds five profile-resolution and layer-synchronization tests.
- `npm run typecheck`: passed.
- `npm run build`: passed. Vite reports only the pre-existing large-chunk advisory.
- Browser console at both reference sizes: no errors or warnings.
- `1280 x 720`: the `640 x 360` canvas measured exactly `1280 x 720` (2x).
- `1920 x 1080`: the same canvas measured exactly `1920 x 1080` (3x).
- Runtime observations covered idle, a two-cell movement, attack menu, anticipation/contact,
  target damage, defeat/victory, the spear profile swap, and return to exploration.

Reference capture filenames:

- `combat-idle-1280x720.png`
- `combat-spear-1920x1080.png`

Additional review captures:

- `combat-movement-1280x720.png`
- `combat-attack-menu-1280x720.png`
- `combat-attack-anticipation-1280x720.png`
- `combat-attack-contact-1280x720.png`
- `combat-defeat-1280x720.png`
- `exploration-return-1280x720.png`

## Deliberate limits

- This is not inventory, gameplay equipment, character creation, or a paper-doll editor.
- The profile query is a visual proof only and does not alter combat actions or statistics.
- Only south-facing top-down three-quarter frames are demonstrated.
- The exploration art was not migrated; only compatibility with the new logical canvas was
  verified.
- The external pack does not supply complete attack, hit, and defeat sheets for every selected
  actor. The slice therefore declares ordered source-frame reuse and combines it with explicit
  anticipation, recoil, impact, recovery, fade, and smoke choreography.

## Merge gate

Human approval of `combat-idle-1280x720.png` and `combat-spear-1920x1080.png` is required before
this branch may be merged.
