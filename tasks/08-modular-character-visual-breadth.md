# Task 08: Modular Character Visual Breadth

## Status

Specification only. Do not execute until this file has been reviewed and merged to `master`.

Task 07 was approved and merged by PR #2 at commit `3cd5d7b`. This task extends that approved
combat-only visual model. It does not reopen the direction chosen in decision 0057.

## Objective

Prove that the modular combat appearance model supports materially different character
identities and future visual equipment changes without coupling presentation content to
production logic.

The slice must present three coherent primary identities:

1. a combatant;
2. a caster;
3. a specialist or rogue-like figure.

Those names describe generic visual functions, not classes, rules, statistics, actions, or
protected setting content. The three identities must use the same generic rendering,
orientation, animation, and profile-resolution path.

The slice must also retain one alternate loadout profile that changes a declared visual
equipment slot through data only. It is not an inventory, character-creation, gameplay
equipment, progression, or paper-doll system.

The architecture and provenance format must remain provider-neutral so the approved CC0 proof
assets can later be replaced by purchased commercial assets, including a possible CraftPix
source, without changing profile resolution, animation, orientation, rendering, or mechanics.

## Required reading

Read in this order before making any implementation change:

1. `AGENTS.md`
2. `docs/ARCHITECTURE.md`
3. `tasks/README.md`
4. the last 12 entries of `docs/DECISIONS.md`, including decision 0057
5. `README.md`
6. `docs/COMBAT_VISUAL_DIRECTION_VERTICAL_SLICE_CLOSEOUT_V1.md`
7. `src/content/CONTEXT.md`
8. this file
9. `public/assets/README.md`
10. `public/assets/PROVENANCE.md`

Do not read other archive documents unless this task names them.

## Baseline and dependency

The implementation starts from the Task 07 result:

- `master` contains commit `3cd5d7b`;
- the combat renderer uses a `640 x 360` logical canvas at integer display scale;
- combat actors use normalized modular pixel-art layers;
- the existing profile schema exposes `body`, `outfit`, `mainHand`, `offHand`, `accessory`,
  and `effectSet`;
- the existing slice is south-facing only;
- the suite contains exactly **58 test files and 457 tests**.

Before implementation, verify that the current `master` contains the Task 07 merge, is aligned
with its tracked remote, and passes the baseline suite. If the implementation base differs,
record the exact commit and reconcile this specification before changing production files.

## Visual identity contract

Deliver at least three primary identity profiles and at least one alternate loadout profile.
The existing Task 07 profiles may remain as compatibility profiles so their tests and review
route stay unchanged. If an existing profile is promoted into the expanded primary set, it must
satisfy every requirement below without changing an existing test.

Every primary profile must:

- declare a stable generic string id used only as presentation data;
- use a separately addressable `body` layer;
- use a separately addressable `outfit` layer;
- declare a weapon-bearing `mainHand` or `offHand` layer when that identity visibly carries a
  weapon, implement, or tool;
- declare `accessory` when a coherent matching source asset is available;
- explicitly omit an unavailable optional slot rather than substituting an unrelated asset;
- use the Task 07 native unit, frame dimensions, display scale, anchor, depth policy, and
  animation timing contract;
- remain readable at full-scene scale through silhouette, outfit, equipment, and pose, not
  through hue alone and not through labels, HP bars, rings, or reticles.

Across the three primary profiles, `body`, `outfit`, `mainHand`, `offHand`, and `accessory`
must all remain supported generic slots, and at least one approved profile must visibly use an
accessory. `effectSet` remains presentation data and must not encode a combat action or rule.

The alternate loadout profile must share its primary identity's body and all unrelated slots
and change only one of `outfit`, `mainHand`, `offHand`, or `accessory`. Selecting it must not
change any participant id, sheet, statistic, action, range, resource, turn, or outcome.

## Orientation contract

The combat appearance model must support the four cardinal board facings:

- north;
- east;
- south;
- west.

Facing is presentation state derived generically from an orthogonal movement segment:

- decreasing grid `y` means north;
- increasing grid `x` means east;
- increasing grid `y` means south;
- decreasing grid `x` means west.

A zero-length segment retains the previous facing. A diagonal segment is invalid input for the
orientation resolver because the current board path is orthogonal. Facing does not enter
`src/movement/`, `src/combat/`, or any rules calculation.

All visible layers of one actor must resolve the same facing, frame index, ground-contact
anchor, integer position, scale, and motion timeline. East/west frame mirroring is allowed only
as a generic, data-declared visual policy applied consistently to every layer; no profile id,
identity name, weapon id, or equipment id may select a mirroring branch.

Each primary profile must provide coherent facing presentation for `idle`, `movement`,
`attack`, `hit`, and `defeat`. A source frame may be deliberately reused where the approved
source lacks a dedicated frame, as in Task 07, but reuse must be declared in profile or frame
data and completed by generic choreography. It must not be hidden in identity-specific logic.

## Data and production-logic boundary

Appearance profiles, facing/frame declarations, layer assignments, and optional mirroring are
data. Production code consumes their shape.

All of the following must hold:

- the renderer iterates declared slots and facing/frame data generically;
- production logic contains no `if`, `switch`, ternary, or identity-keyed lookup whose behavior
  depends on a literal profile, combatant, caster, specialist, archetype, class, weapon, armor,
  or equipment id;
- the existing generic presentation override may select any compatible profile without a new
  query parameter or code path;
- adding a test-only fourth identity profile requires constructing data and passing it through
  the existing pure resolver; no production resolver or renderer edit is permitted for that
  proof;
- adding a real profile may add asset keys, catalog records, profile records, and provenance,
  but must not modify the generic resolver, animation builder, layer renderer, orientation
  resolver, or scene control flow after those generic shapes exist;
- visual profile ids are not inferred from, equated with, or branched against ids from
  `src/content/`;
- provider names, product names, license types, purchase models, and source-pack ids exist only
  in provenance or asset-intake records and never select production behavior.

Presentation data may remain under `src/game/visual/`. Do not move visual paths, texture keys,
frame metadata, or Phaser-facing presentation data into `src/content/`; that compartment is
the ruleset content pack and must not import the presentation layer.

## Asset and provenance gate

The Task 07 source pack is the preferred source for this implementation where it provides
compatible additions because it already meets the approved style and license direction. A
supplementary free or paid source is allowed only when it fills a documented gap, conforms to
the same visual contract, and passes the applicable license gate below.

The runtime model must not assume that an asset is CC0. Each provenance entry records the
asset's actual license basis. A future purchased pack is a replaceable input to the same
catalog/profile pipeline, not an architectural dependency.

Before copying any new runtime file:

1. obtain the original source or archive from the creator's authoritative page;
2. verify that the license permits use, modification, and redistribution in a game;
3. reject official art, trademarks, logos, protected setting expression, and art derived from
   them;
4. reject licenses with non-commercial, no-derivatives, share-alike, attribution ambiguity, or
   conflicting page restrictions unless the project owner approves a task amendment;
5. record source filename, version, download date, authoritative URL, creator, declared
   license, source archive SHA-256, exact selected files, and any AI-use declaration published
   by the source;
6. copy only the exact files used by the slice;
7. record every crop, repack, palette operation, mirror, rotation, anchor adjustment, filename
   change, frame reuse, and other derivative operation;
8. record each runtime file's semantic key, repository path, SHA-256, frame layout, facing
   coverage, source mapping, approval status, and replacement status in
   `public/assets/PROVENANCE.md`.

Do not download an entire demo or commit an unused source archive. Do not use AI-generated
runtime art for this slice. Provenance must describe real files and real transformations; do
not create placeholder entries for assets that were not selected.

### Paid and proprietary license readiness

For a commercial asset license, `public/assets/PROVENANCE.md` must record:

- the exact license name or provider-defined license tier, not `CC0` or a guessed SPDX id;
- the authoritative product URL and license URL;
- the license text revision or retrieval date reviewed for that purchase;
- whether entitlement came from an individual purchase, subscription, free product, or another
  named basis;
- the entitlement holder in a privacy-safe form and a non-secret receipt/evidence reference;
- whether modification, use in games, commercial distribution, source-file redistribution,
  sublicensing, transfer, team access, and post-subscription use are permitted or restricted;
- whether storing the selected runtime files in this private version-controlled repository is
  expressly permitted, prohibited, or still awaiting written clarification;
- which files are original source files and which are runtime derivatives.

Receipts, account credentials, personal billing data, access tokens, and full purchase archives
must not be committed. Keep purchase evidence outside the repository and record only a
non-sensitive reference sufficient for the owner to locate it.

For CraftPix specifically, review the current authoritative `File Licenses` page
(`https://craftpix.net/file-licenses/`) and the individual product page at the time of
purchase. The license published on `2026-07-26` says that paid resources are licensed on a
limited, non-exclusive, non-transferable basis without a right to sublicense; it permits
copying, adaptation, derivative works, repeated project use, and distribution of games, while
prohibiting distribution of source files or modified art in a form usable by another end user.
It also prohibits using licensed assets or derivatives to train, fine-tune, develop, test,
validate, or improve AI/ML systems.

Private repository visibility is not by itself proof that committing purchased source or
runtime files is allowed. Before committing any CraftPix file:

1. confirm from the then-current license or written provider support that the repository's
   actual access model is permitted, including every collaborator, automation service, and
   external agent that can retrieve the file;
2. confirm that committing the runtime derivative does not amount to prohibited source-file
   distribution, sublicensing, transfer, or making the art reusable by another end user;
3. keep purchase archives and editable masters outside the repository;
4. commit only the minimum runtime derivatives actually used by the game, and only after the
   preceding confirmations are recorded;
5. do not upload the purchased asset or a derivative to an image-generation, model-training,
   model-evaluation, or other AI system; use deterministic local processing and human visual
   review unless the provider gives written permission.

If the license text does not answer repository access unambiguously, stop asset intake and
obtain written clarification from the provider. Do not infer permission merely because the
repository is private. A future public repository or public distribution requires a new
license and packaging review before any proprietary asset remains in the tree or its history.

## Scope

Allowed production changes:

- `src/game/visual/` generic appearance-profile, facing, frame, layer, catalog, loading,
  animation, and rendering helpers;
- the minimum combat presentation orchestration under `src/game/` needed to pass movement
  direction into the generic visual model and select a review profile;
- exact runtime actor layers under `public/assets/`;
- focused pure tests explicitly authorized below;
- `public/assets/README.md` and `public/assets/PROVENANCE.md`;
- the implementation closeout and the required current-state documentation updates.

Do not change:

- `src/rules/`;
- `src/content/`;
- `src/combat/`;
- `src/movement/`;
- `src/exploration/`;
- `src/cli/`;
- `src/ui/`;
- `src/narrative/`;
- combat actor ids, labels, attributes, defenses, life, actions, abilities, weapons, ranges,
  resources, encounter composition, positions, movement allowance, turn order, damage,
  outcomes, controls, or enemy decisions;
- the `640 x 360` logical resolution, integer-scale policy, combat arena, or exploration
  presentation;
- package dependencies, `package.json`, `pnpm-lock.yaml`, or any other lockfile.

Do not implement inventory, character creation, character selection, progression, equipment
rules, mechanical equipment swapping, exploration art migration, new combat actions, audio,
narrative content, a paper-doll editor, or a general-purpose asset authoring pipeline.

## Acceptance criterion 1: visual diversity

All of the following must hold:

- at least three primary identities are available for runtime review: combatant, caster, and
  specialist;
- all three render through the same scene path and the same generic profile resolver;
- all three have separate body and outfit layers;
- each identity has a distinct silhouette and at least one distinguishing non-body modular
  layer;
- at least one identity visibly uses an accessory;
- the identities remain distinguishable in full-scene captures with labels, HP bars, rings,
  reticles, and identity names hidden;
- a human reviewer approves one comparable idle capture of each identity at the same viewport,
  arena cell, zoom, and lighting conditions.

## Acceptance criterion 2: modularity and equipment breadth

All of the following must hold:

- profile data is composed only from the generic slots in the visual identity contract;
- the alternate loadout changes exactly one declared outfit/equipment/accessory slot while
  retaining the same body and all unrelated slots;
- a before/after capture shows that one-slot change without any mechanical or HUD-value change;
- one new test-only identity profile, with an id absent from production data, resolves its
  ordered layers, facing, and animations through pure generic helpers;
- no production conditional or switch names a profile, identity, class, archetype, weapon,
  armor, or equipment id;
- after the generic Task 08 model exists, adding a production profile changes only visual data,
  asset catalog records, runtime asset files, and provenance.

## Acceptance criterion 3: orientation and animation

All of the following must hold:

- north, east, south, and west are supported presentation facings;
- orthogonal grid deltas resolve to the cardinal mapping in the orientation contract;
- zero-length movement preserves facing and diagonal input fails explicitly;
- idle presentation retains the last movement facing;
- every visible layer remains synchronized across all four facings and all five existing
  states: `idle`, `movement`, `attack`, `hit`, and `defeat`;
- movement duration remains Manhattan distance times the existing duration per cell;
- attack contact, reaction, and recovery ordering and reduced-motion behavior remain unchanged;
- no orientation choice affects grid position, path, range, collision, action resolution, or
  turn state;
- a human reviewer approves a cardinal-direction movement capture sequence and one attack/hit
  sequence with at least three visible layers synchronized.

## Acceptance criterion 4: artistic consistency

All of the following must hold:

- every new runtime layer uses the Task 07 native pixel unit, top-down three-quarter
  perspective, integer scale, integer position, frame dimensions, and ground-contact anchor;
- outline weight, body proportions, palette range, saturation, lighting direction, shadow
  treatment, and animation cadence are compatible across all three identities and the arena;
- modular layers do not drift, clip incorrectly, change apparent body scale, or expose halos
  between facings or frames;
- no identity is distinguished only by palette swapping;
- browser captures show hard pixel edges without interpolation at `1280 x 720` and
  `1920 x 1080`;
- a human reviewer approves a single comparison sheet containing all three identities at the
  same rendered scale.

## Acceptance criterion 5: IP, license, and provenance

All of the following must hold:

- every new runtime file has a complete, exact entry in `public/assets/PROVENANCE.md`;
- every entry includes the source archive and runtime SHA-256 values and the complete
  transformation/source-frame mapping required by the asset gate;
- every entry names its actual license basis; no paid or proprietary asset is recorded as
  `CC0`;
- every source license is compatible with modification and use in the game and has no
  conflicting source-page restriction;
- proprietary source-file, sublicensing, transfer, repository-access, team-access, and
  redistribution restrictions are recorded and satisfied before the file is committed;
- no unused source archive, demo, or unselected source file is committed;
- no official art, protected name, logo, trademark, setting expression, or derived official
  asset is present;
- no AI-generated runtime art is added;
- no licensed asset is supplied to an AI system contrary to its license;
- a human reviewer approves any supplementary source before its assets are merged.

## Acceptance criterion 6: mechanical preservation

All of the following must hold:

- every one of the 58 test files and 457 tests present at `3cd5d7b` remains present, enabled,
  byte-for-byte unchanged, and passing;
- no existing test file is edited, moved, renamed, deleted, skipped, or weakened;
- exactly one new pure test file is added with exactly eight focused tests covering:
  cardinal delta mapping, zero-delta retention, diagonal rejection, profile structural
  validity, four-facing animation resolution, layer synchronization, the one-slot alternate
  loadout, and the test-only fourth-profile proof;
- the final suite therefore contains exactly **59 files and 465 tests**;
- no file in the forbidden `src/` compartments listed under Scope changes;
- runtime captures show identical participant statistics, actions, ranges, resources, life,
  turn order, movement allowance, damage, and outcomes for every selected visual profile;
- the terminal combat harness remains unaffected by visual profile selection.

Use this comparison when preparing the implementation closeout:

```bash
git diff --name-status 3cd5d7b -- ':(glob)src/**/*.test.ts'
```

It may report one added test file and must report no modified, deleted, renamed, or copied
baseline test file. If the implementation base contains a reviewed documentation-only merge
after `3cd5d7b`, that does not change the test comparison.

## Verification

Run without installing, removing, upgrading, or reconciling dependencies:

```text
pnpm test
pnpm typecheck
pnpm build
```

If the local `pnpm` wrapper attempts to modify `node_modules`, stop that command and use the
already-installed project binaries or existing package scripts without running any install
command. Record the exact fallback. Never change `package.json`, a lockfile, or installed
dependency versions to make validation run.

Also capture and review:

- combatant idle;
- caster idle;
- specialist idle;
- the primary and alternate loadout under identical conditions;
- north, east, south, and west movement;
- an attack with anticipation, contact, target reaction, and recovery;
- hit and defeat;
- reduced-motion behavior;
- full-scene views at `1280 x 720` and `1920 x 1080`;
- one comparison sheet containing all three primary identities at the same scale.

Automated tests cannot establish visual coherence. The human reviewer must approve the three
identity captures, the cardinal movement sequence, the synchronized action sequence, the
loadout comparison, and the full-scene comparison before merge.

## Completion hygiene

On implementation completion:

- append exact provenance and transformations for every new runtime file;
- record the actual license basis and all repository-access restrictions for any proprietary
  runtime file; never label a paid license as `CC0`;
- write `docs/MODULAR_CHARACTER_VISUAL_BREADTH_CLOSEOUT_V1.md`;
- update `README.md` and `docs/MVP_SCOPE.md` in the same work;
- record the final test count and the unchanged baseline comparison;
- append a new numbered decision only if implementation introduces an architectural decision
  not already governed by decision 0057;
- keep the repository private;
- use one implementation branch and open one pull request containing only Task 08;
- do not merge before the required human visual approvals.
