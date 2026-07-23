import Phaser from 'phaser';
import type { ExplorationMap } from '../../exploration/explorationMap';
import type { GridCell } from '../../movement/grid';
import { DEBUG_EXPLORATION_GRID } from '../debug/debugExplorationConfig';
import { EXPLORATION_VISUAL_COLORS, EXPLORATION_DEPTHS } from './explorationVisualConfig';
import { getVisualAssetEntry } from './assetCatalog';
import { resolveVisualAsset } from './assetAvailability';
import { VISUAL_ASSET_KEYS } from './assetKeys';

export type ExplorationMapView = Phaser.GameObjects.Graphics | Phaser.GameObjects.Container;

export function drawExplorationMap(
  scene: Phaser.Scene,
  map: ExplorationMap,
): ExplorationMapView {
  const groundEntry = getVisualAssetEntry(VISUAL_ASSET_KEYS.explorationGround);
  const groundRes = resolveVisualAsset(groundEntry, (k) => scene.textures.exists(k));

  const wallEntry = getVisualAssetEntry(VISUAL_ASSET_KEYS.wallObstacle);
  const wallRes = resolveVisualAsset(wallEntry, (k) => scene.textures.exists(k));

  if (groundRes.mode === 'texture' || wallRes.mode === 'texture') {
    const container = scene.add.container(0, 0);
    container.setDepth(EXPLORATION_DEPTHS.terrain);
    rebuildExplorationMapContainer(container, map);
    return container;
  } else {
    const graphics = scene.add.graphics();
    graphics.setDepth(EXPLORATION_DEPTHS.terrain);
    redrawExplorationMapGraphics(graphics, map);
    return graphics;
  }
}

export function redrawExplorationMap(
  view: ExplorationMapView,
  map: ExplorationMap,
): void {
  if (view instanceof Phaser.GameObjects.Container) {
    rebuildExplorationMapContainer(view, map);
  } else {
    redrawExplorationMapGraphics(view, map);
  }
}

function rebuildExplorationMapContainer(
  container: Phaser.GameObjects.Container,
  map: ExplorationMap,
): void {
  container.removeAll(true);
  const scene = container.scene;
  const cellSize = DEBUG_EXPLORATION_GRID.cellSize;
  const gridWidth = DEBUG_EXPLORATION_GRID.width * cellSize;
  const gridHeight = DEBUG_EXPLORATION_GRID.height * cellSize;

  // Background panel representation in container mode
  const bg = scene.add.graphics();
  bg.fillStyle(EXPLORATION_VISUAL_COLORS.charcoal, 1);
  bg.fillRect(
    DEBUG_EXPLORATION_GRID.originX - 12,
    DEBUG_EXPLORATION_GRID.originY - 12,
    gridWidth + 24,
    gridHeight + 24,
  );
  container.add(bg);

  const groundEntry = getVisualAssetEntry(VISUAL_ASSET_KEYS.explorationGround);
  const groundRes = resolveVisualAsset(groundEntry, (k) => scene.textures.exists(k));

  // Draw ground tiles
  for (let y = 0; y < DEBUG_EXPLORATION_GRID.height; y += 1) {
    for (let x = 0; x < DEBUG_EXPLORATION_GRID.width; x += 1) {
      const worldX = DEBUG_EXPLORATION_GRID.originX + x * cellSize + cellSize / 2;
      const worldY = DEBUG_EXPLORATION_GRID.originY + y * cellSize + cellSize / 2;

      if (groundRes.mode === 'texture') {
        const img = scene.add.image(worldX, worldY, groundEntry.key);
        img.setDisplaySize(cellSize, cellSize);
        container.add(img);
      } else {
        const isAccentCell = (x + y) % 2 === 0;
        const tileGraphics = scene.add.graphics();
        tileGraphics.fillStyle(
          isAccentCell ? EXPLORATION_VISUAL_COLORS.groundBase : EXPLORATION_VISUAL_COLORS.groundAccent,
          1,
        );
        tileGraphics.fillRect(worldX - cellSize / 2, worldY - cellSize / 2, cellSize, cellSize);
        container.add(tileGraphics);
      }
    }
  }

  const wallEntry = getVisualAssetEntry(VISUAL_ASSET_KEYS.wallObstacle);
  const wallRes = resolveVisualAsset(wallEntry, (k) => scene.textures.exists(k));

  // Draw walls
  for (const cell of map.blockedCells) {
    const worldX = DEBUG_EXPLORATION_GRID.originX + cell.x * cellSize + cellSize / 2;
    const worldY = DEBUG_EXPLORATION_GRID.originY + cell.y * cellSize + cellSize / 2;

    if (wallRes.mode === 'texture') {
      const img = scene.add.image(worldX, worldY, wallEntry.key);
      img.setDisplaySize(cellSize, cellSize);
      container.add(img);
    } else {
      const wallGraphics = scene.add.graphics();
      drawSingleWallGraphic(wallGraphics, worldX - cellSize / 2, worldY - cellSize / 2, cellSize);
      container.add(wallGraphics);
    }
  }

  // Draw grid borders/lines in container mode
  const gridOverlay = scene.add.graphics();
  gridOverlay.lineStyle(1, EXPLORATION_VISUAL_COLORS.slate, 0.4);
  for (let x = 0; x <= DEBUG_EXPLORATION_GRID.width; x += 1) {
    const worldX = DEBUG_EXPLORATION_GRID.originX + x * cellSize;
    gridOverlay.lineBetween(worldX, DEBUG_EXPLORATION_GRID.originY, worldX, DEBUG_EXPLORATION_GRID.originY + gridHeight);
  }
  for (let y = 0; y <= DEBUG_EXPLORATION_GRID.height; y += 1) {
    const worldY = DEBUG_EXPLORATION_GRID.originY + y * cellSize;
    gridOverlay.lineBetween(DEBUG_EXPLORATION_GRID.originX, worldY, DEBUG_EXPLORATION_GRID.originX + gridWidth, worldY);
  }
  gridOverlay.lineStyle(3, EXPLORATION_VISUAL_COLORS.slate, 1);
  gridOverlay.strokeRect(DEBUG_EXPLORATION_GRID.originX, DEBUG_EXPLORATION_GRID.originY, gridWidth, gridHeight);
  container.add(gridOverlay);
}

function redrawExplorationMapGraphics(
  graphics: Phaser.GameObjects.Graphics,
  map: ExplorationMap,
): void {
  const gridWidth = DEBUG_EXPLORATION_GRID.width * DEBUG_EXPLORATION_GRID.cellSize;
  const gridHeight = DEBUG_EXPLORATION_GRID.height * DEBUG_EXPLORATION_GRID.cellSize;
  const cellSize = DEBUG_EXPLORATION_GRID.cellSize;

  graphics.clear();

  // Draw background panel
  graphics.fillStyle(EXPLORATION_VISUAL_COLORS.charcoal, 1);
  graphics.fillRect(
    DEBUG_EXPLORATION_GRID.originX - 12,
    DEBUG_EXPLORATION_GRID.originY - 12,
    gridWidth + 24,
    gridHeight + 24,
  );

  // Draw checkered tiles
  for (let y = 0; y < DEBUG_EXPLORATION_GRID.height; y += 1) {
    for (let x = 0; x < DEBUG_EXPLORATION_GRID.width; x += 1) {
      const worldX = DEBUG_EXPLORATION_GRID.originX + x * cellSize;
      const worldY = DEBUG_EXPLORATION_GRID.originY + y * cellSize;
      const isAccentCell = (x + y) % 2 === 0;

      // Draw tile background
      graphics.fillStyle(
        isAccentCell ? EXPLORATION_VISUAL_COLORS.groundBase : EXPLORATION_VISUAL_COLORS.groundAccent,
        1,
      );
      graphics.fillRect(worldX, worldY, cellSize, cellSize);

      // Subtle detail lines inside ground tiles for organic texture
      graphics.lineStyle(1, EXPLORATION_VISUAL_COLORS.charcoal, 0.15);
      graphics.strokeRect(worldX, worldY, cellSize, cellSize);

      // Occasional tiny grass/moss blades for flavor
      if ((x * 3 + y * 7) % 11 === 0) {
        graphics.lineStyle(1, EXPLORATION_VISUAL_COLORS.moss, 0.4);
        graphics.lineBetween(worldX + 6, worldY + cellSize - 8, worldX + 8, worldY + cellSize - 14);
        graphics.lineBetween(worldX + 8, worldY + cellSize - 14, worldX + 11, worldY + cellSize - 7);
      }
      if ((x * 5 + y * 13) % 17 === 0) {
        graphics.lineStyle(1, EXPLORATION_VISUAL_COLORS.moss, 0.4);
        graphics.lineBetween(worldX + cellSize - 10, worldY + 12, worldX + cellSize - 8, worldY + 6);
        graphics.lineBetween(worldX + cellSize - 8, worldY + 6, worldX + cellSize - 5, worldY + 13);
      }
    }
  }

  // Draw walls
  for (const cell of map.blockedCells) {
    const worldX = DEBUG_EXPLORATION_GRID.originX + cell.x * cellSize;
    const worldY = DEBUG_EXPLORATION_GRID.originY + cell.y * cellSize;
    drawSingleWallGraphic(graphics, worldX, worldY, cellSize);
  }

  // Draw grid lines
  graphics.lineStyle(1, EXPLORATION_VISUAL_COLORS.slate, 0.4);
  for (let x = 0; x <= DEBUG_EXPLORATION_GRID.width; x += 1) {
    const worldX = DEBUG_EXPLORATION_GRID.originX + x * cellSize;
    graphics.lineBetween(
      worldX,
      DEBUG_EXPLORATION_GRID.originY,
      worldX,
      DEBUG_EXPLORATION_GRID.originY + gridHeight,
    );
  }

  for (let y = 0; y <= DEBUG_EXPLORATION_GRID.height; y += 1) {
    const worldY = DEBUG_EXPLORATION_GRID.originY + y * cellSize;
    graphics.lineBetween(
      DEBUG_EXPLORATION_GRID.originX,
      worldY,
      DEBUG_EXPLORATION_GRID.originX + gridWidth,
      worldY,
    );
  }

  // Map outer border frame
  graphics.lineStyle(3, EXPLORATION_VISUAL_COLORS.slate, 1);
  graphics.strokeRect(
    DEBUG_EXPLORATION_GRID.originX,
    DEBUG_EXPLORATION_GRID.originY,
    gridWidth,
    gridHeight,
  );
}

function drawSingleWallGraphic(
  graphics: Phaser.GameObjects.Graphics,
  worldX: number,
  worldY: number,
  cellSize: number,
): void {
  // Draw main wall fill
  graphics.fillStyle(EXPLORATION_VISUAL_COLORS.wallBase, 1);
  graphics.fillRect(worldX, worldY, cellSize, cellSize);

  // Brick mortar lines (running bond pattern in 32x32 size)
  graphics.lineStyle(1, EXPLORATION_VISUAL_COLORS.wallMortar, 1);
  graphics.lineBetween(worldX, worldY + 16, worldX + cellSize, worldY + 16); // Horizontal middle splitter
  graphics.lineBetween(worldX + 16, worldY, worldX + 16, worldY + 16);       // Top vertical splitter
  graphics.lineBetween(worldX + 8, worldY + 16, worldX + 8, worldY + cellSize); // Bottom left vertical splitter
  graphics.lineBetween(worldX + 24, worldY + 16, worldX + 24, worldY + cellSize); // Bottom right vertical splitter

  // Brick highlights (light beveled edges)
  graphics.lineStyle(1, EXPLORATION_VISUAL_COLORS.wallHighlight, 0.85);
  // Brick 1 (Top-Left)
  graphics.lineBetween(worldX + 1, worldY + 1, worldX + 15, worldY + 1);
  graphics.lineBetween(worldX + 1, worldY + 1, worldX + 1, worldY + 15);
  // Brick 2 (Top-Right)
  graphics.lineBetween(worldX + 17, worldY + 1, worldX + cellSize - 1, worldY + 1);
  graphics.lineBetween(worldX + 17, worldY + 1, worldX + 17, worldY + 15);
  // Brick 3 (Bottom-Left partial)
  graphics.lineBetween(worldX + 1, worldY + 17, worldX + 7, worldY + 17);
  graphics.lineBetween(worldX + 1, worldY + 17, worldX + 1, worldY + cellSize - 1);
  // Brick 4 (Bottom-Middle)
  graphics.lineBetween(worldX + 9, worldY + 17, worldX + 23, worldY + 17);
  graphics.lineBetween(worldX + 9, worldY + 17, worldX + 9, worldY + cellSize - 1);
  // Brick 5 (Bottom-Right partial)
  graphics.lineBetween(worldX + 25, worldY + 17, worldX + cellSize - 1, worldY + 17);
  graphics.lineBetween(worldX + 25, worldY + 17, worldX + 25, worldY + cellSize - 1);

  // Brick shadows (dark cast edges)
  graphics.lineStyle(1, EXPLORATION_VISUAL_COLORS.wallShadow, 0.95);
  // Top-Left brick shadows
  graphics.lineBetween(worldX + 15, worldY + 2, worldX + 15, worldY + 15);
  graphics.lineBetween(worldX + 2, worldY + 15, worldX + 15, worldY + 15);
  // Top-Right brick shadows
  graphics.lineBetween(worldX + cellSize - 1, worldY + 2, worldX + cellSize - 1, worldY + 15);
  graphics.lineBetween(worldX + 18, worldY + 15, worldX + cellSize - 1, worldY + 15);
  // Bottom-Middle brick shadows
  graphics.lineBetween(worldX + 23, worldY + 18, worldX + 23, worldY + cellSize - 1);
  graphics.lineBetween(worldX + 10, worldY + cellSize - 1, worldX + 23, worldY + cellSize - 1);

  // Outer border for wall block to separate it from ground/grid
  graphics.lineStyle(1, EXPLORATION_VISUAL_COLORS.charcoal, 1);
  graphics.strokeRect(worldX, worldY, cellSize, cellSize);
}
