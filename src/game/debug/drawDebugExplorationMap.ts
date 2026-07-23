import Phaser from 'phaser';
import type { ExplorationMap } from '../../exploration/explorationMap';
import type { GridCell } from '../../movement/grid';
import { DEBUG_EXPLORATION_GRID } from './debugExplorationConfig';

export function drawDebugExplorationMap(
  scene: Phaser.Scene,
  map: ExplorationMap,
): Phaser.GameObjects.Graphics {
  const graphics = scene.add.graphics();

  redrawDebugExplorationMap(graphics, map);

  return graphics;
}

export function redrawDebugExplorationMap(
  graphics: Phaser.GameObjects.Graphics,
  map: ExplorationMap,
): void {
  const gridWidth = DEBUG_EXPLORATION_GRID.width * DEBUG_EXPLORATION_GRID.cellSize;
  const gridHeight = DEBUG_EXPLORATION_GRID.height * DEBUG_EXPLORATION_GRID.cellSize;

  graphics.clear();
  graphics.fillStyle(0x14181f, 1);
  graphics.fillRect(
    DEBUG_EXPLORATION_GRID.originX - 12,
    DEBUG_EXPLORATION_GRID.originY - 12,
    gridWidth + 24,
    gridHeight + 24,
  );

  for (let y = 0; y < DEBUG_EXPLORATION_GRID.height; y += 1) {
    for (let x = 0; x < DEBUG_EXPLORATION_GRID.width; x += 1) {
      const worldX = DEBUG_EXPLORATION_GRID.originX + x * DEBUG_EXPLORATION_GRID.cellSize;
      const worldY = DEBUG_EXPLORATION_GRID.originY + y * DEBUG_EXPLORATION_GRID.cellSize;
      const isAccentCell = (x + y) % 5 === 0;

      graphics.fillStyle(isAccentCell ? 0x263246 : 0x202838, 1);
      graphics.fillRect(
        worldX + 1,
        worldY + 1,
        DEBUG_EXPLORATION_GRID.cellSize - 2,
        DEBUG_EXPLORATION_GRID.cellSize - 2,
      );
    }
  }

  drawBlockedCells(graphics, map.blockedCells);

  graphics.lineStyle(1, 0x3c4c63, 1);

  for (let x = 0; x <= DEBUG_EXPLORATION_GRID.width; x += 1) {
    const worldX = DEBUG_EXPLORATION_GRID.originX + x * DEBUG_EXPLORATION_GRID.cellSize;
    graphics.lineBetween(
      worldX,
      DEBUG_EXPLORATION_GRID.originY,
      worldX,
      DEBUG_EXPLORATION_GRID.originY + gridHeight,
    );
  }

  for (let y = 0; y <= DEBUG_EXPLORATION_GRID.height; y += 1) {
    const worldY = DEBUG_EXPLORATION_GRID.originY + y * DEBUG_EXPLORATION_GRID.cellSize;
    graphics.lineBetween(
      DEBUG_EXPLORATION_GRID.originX,
      worldY,
      DEBUG_EXPLORATION_GRID.originX + gridWidth,
      worldY,
    );
  }

  graphics.lineStyle(2, 0x8aa8d6, 1);
  graphics.strokeRect(
    DEBUG_EXPLORATION_GRID.originX,
    DEBUG_EXPLORATION_GRID.originY,
    gridWidth,
    gridHeight,
  );
}

function drawBlockedCells(
  graphics: Phaser.GameObjects.Graphics,
  blockedCells: readonly GridCell[],
): void {
  for (const cell of blockedCells) {
    const worldX = DEBUG_EXPLORATION_GRID.originX + cell.x * DEBUG_EXPLORATION_GRID.cellSize;
    const worldY = DEBUG_EXPLORATION_GRID.originY + cell.y * DEBUG_EXPLORATION_GRID.cellSize;
    const inset = 6;
    const size = DEBUG_EXPLORATION_GRID.cellSize - inset * 2;

    graphics.fillStyle(0x5a2b38, 1);
    graphics.fillRect(
      worldX + 1,
      worldY + 1,
      DEBUG_EXPLORATION_GRID.cellSize - 2,
      DEBUG_EXPLORATION_GRID.cellSize - 2,
    );
    graphics.lineStyle(2, 0xff8a8a, 1);
    graphics.strokeRect(worldX + inset, worldY + inset, size, size);
    graphics.lineBetween(worldX + inset, worldY + inset, worldX + inset + size, worldY + inset + size);
    graphics.lineBetween(worldX + inset + size, worldY + inset, worldX + inset, worldY + inset + size);
  }
}
