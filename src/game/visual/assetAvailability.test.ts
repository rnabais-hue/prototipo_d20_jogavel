import { describe, expect, it } from 'vitest';
import { getVisualAssetEntry } from './assetCatalog';
import { VISUAL_ASSET_KEYS } from './assetKeys';
import { resolveVisualAsset } from './assetAvailability';

describe('visual asset resolution', () => {
  it('uses a loaded texture when available', () => {
    const result = resolveVisualAsset(getVisualAssetEntry(VISUAL_ASSET_KEYS.playerActor), () => true);
    expect(result).toEqual({ mode: 'texture', reason: 'loaded' });
  });

  it('uses a deterministic fallback when a planned texture is missing', () => {
    const result = resolveVisualAsset(getVisualAssetEntry(VISUAL_ASSET_KEYS.playerActor), () => false);
    expect(result).toEqual({ mode: 'fallback', reason: 'not-loaded' });
  });

  it('uses a deterministic fallback when the approved combat texture is not loaded', () => {
    const result = resolveVisualAsset(getVisualAssetEntry(VISUAL_ASSET_KEYS.combatGround), () => false);
    expect(result).toEqual({ mode: 'fallback', reason: 'not-loaded' });
  });
});
