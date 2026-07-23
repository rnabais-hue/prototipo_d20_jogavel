import { ALL_VISUAL_ASSET_KEYS, VISUAL_ASSET_KEYS, type VisualAssetKey } from './assetKeys';
import { VISUAL_SCALE, type VisualAnchor } from './visualScale';

export type VisualAssetKind = 'terrain' | 'obstacle' | 'actor' | 'point-of-interest' | 'effect' | 'ui-icon' | 'ui-panel';
export type VisualAssetSource = 'generated-raster' | 'permissive-external' | 'repository-graphics' | 'temporary-fallback';

export type ImageResource = Readonly<{
  resourceKind: 'image';
  path: string;
  loadByDefault: boolean;
}>;

export type SpritesheetResource = Readonly<{
  resourceKind: 'spritesheet';
  path: string;
  loadByDefault: boolean;
  frameWidth: number;
  frameHeight: number;
  startFrame?: number;
  endFrame?: number;
  margin?: number;
  spacing?: number;
}>;

export type FallbackResource = Readonly<{
  resourceKind: 'image' | 'spritesheet';
  path: null;
  loadByDefault: false;
}>;

export type BaseAssetCatalogEntry = Readonly<{
  key: VisualAssetKey;
  kind: VisualAssetKind;
  logicalWidth: number;
  logicalHeight: number;
  anchor: VisualAnchor;
  source: VisualAssetSource;
  provenanceRef: string;
  fallback: 'terrain' | 'obstacle' | 'player' | 'enemy' | 'survey' | 'switch' | 'exit' | 'encounter' | 'effect' | 'icon' | 'panel';
}>;

export type VisualAssetCatalogEntry = BaseAssetCatalogEntry & (ImageResource | SpritesheetResource | FallbackResource);

const center = Object.freeze({ x: 0.5, y: 0.5 });
const actorAnchor = VISUAL_SCALE.actorAnchor;
const provenanceRef = 'public/assets/PROVENANCE.md';

export const VISUAL_ASSET_CATALOG: Readonly<Record<VisualAssetKey, VisualAssetCatalogEntry>> = Object.freeze({
  [VISUAL_ASSET_KEYS.explorationGround]: entry(VISUAL_ASSET_KEYS.explorationGround, 'terrain', '/assets/terrain/exploration/abandoned-temple-floor-e2p1.png', 32, 32, center, 'generated-raster', 'terrain', true),
  [VISUAL_ASSET_KEYS.combatGround]: entry(VISUAL_ASSET_KEYS.combatGround, 'terrain', '/assets/terrain/combat/ruined-sanctuary-floor-c2p1.png', 42, 42, center, 'generated-raster', 'terrain', true),
  [VISUAL_ASSET_KEYS.wallObstacle]: entry(VISUAL_ASSET_KEYS.wallObstacle, 'obstacle', '/assets/world/obstacles/A4-wall-W1R1-master.png', 32, 32, center, 'generated-raster', 'obstacle', true),
  [VISUAL_ASSET_KEYS.playerActor]: actorSheet(VISUAL_ASSET_KEYS.playerActor, '/assets/actors/player/A7-player-idle-3f-256.png', 'player'),
  [VISUAL_ASSET_KEYS.playerActorMovement]: actorSheet(VISUAL_ASSET_KEYS.playerActorMovement, '/assets/actors/player/A7-player-movement-3f-256.png', 'player'),
  [VISUAL_ASSET_KEYS.playerActorAttack]: actorSheet(VISUAL_ASSET_KEYS.playerActorAttack, '/assets/actors/player/A7-player-attack-3f-256.png', 'player'),
  [VISUAL_ASSET_KEYS.playerActorHit]: actorSheet(VISUAL_ASSET_KEYS.playerActorHit, '/assets/actors/player/A7-player-hit-3f-256.png', 'player'),
  [VISUAL_ASSET_KEYS.playerActorDefeat]: actorSheet(VISUAL_ASSET_KEYS.playerActorDefeat, '/assets/actors/player/A7-player-defeat-3f-256.png', 'player'),
  [VISUAL_ASSET_KEYS.enemyActor]: actorSheet(VISUAL_ASSET_KEYS.enemyActor, '/assets/actors/enemies/A7-enemy-idle-3f-256.png', 'enemy'),
  [VISUAL_ASSET_KEYS.enemyActorAttack]: actorSheet(VISUAL_ASSET_KEYS.enemyActorAttack, '/assets/actors/enemies/A7-enemy-attack-3f-256.png', 'enemy'),
  [VISUAL_ASSET_KEYS.enemyActorHit]: actorSheet(VISUAL_ASSET_KEYS.enemyActorHit, '/assets/actors/enemies/A7-enemy-hit-3f-256.png', 'enemy'),
  [VISUAL_ASSET_KEYS.enemyActorDefeat]: actorSheet(VISUAL_ASSET_KEYS.enemyActorDefeat, '/assets/actors/enemies/A7-enemy-defeat-3f-256.png', 'enemy'),
  [VISUAL_ASSET_KEYS.surveyPoint]: entry(VISUAL_ASSET_KEYS.surveyPoint, 'point-of-interest', null, 18, 18, center, 'repository-graphics', 'survey'),
  [VISUAL_ASSET_KEYS.switchPoint]: createSpritesheetEntry(VISUAL_ASSET_KEYS.switchPoint, 'point-of-interest', '/assets/world/points-of-interest/A4-switch-S1R1-spritesheet.png', 18, 18, center, 'generated-raster', 'switch', { frameWidth: 144, frameHeight: 144 }, true),
  [VISUAL_ASSET_KEYS.exitPoint]: createSpritesheetEntry(VISUAL_ASSET_KEYS.exitPoint, 'point-of-interest', '/assets/world/points-of-interest/A4-exit-X1R1-spritesheet.png', 24, 24, center, 'generated-raster', 'exit', { frameWidth: 192, frameHeight: 192 }, true),
  [VISUAL_ASSET_KEYS.encounterPoint]: entry(VISUAL_ASSET_KEYS.encounterPoint, 'point-of-interest', '/assets/world/points-of-interest/A4-encounter-E1R2-master.png', 18, 18, center, 'generated-raster', 'encounter', true),
  [VISUAL_ASSET_KEYS.attackEffect]: entry(VISUAL_ASSET_KEYS.attackEffect, 'effect', '/assets/effects/attacks/A5-attack-effect.png', 42, 42, center, 'generated-raster', 'effect', true),
  [VISUAL_ASSET_KEYS.damageEffect]: entry(VISUAL_ASSET_KEYS.damageEffect, 'effect', '/assets/effects/impacts/A5-damage-effect.png', 42, 42, center, 'generated-raster', 'effect', true),
  [VISUAL_ASSET_KEYS.defeatEffect]: entry(VISUAL_ASSET_KEYS.defeatEffect, 'effect', '/assets/effects/defeat/A5-defeat-effect.png', 42, 42, center, 'generated-raster', 'effect', true),
  // A6 candidates remain registered for review but disabled until the human gate
  // records an approver and date. Runtime uses deterministic code-native fallbacks.
  [VISUAL_ASSET_KEYS.attackIcon]: entry(VISUAL_ASSET_KEYS.attackIcon, 'ui-icon', '/assets/ui/icons/icon-attack.png', 16, 16, center, 'generated-raster', 'icon'),
  [VISUAL_ASSET_KEYS.moveIcon]: entry(VISUAL_ASSET_KEYS.moveIcon, 'ui-icon', '/assets/ui/icons/icon-move.png', 16, 16, center, 'generated-raster', 'icon'),
  [VISUAL_ASSET_KEYS.inspectIcon]: entry(VISUAL_ASSET_KEYS.inspectIcon, 'ui-icon', '/assets/ui/icons/icon-inspect.png', 16, 16, center, 'generated-raster', 'icon'),
  [VISUAL_ASSET_KEYS.endTurnIcon]: entry(VISUAL_ASSET_KEYS.endTurnIcon, 'ui-icon', '/assets/ui/icons/icon-end-turn.png', 16, 16, center, 'generated-raster', 'icon'),
  [VISUAL_ASSET_KEYS.turnMarkerIcon]: entry(VISUAL_ASSET_KEYS.turnMarkerIcon, 'ui-icon', '/assets/ui/icons/icon-turn-marker.png', 16, 16, center, 'generated-raster', 'icon'),
  [VISUAL_ASSET_KEYS.panelTexture]: entry(VISUAL_ASSET_KEYS.panelTexture, 'ui-panel', '/assets/ui/panels/panel-standard.png', 32, 32, center, 'generated-raster', 'panel'),
  [VISUAL_ASSET_KEYS.borderTexture]: entry(VISUAL_ASSET_KEYS.borderTexture, 'ui-panel', '/assets/ui/panels/border-standard.png', 32, 32, center, 'generated-raster', 'panel'),
});

function entry(
  key: VisualAssetKey,
  kind: VisualAssetKind,
  path: string | null,
  logicalWidth: number,
  logicalHeight: number,
  anchor: VisualAnchor,
  source: VisualAssetSource,
  fallback: VisualAssetCatalogEntry['fallback'],
  loadByDefault = false,
): VisualAssetCatalogEntry {
  if (path === null) {
    return Object.freeze({
      key,
      kind,
      path: null,
      resourceKind: 'image',
      loadByDefault: false,
      logicalWidth,
      logicalHeight,
      anchor,
      source,
      provenanceRef,
      fallback,
    });
  }
  return Object.freeze({
    key,
    kind,
    path,
    resourceKind: 'image',
    loadByDefault,
    logicalWidth,
    logicalHeight,
    anchor,
    source,
    provenanceRef,
    fallback,
  });
}

function actorSheet(
  key: VisualAssetKey,
  path: string,
  fallback: 'player' | 'enemy',
): VisualAssetCatalogEntry {
  return createSpritesheetEntry(
    key,
    'actor',
    path,
    32,
    32,
    actorAnchor,
    'generated-raster',
    fallback,
    { frameWidth: 256, frameHeight: 256, startFrame: 0, endFrame: 2 },
    true,
  );
}

export function createSpritesheetEntry(
  key: VisualAssetKey,
  kind: VisualAssetKind,
  path: string | null,
  logicalWidth: number,
  logicalHeight: number,
  anchor: VisualAnchor,
  source: VisualAssetSource,
  fallback: VisualAssetCatalogEntry['fallback'],
  spritesheetConfig: {
    frameWidth: number;
    frameHeight: number;
    startFrame?: number;
    endFrame?: number;
    margin?: number;
    spacing?: number;
  },
  loadByDefault = false,
): VisualAssetCatalogEntry {
  if (path === null) {
    return Object.freeze({
      key,
      kind,
      path: null,
      resourceKind: 'spritesheet',
      loadByDefault: false,
      logicalWidth,
      logicalHeight,
      anchor,
      source,
      provenanceRef,
      fallback,
    });
  }
  return Object.freeze({
    key,
    kind,
    path,
    resourceKind: 'spritesheet',
    loadByDefault,
    logicalWidth,
    logicalHeight,
    anchor,
    source,
    provenanceRef,
    fallback,
    ...spritesheetConfig,
  });
}

export function getVisualAssetEntry(key: VisualAssetKey): VisualAssetCatalogEntry {
  return VISUAL_ASSET_CATALOG[key];
}

export function validateVisualAssetCatalog(
  catalog: Readonly<Record<VisualAssetKey, VisualAssetCatalogEntry>> = VISUAL_ASSET_CATALOG,
): readonly string[] {
  const errors: string[] = [];
  const seenKeys = new Set<string>();
  
  // Check that all keys in catalog are known
  const catalogKeys = Object.keys(catalog) as VisualAssetKey[];
  for (const k of catalogKeys) {
    if (!ALL_VISUAL_ASSET_KEYS.includes(k)) {
      errors.push(`unexpected key in catalog: ${k}`);
    }
  }

  for (const expectedKey of ALL_VISUAL_ASSET_KEYS) {
    const item = catalog[expectedKey];
    if (!item) {
      errors.push(`missing catalog entry: ${expectedKey}`);
      continue;
    }
    if (item.key !== expectedKey) {
      errors.push(`catalog key mismatch: ${expectedKey}`);
    }
    if (seenKeys.has(item.key)) {
      errors.push(`duplicate asset key: ${item.key}`);
    }
    seenKeys.add(item.key);

    // Invalid logical dimensions
    if (item.logicalWidth <= 0 || item.logicalHeight <= 0 || !Number.isFinite(item.logicalWidth) || !Number.isFinite(item.logicalHeight)) {
      errors.push(`invalid logical size: ${item.key}`);
    }

    // Invalid anchors
    if (item.anchor.x < 0 || item.anchor.x > 1 || item.anchor.y < 0 || item.anchor.y > 1 || !Number.isFinite(item.anchor.x) || !Number.isFinite(item.anchor.y)) {
      errors.push(`invalid anchors: ${item.key}`);
    }

    // Enabled entries without paths
    if (item.loadByDefault && item.path === null) {
      errors.push(`enabled entries without paths: ${expectedKey}`);
    }

    // Paths outside /assets/
    if (item.path !== null && !item.path.startsWith('/assets/')) {
      errors.push(`paths outside /assets/: ${item.key}`);
    }

    // Malformed or missing provenance reference
    if (
      !item.provenanceRef ||
      typeof item.provenanceRef !== 'string' ||
      item.provenanceRef.trim() === '' ||
      !item.provenanceRef.endsWith('.md')
    ) {
      errors.push(`malformed or missing provenance references where applicable: ${item.key}`);
    }

    // Resource kind validation
    if (item.resourceKind === 'image') {
      const itemObj = item as Record<string, unknown>;
      if (
        itemObj.frameWidth !== undefined ||
        itemObj.frameHeight !== undefined ||
        itemObj.startFrame !== undefined ||
        itemObj.endFrame !== undefined ||
        itemObj.margin !== undefined ||
        itemObj.spacing !== undefined
      ) {
        errors.push(`incompatible metadata for the selected resource kind: ${item.key}`);
      }
    } else if (item.resourceKind === 'spritesheet') {
      if (item.path !== null) {
        // Positive frame dimensions
        if (
          item.frameWidth <= 0 ||
          !Number.isFinite(item.frameWidth) ||
          item.frameHeight <= 0 ||
          !Number.isFinite(item.frameHeight)
        ) {
          errors.push(`spritesheets without positive frame dimensions: ${item.key}`);
        }

        // Invalid frame ranges
        let validRanges = true;
        if (item.startFrame !== undefined) {
          if (item.startFrame < 0 || !Number.isInteger(item.startFrame)) {
            errors.push(`invalid frame ranges: ${item.key}`);
            validRanges = false;
          }
        }
        if (item.endFrame !== undefined) {
          if (item.endFrame < 0 || !Number.isInteger(item.endFrame)) {
            errors.push(`invalid frame ranges: ${item.key}`);
            validRanges = false;
          }
        }
        if (
          validRanges &&
          item.startFrame !== undefined &&
          item.endFrame !== undefined &&
          item.startFrame > item.endFrame
        ) {
          errors.push(`invalid frame ranges: ${item.key}`);
        }

        // Invalid margin or spacing
        if (item.margin !== undefined) {
          if (item.margin < 0 || !Number.isInteger(item.margin)) {
            errors.push(`invalid margin or spacing: ${item.key}`);
          }
        }
        if (item.spacing !== undefined) {
          if (item.spacing < 0 || !Number.isInteger(item.spacing)) {
            errors.push(`invalid margin or spacing: ${item.key}`);
          }
        }
      }
    } else {
      errors.push(`invalid resource kind: ${item.key}`);
    }
  }
  return errors;
}
