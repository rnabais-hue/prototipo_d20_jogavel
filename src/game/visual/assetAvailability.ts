import type { VisualAssetCatalogEntry } from './assetCatalog';

export type VisualAssetResolution = Readonly<{
  mode: 'texture' | 'fallback';
  reason: 'loaded' | 'repository-graphics' | 'not-loaded' | 'missing-path';
}>;

export function resolveVisualAsset(
  entry: VisualAssetCatalogEntry,
  textureExists: (key: string) => boolean,
): VisualAssetResolution {
  if (entry.path === null) {
    return { mode: 'fallback', reason: entry.source === 'repository-graphics' ? 'repository-graphics' : 'missing-path' };
  }
  return textureExists(entry.key)
    ? { mode: 'texture', reason: 'loaded' }
    : { mode: 'fallback', reason: 'not-loaded' };
}
