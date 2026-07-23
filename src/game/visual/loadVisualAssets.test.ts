import { describe, expect, it, vi } from 'vitest';
import Phaser from 'phaser';
import { VISUAL_ASSET_KEYS, type VisualAssetKey } from './assetKeys';
import { VISUAL_ASSET_CATALOG, createSpritesheetEntry, type VisualAssetCatalogEntry } from './assetCatalog';
import { queueVisualAssets } from './loadVisualAssets';

const DISABLED_CATALOG = Object.fromEntries(
  Object.entries(VISUAL_ASSET_CATALOG).map(([key, entry]) => [
    key,
    { ...entry, loadByDefault: false },
  ]),
) as Readonly<Record<VisualAssetKey, VisualAssetCatalogEntry>>;

describe('loadVisualAssets loading boundary', () => {
  it('correctly selects image loader for image entries', () => {
    const mockImageLoader = vi.fn();
    const mockScene = {
      load: {
        image: mockImageLoader,
        spritesheet: vi.fn(),
      },
    } as unknown as Phaser.Scene;

    const catalog: Readonly<Record<VisualAssetKey, VisualAssetCatalogEntry>> = {
      ...DISABLED_CATALOG,
      [VISUAL_ASSET_KEYS.explorationGround]: {
        key: VISUAL_ASSET_KEYS.explorationGround,
        kind: 'terrain',
        resourceKind: 'image',
        path: '/assets/exploration/terrain-ground.png',
        loadByDefault: true, // Enabled
        logicalWidth: 32,
        logicalHeight: 32,
        anchor: { x: 0.5, y: 0.5 },
        source: 'generated-raster',
        provenanceRef: 'public/assets/PROVENANCE.md',
        fallback: 'terrain',
      },
    };

    const result = queueVisualAssets(mockScene, catalog);
    expect(result).toEqual([VISUAL_ASSET_KEYS.explorationGround]);
    expect(mockImageLoader).toHaveBeenCalledWith(
      VISUAL_ASSET_KEYS.explorationGround,
      '/assets/exploration/terrain-ground.png',
    );
  });

  it('correctly selects spritesheet loader for spritesheet entries', () => {
    const mockSpritesheetLoader = vi.fn();
    const mockScene = {
      load: {
        image: vi.fn(),
        spritesheet: mockSpritesheetLoader,
      },
    } as unknown as Phaser.Scene;

    const baseEntry = createSpritesheetEntry(
      VISUAL_ASSET_KEYS.playerActor,
      'actor',
      '/assets/actors/player.png',
      32,
      32,
      { x: 0.5, y: 0.8 },
      'generated-raster',
      'player',
      {
        frameWidth: 16,
        frameHeight: 16,
        margin: 1,
        spacing: 2,
      },
    );

    const catalog: Readonly<Record<VisualAssetKey, VisualAssetCatalogEntry>> = {
      ...DISABLED_CATALOG,
      [VISUAL_ASSET_KEYS.playerActor]: {
        ...baseEntry,
        loadByDefault: true,
      } as unknown as VisualAssetCatalogEntry,
    };

    const result = queueVisualAssets(mockScene, catalog);
    expect(result).toContain(VISUAL_ASSET_KEYS.playerActor);
    expect(mockSpritesheetLoader).toHaveBeenCalledWith(
      VISUAL_ASSET_KEYS.playerActor,
      '/assets/actors/player.png',
      {
        frameWidth: 16,
        frameHeight: 16,
        margin: 1,
        spacing: 2,
      },
    );
  });

  it('ignores null-path fallback entries', () => {
    const mockImageLoader = vi.fn();
    const mockSpritesheetLoader = vi.fn();
    const mockScene = {
      load: {
        image: mockImageLoader,
        spritesheet: mockSpritesheetLoader,
      },
    } as unknown as Phaser.Scene;

    const catalog: Readonly<Record<VisualAssetKey, VisualAssetCatalogEntry>> = {
      ...DISABLED_CATALOG,
      [VISUAL_ASSET_KEYS.combatGround]: {
        key: VISUAL_ASSET_KEYS.combatGround,
        kind: 'terrain',
        resourceKind: 'image',
        path: null, // Null path
        loadByDefault: true, // Force to true for test
        logicalWidth: 42,
        logicalHeight: 42,
        anchor: { x: 0.5, y: 0.5 },
        source: 'repository-graphics',
        provenanceRef: 'public/assets/PROVENANCE.md',
        fallback: 'terrain',
      } as unknown as VisualAssetCatalogEntry,
    };

    const result = queueVisualAssets(mockScene, catalog);
    expect(result).toEqual([]);
    expect(mockImageLoader).not.toHaveBeenCalled();
    expect(mockSpritesheetLoader).not.toHaveBeenCalled();
  });

  it('provides duplicate loading protection within a call when semantic keys are identical', () => {
    const mockImageLoader = vi.fn();
    const mockScene = {
      load: {
        image: mockImageLoader,
        spritesheet: vi.fn(),
      },
    } as unknown as Phaser.Scene;

    const entry1: VisualAssetCatalogEntry = {
      key: VISUAL_ASSET_KEYS.explorationGround,
      kind: 'terrain',
      resourceKind: 'image',
      path: '/assets/exploration/terrain-ground.png',
      loadByDefault: true,
      logicalWidth: 32,
      logicalHeight: 32,
      anchor: { x: 0.5, y: 0.5 },
      source: 'generated-raster',
      provenanceRef: 'public/assets/PROVENANCE.md',
      fallback: 'terrain',
    };

    const entry2: VisualAssetCatalogEntry = {
      ...entry1,
      path: '/assets/exploration/terrain-ground-v2.png', // Different path but same key
    };

    // Catalog has different object keys pointing to entries with the identical semantic key
    const catalog: Readonly<Record<VisualAssetKey, VisualAssetCatalogEntry>> = {
      ...DISABLED_CATALOG,
      [VISUAL_ASSET_KEYS.explorationGround]: entry1,
      [VISUAL_ASSET_KEYS.wallObstacle]: entry2, // Place entry2 (which shares entry1's key) under wallObstacle key
    };

    const result = queueVisualAssets(mockScene, catalog);
    expect(result).toEqual([VISUAL_ASSET_KEYS.explorationGround]);
    expect(mockImageLoader).toHaveBeenCalledTimes(1);
    expect(mockImageLoader).toHaveBeenCalledWith(
      VISUAL_ASSET_KEYS.explorationGround,
      '/assets/exploration/terrain-ground.png',
    );
  });

  it('queues distinct semantic keys successfully', () => {
    const mockImageLoader = vi.fn();
    const mockScene = {
      load: {
        image: mockImageLoader,
        spritesheet: vi.fn(),
      },
    } as unknown as Phaser.Scene;

    const catalog: Readonly<Record<VisualAssetKey, VisualAssetCatalogEntry>> = {
      ...DISABLED_CATALOG,
      [VISUAL_ASSET_KEYS.explorationGround]: {
        key: VISUAL_ASSET_KEYS.explorationGround,
        kind: 'terrain',
        resourceKind: 'image',
        path: '/assets/exploration/terrain-ground.png',
        loadByDefault: true,
        logicalWidth: 32,
        logicalHeight: 32,
        anchor: { x: 0.5, y: 0.5 },
        source: 'generated-raster',
        provenanceRef: 'public/assets/PROVENANCE.md',
        fallback: 'terrain',
      },
      [VISUAL_ASSET_KEYS.wallObstacle]: {
        key: VISUAL_ASSET_KEYS.wallObstacle,
        kind: 'obstacle',
        resourceKind: 'image',
        path: '/assets/exploration/wall-obstacle.png',
        loadByDefault: true,
        logicalWidth: 32,
        logicalHeight: 32,
        anchor: { x: 0.5, y: 0.5 },
        source: 'generated-raster',
        provenanceRef: 'public/assets/PROVENANCE.md',
        fallback: 'obstacle',
      },
    };

    const result = queueVisualAssets(mockScene, catalog);
    expect(result).toContain(VISUAL_ASSET_KEYS.explorationGround);
    expect(result).toContain(VISUAL_ASSET_KEYS.wallObstacle);
    expect(mockImageLoader).toHaveBeenCalledTimes(2);
  });

  it('forwards startFrame and endFrame to Phaser loader with their exact values', () => {
    const mockSpritesheetLoader = vi.fn();
    const mockScene = {
      load: {
        image: vi.fn(),
        spritesheet: mockSpritesheetLoader,
      },
    } as unknown as Phaser.Scene;

    const baseEntry = createSpritesheetEntry(
      VISUAL_ASSET_KEYS.playerActor,
      'actor',
      '/assets/actors/player.png',
      32,
      32,
      { x: 0.5, y: 0.8 },
      'generated-raster',
      'player',
      {
        frameWidth: 16,
        frameHeight: 16,
        startFrame: 3,
        endFrame: 9,
        margin: 1,
        spacing: 2,
      },
    );

    const catalog: Readonly<Record<VisualAssetKey, VisualAssetCatalogEntry>> = {
      ...DISABLED_CATALOG,
      [VISUAL_ASSET_KEYS.playerActor]: {
        ...baseEntry,
        loadByDefault: true,
      } as unknown as VisualAssetCatalogEntry,
    };

    const result = queueVisualAssets(mockScene, catalog);
    expect(result).toContain(VISUAL_ASSET_KEYS.playerActor);
    expect(mockSpritesheetLoader).toHaveBeenCalledWith(
      VISUAL_ASSET_KEYS.playerActor,
      '/assets/actors/player.png',
      {
        frameWidth: 16,
        frameHeight: 16,
        startFrame: 3,
        endFrame: 9,
        margin: 1,
        spacing: 2,
      },
    );
  });

  it('validates frame dimensions before queueing to avoid silent defaults', () => {
    const mockScene = {
      load: {
        image: vi.fn(),
        spritesheet: vi.fn(),
      },
    } as unknown as Phaser.Scene;

    const baseEntry = createSpritesheetEntry(
      VISUAL_ASSET_KEYS.playerActor,
      'actor',
      '/assets/actors/player.png',
      32,
      32,
      { x: 0.5, y: 0.8 },
      'generated-raster',
      'player',
      {
        frameWidth: 0, // Invalid dimension
        frameHeight: 16,
      },
    );

    const catalog: Readonly<Record<VisualAssetKey, VisualAssetCatalogEntry>> = {
      ...DISABLED_CATALOG,
      [VISUAL_ASSET_KEYS.playerActor]: {
        ...baseEntry,
        loadByDefault: true,
      } as unknown as VisualAssetCatalogEntry,
    };

    expect(() => queueVisualAssets(mockScene, catalog)).toThrow();
  });
});
