# A6 UI Proof Package - Closed

## Gate state

- Technical revision prepared on 2026-07-19.
- Human gate closed by the user on 2026-07-21.
- A6 is approved as a fallback-only UI pass: text hierarchy, compact interaction feedback, combat zoom isolation and combat animation readability were accepted.
- All seven raster candidates in this package were rejected for runtime integration and remain disabled; runtime uses code-native fallbacks.
- The inspect/search icon is not assigned to Abilities or Focused Drive.
- This decision closes A6 only and does not automatically start A7.

## Contents

- `icons-current-dark-light-32-16.png`: current derivatives at review sizes over `#10141B` and `#F4F0E8`.
- `icons-revision-r1-dark-light-32-16.png`: diagnostic padded revisions at the same review sizes.
- `current-runtime-candidates/`: copies of the currently registered but disabled candidates.
- `revision-r1-padded-candidates/`: 32 x 32 diagnostic revisions with a two-pixel transparent safety margin.
- `panel-nine-slice-diagnostic.png`: offline nine-slice approximation at representative normal/small widths.
- `A6-TECHNICAL-MANIFEST.json`: hashes, alpha bounds, corner alpha and edge-touch metrics.

## Processing disclosure

The revision icons are not new artistic masters. Each available 32 x 32 derivative was reduced as a whole to 28 x 28 using Lanczos and centered on a transparent 32 x 32 canvas. This removes occupied corners and gives a measurable safety margin, but it does not replace the missing recommended 128 x 128 masters. The files remain candidates outside `public/assets`.

## Human decision

The user completed the runtime walkthrough and approved closure on 2026-07-21 after confirming:

1. the opaque HUD plaque was removed;
2. combat starts from a deterministic 1x camera transform;
3. Q/E zoom works during combat while UI remains isolated from world zoom;
4. player-facing interaction feedback is compact and technical detail remains in debug mode;
5. combat animations remain readable;
6. code-native fallbacks remain the approved A6 runtime presentation.

The icon and panel proof candidates were not approved. They remain historical evidence and must not be enabled without a new human gate.

## Known limitations

- No original 128 x 128 icon masters or generation identifiers were available.
- The panel sheet is an offline approximation, not proof of Phaser rendering.
- No ability icon was created; the text-only fallback is intentional and semantically safe.
