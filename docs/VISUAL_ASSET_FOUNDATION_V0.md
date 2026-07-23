# Visual Asset Foundation v0

## Scope

Presentation infrastructure only. No exploration or combat reskin is included.

## Ownership

- [`assetKeys.ts`](../src/game/visual/assetKeys.ts) owns stable semantic presentation keys.
- [`assetCatalog.ts`](../src/game/visual/assetCatalog.ts) owns typed metadata, planned public paths, provenance references, and fallback roles.
- [`visualScale.ts`](../src/game/visual/visualScale.ts) owns presentation-only sizes and anchors.
- [`loadVisualAssets.ts`](../src/game/visual/loadVisualAssets.ts) is the Phaser loading boundary. It queues only entries explicitly marked `loadByDefault` and having a path.
- [`assetAvailability.ts`](../src/game/visual/assetAvailability.ts) selects texture or fallback deterministically without Phaser.
- [`fallbackGraphics.ts`](../src/game/visual/fallbackGraphics.ts) can create visible code-native Phaser fallbacks.
- [`public/assets/`](../public/assets/README.md) is the future Vite static boundary; [`PROVENANCE.md`](../public/assets/PROVENANCE.md) records licensing/source information.

All catalog entries remain disabled for default loading because this milestone adds no visual assets. Current debug graphics stay unchanged and visible. A later visual pass may add a file, document provenance, enable its entry, queue it from scene lifecycle, and use `resolveVisualAsset` before choosing a sprite or fallback.

Pure rules, combat, movement, and exploration layers do not depend on this foundation.
