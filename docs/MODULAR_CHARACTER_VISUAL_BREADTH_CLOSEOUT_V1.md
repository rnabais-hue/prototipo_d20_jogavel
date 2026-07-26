# Modular Character Visual Breadth Closeout V1

## Status

Implementation and human review complete on `agent/modular-character-visual-breadth`. The
project owner approved the corrected identity, loadout, facing, action, and supplementary
CC BY 4.0 source evidence on `2026-07-26`.

Task 08 starts from the reviewed specification merge
`123cadf050414719ba497abfe687163297b14910` and preserves the Task 07 implementation baseline
at `3cd5d7b`.

## Delivered

The combat presentation now exposes three primary visual identities through the same generic
profile resolver and renderer:

| Profile | Ordered visible slots |
| --- | --- |
| `combat.player.combatant` | body, outfit, main hand (sword) |
| `combat.player.caster` | body, outfit, main hand (staff), accessory |
| `combat.player.specialist` | body, outfit, off hand (bow), accessory |

`combat.player.combatant-spear` copies the combatant profile and changes only `mainHand`.
The Task 07 `combat.player.sword`, `combat.player.spear`, and `combat.enemy.axe` profiles remain
available as compatibility data.

No participant id, sheet, attribute, defense, life, action, ability, weapon range, resource,
encounter, position, movement allowance, turn, damage, outcome, control, or enemy decision was
changed. The review query selects presentation data only.

## Generic visual contract

`CombatAppearanceProfile` keeps the generic `body`, `outfit`, `mainHand`, `offHand`,
`accessory`, and `effectSet` fields. Layer order is resolved by iterating slot data. Production
rendering, loading, animation registration, and facing resolution do not branch on a profile,
identity, class, archetype, weapon, armor, equipment, provider, product, or license id.

The profile schema now declares cardinal presentation data. Eight-frame sheets map:

- north: frames `6-7`;
- east: frames `2-3`;
- south: frames `0-1`;
- west: frames `4-5`.

Each pair is repeated on the existing four-frame clocks for `idle`, `movement`, `attack`,
`hit`, and `defeat`. All visible layers receive the same facing, frame list, duration, repeat
policy, flip policy, integer position, display scale, anchor, depth sequence, and motion
timeline.

`resolveFacingFromGridDelta` is a pure presentation helper: negative y resolves north,
positive x east, positive y south, and negative x west. Zero-length input retains the previous
facing; diagonal input throws. `debugCombatGridView` passes each authoritative orthogonal
movement segment to the presentation handle before movement. Facing never enters rules,
combat, movement, exploration, or content data.

The generic runtime override remains `visual.player=<profile-id>`. Runtime asset loading
derives the selected profile's declared layer keys and loads only those non-default Task 08
files. Task 07 default-load behavior and eager animation registration remain unchanged; Task
08 directional animations are registered lazily when a selected profile needs them.

## Extensibility proof

The new pure test file constructs `test.player.fourth-identity`, an id absent from production
data, and passes it through the injected generic profile resolver. Ordered layers and west
facing idle frames resolve without modifying production resolver or renderer code.

After this generic model, another production identity requires only profile data, stable asset
keys/catalog records, runtime files, and provenance. A future commercial replacement uses the
same path. License provider and purchase details remain provenance-only metadata.

## Visual and asset result

Ten `256 x 32` runtime spritesheets were added under
`public/assets/actors/combat/breadth/`: one body, three outfits, two accessories, sword, spear,
staff, and bow. Each contains eight `32 x 32` cardinal frames and retains the Task 07 native
unit, integer scale, anchor, hard-edge sampling, and combat arena integration.

Character layers derive from chrisf's
`16x16 character sheet with separate clothing layers`, declared CC BY 4.0. Equipment derives
from the already approved 0x72 DungeonTileset II v1.7 source, declared CC0-1.0. No AI-generated
runtime art, proprietary asset, unused archive, demo, editable master, or original source sheet
was added to the repository. Exact source/runtime hashes, frame mappings, palette operations,
rotations, placements, attribution, license basis, and approval status are recorded in
`public/assets/PROVENANCE.md`.

No CraftPix file is used. The architecture is ready for a future paid replacement, but private
repository visibility is not treated as license permission. Any commercial intake must confirm
repository access, collaborators and automation, redistribution, sublicensing, editable/source
file handling, post-subscription use, and AI-use restrictions before copying a file.

## Runtime review evidence

The implementation was exercised through the existing exploration trigger and combat scene;
no review-only combat shortcut or new control flow was added.

Comparable `1280 x 720` full-scene captures were recorded for combatant, caster, specialist,
and the combatant spear alternate. A `1920 x 1080` full-scene capture confirms integer pixel
edges and responsive layout. A four-step sequence moves north, east, south, and west and shows
the body, outfit, and spear layers changing facing together while authoritative movement
allowance decreases from four to zero. An attack capture records anticipation/contact,
synchronized layers, target reaction, a hit, four damage, and the unchanged HUD values. A
separate full encounter run reaches zero player life and the existing defeat outcome without
changing the visual-profile selection path.

The generic comparison sheet places combatant, caster, and specialist under identical scale
and facing conditions. The project owner approved these corrected captures and the
supplementary source on `2026-07-26`. Reduced-motion completion remains covered by the
unchanged Task 07 baseline tests; its production event ordering and duration code were not
modified.

## Mechanical preservation

The implementation changed no file under:

- `src/rules/`;
- `src/content/`;
- `src/combat/`;
- `src/movement/`;
- `src/exploration/`;
- `src/cli/`;
- `src/ui/`;
- `src/narrative/`.

All 58 baseline test files and 457 baseline tests remain present, enabled, byte-for-byte
unchanged, and passing. Exactly one pure test file was added:
`src/game/visual/modularCharacterVisualBreadth.test.ts`, with exactly eight tests for cardinal
mapping, zero retention, diagonal rejection, profile validity, four-facing animation
resolution, synchronized layers, the one-slot loadout, and the test-only fourth profile.

Final suite: **59 files, 465 tests**.

No dependency, `package.json`, `pnpm-lock.yaml`, other lockfile, or installed dependency version
was changed. The existing local binaries were used directly because no dependency operation
was permitted:

```text
.\node_modules\.bin\vitest.CMD run
.\node_modules\.bin\tsc.CMD
.\node_modules\.bin\vite.CMD build
```

Results:

- tests: 59 files passed, 465 tests passed;
- typecheck: passed;
- production build: passed;
- Vite emitted only the already-known chunk-size warning.

The local GitHub CLI is not required by repository protocol. Publishing and pull-request
operations may use the connected GitHub App; a missing `gh` executable is not a blocker.

## Approval record

On `2026-07-26`, the project owner approved:

1. the supplementary chrisf CC BY 4.0 source and attribution record;
2. the corrected combatant, caster, and specialist same-condition captures;
3. the corrected combatant sword/spear one-slot comparison;
4. the corrected north/east/south/west synchronized movement sequence;
5. the corrected synchronized attack/hit capture;
6. the three-profile comparison and full-scene evidence.

The Task 08 provenance entries are recorded as `Approved`. The implementation is eligible for
its dedicated pull request; repository policy still requires review and prohibits direct
commits to `master`.
