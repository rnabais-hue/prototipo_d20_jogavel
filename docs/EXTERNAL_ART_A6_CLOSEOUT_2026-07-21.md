# External Art A6 Closeout

## Decision

Milestone A6 is closed as **Approved - fallback-only UI pass** by the user on 2026-07-21.

The approval covers the runtime text hierarchy, compact player-facing interaction feedback, deterministic camera transitions, Q/E combat zoom with fixed screen-space UI, code-native UI fallbacks, and observed combat-animation readability.

## Raster candidate disposition

The five UI icon candidates and two panel candidates produced for A6 are **Rejected for runtime integration**. They remain recorded for provenance only and must keep `loadByDefault: false`.

No candidate receives retroactive artistic approval. A future replacement requires a new proof package, complete masters/provenance, and a new explicit human gate.

## Runtime outcome

- Objective and interaction UI no longer use the misleading opaque plaque over the map.
- Normal mode uses compact player-facing interaction messages; technical identifiers remain debug-only.
- Interaction feedback expires after a finite interval.
- Combat resets the world camera to 1x on entry.
- Q/E zoom the combat world between the configured limits while HUD, console, prompts, health bars and banners remain on a fixed UI camera.
- Returning to exploration restores the deterministic camera transform.
- The inspect/search candidate is never used as an ability icon.

## Validation baseline

The final implementation baseline reported before closure:

- Vitest: 55 files, 428 tests passed.
- TypeScript typecheck: passed.
- Production build: passed.
- Known non-blocking warning: the main production chunk remains above 500 kB.

The user subsequently reported the runtime presentation and combat animations as acceptable and explicitly requested closure on 2026-07-21.

## Scope boundary

This record closes A6 only. A7 actor spritesheets may begin only through a separate explicit user decision. A8 and A9 remain pending.
