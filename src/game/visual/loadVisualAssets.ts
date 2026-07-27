import Phaser from 'phaser';
import { VISUAL_ASSET_CATALOG, type VisualAssetCatalogEntry } from './assetCatalog';
import type { VisualAssetKey } from './assetKeys';
import {
  getRequestedCombatAppearanceId,
  resolveCombatAppearanceLayers,
  resolveCombatAppearanceProfile,
  type CombatAppearanceRole,
} from './combatAppearanceProfiles';

export function resolveVisualAssetPath(
  path: string,
  baseUrl: string = import.meta.env.BASE_URL,
): string {
  if (!path.startsWith('/assets/') || baseUrl === '/') return path;

  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBaseUrl}${path.slice(1)}`;
}

export function queueVisualAssets(
  scene: Phaser.Scene,
  catalog: Readonly<Record<VisualAssetKey, VisualAssetCatalogEntry>> = VISUAL_ASSET_CATALOG,
): readonly VisualAssetKey[] {
  const queued: VisualAssetKey[] = [];
  const seenKeys = new Set<string>();
  const runtimeProfileKeys = catalog === VISUAL_ASSET_CATALOG
    ? getRuntimeCombatProfileAssetKeys()
    : new Set<VisualAssetKey>();

  for (const item of Object.values(catalog)) {
    if ((!item.loadByDefault && !runtimeProfileKeys.has(item.key)) || item.path === null) continue;
    if (seenKeys.has(item.key)) continue;
    seenKeys.add(item.key);
    const resolvedPath = resolveVisualAssetPath(item.path);

    if (item.resourceKind === 'image') {
      scene.load.image(item.key, resolvedPath);
      queued.push(item.key);
    } else if (item.resourceKind === 'tilemap-tiled-json') {
      scene.load.tilemapTiledJSON(item.key, resolvedPath);
      queued.push(item.key);
    } else if (item.resourceKind === 'spritesheet') {
      // Validate metadata explicitly before calling scene.load.spritesheet
      // to avoid converting invalid arguments into silent Phaser defaults.
      if (item.frameWidth <= 0 || item.frameHeight <= 0 || !Number.isFinite(item.frameWidth) || !Number.isFinite(item.frameHeight)) {
        throw new Error(`Invalid frame dimensions for spritesheet: ${item.key}`);
      }

      const config: Phaser.Types.Loader.FileTypes.ImageFrameConfig = {
        frameWidth: item.frameWidth,
        frameHeight: item.frameHeight,
      };

      if (item.startFrame !== undefined) {
        config.startFrame = item.startFrame;
      }
      if (item.endFrame !== undefined) {
        config.endFrame = item.endFrame;
      }
      if (item.margin !== undefined) {
        config.margin = item.margin;
      }
      if (item.spacing !== undefined) {
        config.spacing = item.spacing;
      }

      scene.load.spritesheet(item.key, resolvedPath, config);
      queued.push(item.key);
    }
  }
  return queued;
}

function getRuntimeCombatProfileAssetKeys(): ReadonlySet<VisualAssetKey> {
  const search = typeof window === 'undefined' ? '' : window.location.search;
  const keys = new Set<VisualAssetKey>();
  for (const role of ['player', 'enemy'] satisfies readonly CombatAppearanceRole[]) {
    const profile = resolveCombatAppearanceProfile(
      role,
      getRequestedCombatAppearanceId(search, role),
    );
    for (const layer of resolveCombatAppearanceLayers(profile)) {
      keys.add(layer.textureKey);
    }
  }
  return keys;
}
