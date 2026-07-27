import { describe, expect, it } from 'vitest';
import { resolveVisualAssetPath } from './loadVisualAssets';

describe('visual asset deployment base path', () => {
  it('keeps catalog paths unchanged at the local development root', () => {
    expect(resolveVisualAssetPath('/assets/actors/player.png', '/')).toBe(
      '/assets/actors/player.png',
    );
  });

  it('prefixes catalog paths for a GitHub Pages project site', () => {
    expect(
      resolveVisualAssetPath('/assets/actors/player.png', '/prototipo_d20_jogavel/'),
    ).toBe('/prototipo_d20_jogavel/assets/actors/player.png');
  });

  it('normalizes a deployment base without a trailing slash', () => {
    expect(
      resolveVisualAssetPath('/assets/actors/player.png', '/prototipo_d20_jogavel'),
    ).toBe('/prototipo_d20_jogavel/assets/actors/player.png');
  });

  it('does not rewrite paths outside the visual asset catalog root', () => {
    expect(resolveVisualAssetPath('https://example.test/asset.png', '/preview/')).toBe(
      'https://example.test/asset.png',
    );
  });
});
