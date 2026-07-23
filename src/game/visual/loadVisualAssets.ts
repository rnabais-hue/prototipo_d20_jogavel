import Phaser from 'phaser';
import { VISUAL_ASSET_CATALOG, type VisualAssetCatalogEntry } from './assetCatalog';
import type { VisualAssetKey } from './assetKeys';

export function queueVisualAssets(
  scene: Phaser.Scene,
  catalog: Readonly<Record<VisualAssetKey, VisualAssetCatalogEntry>> = VISUAL_ASSET_CATALOG,
): readonly VisualAssetKey[] {
  const queued: VisualAssetKey[] = [];
  const seenKeys = new Set<string>();

  for (const item of Object.values(catalog)) {
    if (!item.loadByDefault || item.path === null) continue;
    if (seenKeys.has(item.key)) continue;
    seenKeys.add(item.key);

    if (item.resourceKind === 'image') {
      scene.load.image(item.key, item.path);
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

      scene.load.spritesheet(item.key, item.path, config);
      queued.push(item.key);
    }
  }
  return queued;
}
