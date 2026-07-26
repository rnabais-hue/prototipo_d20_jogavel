import Phaser from 'phaser';
import type { DebugCombatGridLayout } from '../debug/debugCombatGridProjection';
import { COMBAT_VISUAL_COLORS, COMBAT_ARENA_CONFIG } from './combatVisualConfig';
import { COMBAT_LAYER_DEPTHS } from './combatLayerDepths';
import { VISUAL_ASSET_KEYS } from './assetKeys';

const TILESET_NAME = 'combat-dungeon-tiles';
const TILEMAP_LAYER_NAMES = ['Ground', 'Boundary', 'Decoration'] as const;
const NATIVE_TILE_SIZE = 16;

export type CombatArenaView = {
  update: (layout: DebugCombatGridLayout, cols: number, rows: number) => void;
  setVisible: (visible: boolean) => void;
  destroy: () => void;
};

export function getCombatTileScale(cellSize: number): number {
  if (!Number.isFinite(cellSize) || cellSize <= 0) {
    throw new RangeError('Combat cell size must be a positive finite number');
  }

  const scale = cellSize / NATIVE_TILE_SIZE;
  if (!Number.isInteger(scale)) {
    throw new RangeError('Combat cell size must be an integer multiple of the native 16-pixel tile');
  }

  return scale;
}

export function createCombatArenaView(
  scene: Phaser.Scene,
  layout: DebugCombatGridLayout,
  cols: number,
  rows: number,
): CombatArenaView {
  const fallback = scene.add
    .graphics()
    .setDepth(COMBAT_LAYER_DEPTHS.arenaGround)
    .setScrollFactor(0);
  let map: Phaser.Tilemaps.Tilemap | null = null;
  let runtimeMaps: Phaser.Tilemaps.Tilemap[] = [];
  let layers: Phaser.Tilemaps.TilemapLayer[] = [];

  const createTilemapLayers = (): void => {
    if (
      map ||
      !scene.textures.exists(VISUAL_ASSET_KEYS.combatPixelTiles) ||
      !scene.make?.tilemap
    ) {
      return;
    }

    try {
      map = scene.make.tilemap({ key: VISUAL_ASSET_KEYS.combatArenaMap });
      const sourceLayers = TILEMAP_LAYER_NAMES.map((name) => map?.getLayer(name));
      if (sourceLayers.some((layer) => !layer)) {
        map.destroy();
        map = null;
        return;
      }

      layers = sourceLayers.flatMap((sourceLayer, index) => {
        const data = sourceLayer!.data.map((row) => row.map((tile) => tile.index));
        const runtimeMap = scene.make.tilemap({
          data,
          tileWidth: NATIVE_TILE_SIZE,
          tileHeight: NATIVE_TILE_SIZE,
        });
        const tileset = runtimeMap.addTilesetImage(
          TILESET_NAME,
          VISUAL_ASSET_KEYS.combatPixelTiles,
          NATIVE_TILE_SIZE,
          NATIVE_TILE_SIZE,
          0,
          0,
          1,
        );
        const layer = tileset ? runtimeMap.createLayer(0, tileset, 0, 0) : null;
        if (!layer) {
          runtimeMap.destroy();
          return [];
        }
        runtimeMaps.push(runtimeMap);
        layer
          .setDepth(COMBAT_LAYER_DEPTHS.arenaGround + index)
          .setScrollFactor(0);
        return [layer];
      });
    } catch {
      map = null;
      layers = [];
    }
  };

  const drawFallback = (l: DebugCombatGridLayout, c: number, r: number): void => {
    const totalWidth = c * l.cellSize;
    const totalHeight = r * l.cellSize;
    fallback.clear();
    fallback.fillStyle(COMBAT_VISUAL_COLORS.arenaDark, 1);
    fallback.fillRect(l.originX, l.originY, totalWidth, totalHeight);
    fallback
      .lineStyle(COMBAT_ARENA_CONFIG.borderThickness, COMBAT_VISUAL_COLORS.arenaBorder, 1)
      .strokeRect(l.originX, l.originY, totalWidth, totalHeight);
  };

  const drawArena = (l: DebugCombatGridLayout, c: number, r: number): void => {
    createTilemapLayers();

    if (layers.length === TILEMAP_LAYER_NAMES.length) {
      fallback.clear();
      const scale = getCombatTileScale(l.cellSize);
      const x = Math.round(l.originX - l.cellSize);
      const y = Math.round(l.originY - l.cellSize);
      layers.forEach((layer) => {
        layer.setPosition(x, y);
        layer.setScale(scale);
      });
      return;
    }

    drawFallback(l, c, r);
  };

  drawArena(layout, cols, rows);

  return {
    update: drawArena,
    setVisible(visible) {
      fallback.setVisible(visible);
      layers.forEach((layer) => layer.setVisible(visible));
    },
    destroy() {
      fallback.destroy();
      layers.forEach((layer) => layer.destroy());
      layers = [];
      runtimeMaps.forEach((runtimeMap) => runtimeMap.destroy());
      runtimeMaps = [];
      map?.destroy();
      map = null;
    },
  };
}
