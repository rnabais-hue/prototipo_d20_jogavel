import { describe, expect, it } from 'vitest';
import { ALL_VISUAL_ASSET_KEYS, VISUAL_ASSET_KEYS, type VisualAssetKey } from './assetKeys';
import {
  VISUAL_ASSET_CATALOG,
  validateVisualAssetCatalog,
  createSpritesheetEntry,
  type VisualAssetCatalogEntry,
} from './assetCatalog';

describe('visual asset catalog', () => {
  it('contains one valid entry for every stable key', () => {
    expect(validateVisualAssetCatalog()).toEqual([]);
    expect(Object.keys(VISUAL_ASSET_CATALOG)).toHaveLength(ALL_VISUAL_ASSET_KEYS.length);
    expect(new Set(ALL_VISUAL_ASSET_KEYS).size).toBe(ALL_VISUAL_ASSET_KEYS.length);
  });

  it('keeps revision-requested A6 UI candidates disabled by default', () => {
    const enabled = Object.values(VISUAL_ASSET_CATALOG)
      .filter((item) => item.loadByDefault)
      .map((item) => item.key);

    expect(enabled).toEqual([
      VISUAL_ASSET_KEYS.explorationGround,
      VISUAL_ASSET_KEYS.combatGround,
      VISUAL_ASSET_KEYS.combatPixelTiles,
      VISUAL_ASSET_KEYS.combatArenaMap,
      VISUAL_ASSET_KEYS.wallObstacle,
      VISUAL_ASSET_KEYS.playerActor,
      VISUAL_ASSET_KEYS.playerActorMovement,
      VISUAL_ASSET_KEYS.playerActorAttack,
      VISUAL_ASSET_KEYS.playerActorHit,
      VISUAL_ASSET_KEYS.playerActorDefeat,
      VISUAL_ASSET_KEYS.enemyActor,
      VISUAL_ASSET_KEYS.enemyActorAttack,
      VISUAL_ASSET_KEYS.enemyActorHit,
      VISUAL_ASSET_KEYS.enemyActorDefeat,
      VISUAL_ASSET_KEYS.combatPlayerBody,
      VISUAL_ASSET_KEYS.combatPlayerMainHandSword,
      VISUAL_ASSET_KEYS.combatPlayerMainHandSpear,
      VISUAL_ASSET_KEYS.combatEnemyBody,
      VISUAL_ASSET_KEYS.combatEnemyMainHandAxe,
      VISUAL_ASSET_KEYS.switchPoint,
      VISUAL_ASSET_KEYS.exitPoint,
      VISUAL_ASSET_KEYS.encounterPoint,
      VISUAL_ASSET_KEYS.attackEffect,
      VISUAL_ASSET_KEYS.damageEffect,
      VISUAL_ASSET_KEYS.defeatEffect,
    ]);
    for (const key of [
      VISUAL_ASSET_KEYS.attackIcon,
      VISUAL_ASSET_KEYS.moveIcon,
      VISUAL_ASSET_KEYS.inspectIcon,
      VISUAL_ASSET_KEYS.endTurnIcon,
      VISUAL_ASSET_KEYS.turnMarkerIcon,
      VISUAL_ASSET_KEYS.panelTexture,
      VISUAL_ASSET_KEYS.borderTexture,
    ]) {
      expect(VISUAL_ASSET_CATALOG[key]).toMatchObject({
        loadByDefault: false,
        provenanceRef: 'public/assets/PROVENANCE.md',
      });
    }
    expect(VISUAL_ASSET_CATALOG[VISUAL_ASSET_KEYS.explorationGround].path)
      .toBe('/assets/terrain/exploration/abandoned-temple-floor-e2p1.png');
    expect(VISUAL_ASSET_CATALOG[VISUAL_ASSET_KEYS.combatGround].path)
      .toBe('/assets/terrain/combat/ruined-sanctuary-floor-c2p1.png');
    expect(VISUAL_ASSET_CATALOG[VISUAL_ASSET_KEYS.playerActor]).toMatchObject({
      path: '/assets/actors/player/A7-player-idle-3f-256.png',
      resourceKind: 'spritesheet',
      frameWidth: 256,
      frameHeight: 256,
      startFrame: 0,
      endFrame: 2,
      logicalWidth: 32,
      logicalHeight: 32,
      anchor: { x: 0.5, y: 0.82 },
      fallback: 'player',
      source: 'generated-raster',
    });
    expect(VISUAL_ASSET_CATALOG[VISUAL_ASSET_KEYS.enemyActor]).toMatchObject({
      path: '/assets/actors/enemies/A7-enemy-idle-3f-256.png',
      resourceKind: 'spritesheet',
      frameWidth: 256,
      frameHeight: 256,
      startFrame: 0,
      endFrame: 2,
      logicalWidth: 32,
      logicalHeight: 32,
      anchor: { x: 0.5, y: 0.82 },
      fallback: 'enemy',
      source: 'generated-raster',
    });
  });

  it('keeps file paths in the future Vite public asset boundary', () => {
    const paths = Object.values(VISUAL_ASSET_CATALOG).flatMap((item) =>
      item.path === null ? [] : [item.path],
    );
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.every((path) => path.startsWith('/assets/'))).toBe(true);
  });

  it('detects static image entries correctly', () => {
    const customCatalog: Record<string, any> = {
      ...VISUAL_ASSET_CATALOG,
      [VISUAL_ASSET_KEYS.explorationGround]: {
        key: VISUAL_ASSET_KEYS.explorationGround,
        kind: 'terrain',
        resourceKind: 'image',
        path: '/assets/terrain.png',
        loadByDefault: false,
        logicalWidth: 32,
        logicalHeight: 32,
        anchor: { x: 0.5, y: 0.5 },
        source: 'generated-raster',
        provenanceRef: 'public/assets/PROVENANCE.md',
        fallback: 'terrain',
      },
    };
    // No error for valid static image entry
    expect(
      validateVisualAssetCatalog(
        customCatalog as Readonly<Record<VisualAssetKey, VisualAssetCatalogEntry>>,
      ),
    ).toEqual([]);
  });

  it('detects spritesheet entries correctly', () => {
    const entry = createSpritesheetEntry(
      VISUAL_ASSET_KEYS.playerActor,
      'actor',
      '/assets/player.png',
      32,
      32,
      { x: 0.5, y: 0.8 },
      'generated-raster',
      'player',
      {
        frameWidth: 16,
        frameHeight: 16,
        startFrame: 0,
        endFrame: 5,
        margin: 1,
        spacing: 2,
      },
    );

    const customCatalog = {
      ...VISUAL_ASSET_CATALOG,
      [VISUAL_ASSET_KEYS.playerActor]: entry,
    };
    expect(validateVisualAssetCatalog(customCatalog)).toEqual([]);
  });

  it('rejects invalid frame dimensions for spritesheets', () => {
    const entry = createSpritesheetEntry(
      VISUAL_ASSET_KEYS.playerActor,
      'actor',
      '/assets/player.png',
      32,
      32,
      { x: 0.5, y: 0.8 },
      'generated-raster',
      'player',
      {
        frameWidth: -10, // Invalid
        frameHeight: 0,  // Invalid
      },
    );

    const customCatalog = {
      ...VISUAL_ASSET_CATALOG,
      [VISUAL_ASSET_KEYS.playerActor]: entry,
    };
    const errors = validateVisualAssetCatalog(customCatalog);
    expect(errors.some((e) => e.includes('spritesheets without positive frame dimensions'))).toBe(true);
  });

  it('rejects invalid frame ranges', () => {
    const entry = createSpritesheetEntry(
      VISUAL_ASSET_KEYS.playerActor,
      'actor',
      '/assets/player.png',
      32,
      32,
      { x: 0.5, y: 0.8 },
      'generated-raster',
      'player',
      {
        frameWidth: 16,
        frameHeight: 16,
        startFrame: 5,
        endFrame: 2, // startFrame > endFrame
      },
    );

    const entryNegative = createSpritesheetEntry(
      VISUAL_ASSET_KEYS.enemyActor,
      'actor',
      '/assets/enemy.png',
      32,
      32,
      { x: 0.5, y: 0.8 },
      'generated-raster',
      'enemy',
      {
        frameWidth: 16,
        frameHeight: 16,
        startFrame: -1, // Negative frame
      },
    );

    const customCatalog = {
      ...VISUAL_ASSET_CATALOG,
      [VISUAL_ASSET_KEYS.playerActor]: entry,
      [VISUAL_ASSET_KEYS.enemyActor]: entryNegative,
    };
    const errors = validateVisualAssetCatalog(customCatalog);
    expect(errors.filter((e) => e.includes('invalid frame ranges'))).toHaveLength(2);
  });

  it('rejects invalid margin and spacing values', () => {
    const entry = createSpritesheetEntry(
      VISUAL_ASSET_KEYS.playerActor,
      'actor',
      '/assets/player.png',
      32,
      32,
      { x: 0.5, y: 0.8 },
      'generated-raster',
      'player',
      {
        frameWidth: 16,
        frameHeight: 16,
        margin: -1, // Negative margin
        spacing: 1.5, // Non-integer spacing
      },
    );

    const customCatalog = {
      ...VISUAL_ASSET_CATALOG,
      [VISUAL_ASSET_KEYS.playerActor]: entry,
    };
    const errors = validateVisualAssetCatalog(customCatalog);
    expect(errors.filter((e) => e.includes('invalid margin or spacing'))).toHaveLength(2);
  });

  it('rejects enabled loadByDefault entries without paths', () => {
    const entry = {
      key: VISUAL_ASSET_KEYS.explorationGround,
      kind: 'terrain',
      resourceKind: 'image',
      path: null, // No path
      loadByDefault: true, // Enabled
      logicalWidth: 32,
      logicalHeight: 32,
      anchor: { x: 0.5, y: 0.5 },
      source: 'generated-raster',
      provenanceRef: 'public/assets/PROVENANCE.md',
      fallback: 'terrain',
    } as unknown as VisualAssetCatalogEntry;

    const customCatalog = {
      ...VISUAL_ASSET_CATALOG,
      [VISUAL_ASSET_KEYS.explorationGround]: entry,
    };
    const errors = validateVisualAssetCatalog(customCatalog);
    expect(errors.some((e) => e.includes('enabled entries without paths'))).toBe(true);
  });

  it('rejects paths outside of /assets/', () => {
    const entry: VisualAssetCatalogEntry = {
      key: VISUAL_ASSET_KEYS.explorationGround,
      kind: 'terrain',
      resourceKind: 'image',
      path: '/wrong/path.png', // Outside /assets/
      loadByDefault: false,
      logicalWidth: 32,
      logicalHeight: 32,
      anchor: { x: 0.5, y: 0.5 },
      source: 'generated-raster',
      provenanceRef: 'public/assets/PROVENANCE.md',
      fallback: 'terrain',
    };

    const customCatalog = {
      ...VISUAL_ASSET_CATALOG,
      [VISUAL_ASSET_KEYS.explorationGround]: entry,
    };
    const errors = validateVisualAssetCatalog(customCatalog);
    expect(errors.some((e) => e.includes('paths outside /assets/'))).toBe(true);
  });

  it('rejects incompatible metadata properties on image resources', () => {
    const entry = {
      key: VISUAL_ASSET_KEYS.explorationGround,
      kind: 'terrain',
      resourceKind: 'image',
      path: '/assets/ground.png',
      loadByDefault: false,
      logicalWidth: 32,
      logicalHeight: 32,
      anchor: { x: 0.5, y: 0.5 },
      source: 'generated-raster',
      provenanceRef: 'public/assets/PROVENANCE.md',
      fallback: 'terrain',
      frameWidth: 16, // Incompatible
    } as unknown as VisualAssetCatalogEntry;

    const customCatalog = {
      ...VISUAL_ASSET_CATALOG,
      [VISUAL_ASSET_KEYS.explorationGround]: entry,
    };
    const errors = validateVisualAssetCatalog(customCatalog);
    expect(errors.some((e) => e.includes('incompatible metadata for the selected resource kind'))).toBe(true);
  });

  it('rejects malformed or missing provenance references', () => {
    const entryMalformed: VisualAssetCatalogEntry = {
      key: VISUAL_ASSET_KEYS.explorationGround,
      kind: 'terrain',
      resourceKind: 'image',
      path: '/assets/ground.png',
      loadByDefault: false,
      logicalWidth: 32,
      logicalHeight: 32,
      anchor: { x: 0.5, y: 0.5 },
      source: 'generated-raster',
      provenanceRef: 'public/assets/PROVENANCE.txt', // Malformed (.txt)
      fallback: 'terrain',
    };

    const entryMissing: VisualAssetCatalogEntry = {
      key: VISUAL_ASSET_KEYS.wallObstacle,
      kind: 'obstacle',
      resourceKind: 'image',
      path: '/assets/wall.png',
      loadByDefault: false,
      logicalWidth: 32,
      logicalHeight: 32,
      anchor: { x: 0.5, y: 0.5 },
      source: 'generated-raster',
      provenanceRef: '', // Missing
      fallback: 'obstacle',
    };

    const customCatalog = {
      ...VISUAL_ASSET_CATALOG,
      [VISUAL_ASSET_KEYS.explorationGround]: entryMalformed,
      [VISUAL_ASSET_KEYS.wallObstacle]: entryMissing,
    };
    const errors = validateVisualAssetCatalog(customCatalog);
    expect(errors.filter((e) => e.includes('malformed or missing provenance references'))).toHaveLength(2);
  });
});
