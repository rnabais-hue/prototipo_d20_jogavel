import Phaser from 'phaser';
import type { DebugCombatGridLayout } from '../debug/debugCombatGridProjection';
import {
  COMBAT_VISUAL_COLORS,
  COMBAT_ARENA_CONFIG,
} from './combatVisualConfig';
import { COMBAT_LAYER_DEPTHS } from './combatLayerDepths';
import { VISUAL_ASSET_KEYS } from './assetKeys';
import { getVisualAssetEntry } from './assetCatalog';
import { resolveVisualAsset } from './assetAvailability';

export type CombatArenaView = {
  // Redraw the arena ground to match a (possibly resized) layout.
  update: (layout: DebugCombatGridLayout, cols: number, rows: number) => void;
  setVisible: (visible: boolean) => void;
  destroy: () => void;
};

export function getCombatGroundTileScale(
  textureWidth: number,
  textureHeight: number,
  cellSize: number,
): Readonly<{ x: number; y: number }> {
  if (
    !Number.isFinite(textureWidth) || textureWidth <= 0 ||
    !Number.isFinite(textureHeight) || textureHeight <= 0 ||
    !Number.isFinite(cellSize) || cellSize <= 0
  ) {
    throw new RangeError('Texture dimensions and cell size must be positive finite numbers');
  }

  return Object.freeze({
    x: cellSize / textureWidth,
    y: cellSize / textureHeight,
  });
}

// Create the combat arena ground view.
export function createCombatArenaView(
  scene: Phaser.Scene,
  layout: DebugCombatGridLayout,
  cols: number,
  rows: number,
): CombatArenaView {
  const ground = scene.add
    .graphics()
    .setDepth(COMBAT_LAYER_DEPTHS.arenaGround)
    .setScrollFactor(0);

  let bgImage: Phaser.GameObjects.TileSprite | null = null;

  const drawArena = (l: DebugCombatGridLayout, c: number, r: number): void => {
    const entry = getVisualAssetEntry(VISUAL_ASSET_KEYS.combatGround);
    const resolution = resolveVisualAsset(entry, (key) => scene.textures.exists(key));

    const totalWidth = c * l.cellSize;
    const totalHeight = r * l.cellSize;

    if (resolution.mode === 'texture') {
      ground.clear();
      if (!bgImage) {
        bgImage = scene.add.tileSprite(l.originX, l.originY, totalWidth, totalHeight, entry.key)
          .setOrigin(0, 0)
          .setDepth(COMBAT_LAYER_DEPTHS.arenaGround)
          .setScrollFactor(0);
      } else {
        bgImage.setPosition(l.originX, l.originY);
        bgImage.setSize(totalWidth, totalHeight);
      }

      const sourceImage = scene.textures.get(entry.key).getSourceImage();
      const tileScale = getCombatGroundTileScale(sourceImage.width, sourceImage.height, l.cellSize);
      bgImage.setTileScale(tileScale.x, tileScale.y);
    } else {
      if (bgImage) {
        bgImage.destroy();
        bgImage = null;
      }

      ground.clear();

      // Stone floor base fill
      ground.fillStyle(COMBAT_VISUAL_COLORS.arenaDark, 1);
      ground.fillRect(l.originX, l.originY, totalWidth, totalHeight);

      // Subtle alternating cell accent
      ground.fillStyle(COMBAT_VISUAL_COLORS.arenaStoneAccent, COMBAT_ARENA_CONFIG.stoneAccentAlpha);
      for (let gy = 0; gy < r; gy += 1) {
        for (let gx = 0; gx < c; gx += 1) {
          if ((gx + gy) % 2 === 0) {
            const px = l.originX + gx * l.cellSize;
            const py = l.originY + gy * l.cellSize;
            ground.fillRect(px + 1, py + 1, l.cellSize - 2, l.cellSize - 2);
          }
        }
      }

      // Arena border frame
      ground
        .lineStyle(COMBAT_ARENA_CONFIG.borderThickness, COMBAT_VISUAL_COLORS.arenaBorder, 1)
        .strokeRect(l.originX, l.originY, totalWidth, totalHeight);
    }
  };

  drawArena(layout, cols, rows);

  return {
    update(l, c, r) {
      drawArena(l, c, r);
    },
    setVisible(visible) {
      ground.setVisible(visible);
      if (bgImage) bgImage.setVisible(visible);
    },
    destroy() {
      ground.destroy();
      if (bgImage) bgImage.destroy();
    },
  };
}
