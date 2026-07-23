import Phaser from 'phaser';
import { gridToWorld, type GridCell } from '../../movement/grid';
import { DEBUG_EXPLORATION_GRID } from './debugExplorationConfig';

export function drawDebugPathPreview(
  graphics: Phaser.GameObjects.Graphics,
  path: readonly GridCell[],
): void {
  graphics.clear();

  for (const cell of path) {
    drawPathPreviewCell(graphics, cell);
  }
}

export function clearDebugPathPreview(
  graphics: Phaser.GameObjects.Graphics,
): void {
  graphics.clear();
}

function drawPathPreviewCell(
  graphics: Phaser.GameObjects.Graphics,
  cell: GridCell,
): void {
  const cellCenter = gridToWorld(cell, DEBUG_EXPLORATION_GRID.cellSize);
  const centerX = DEBUG_EXPLORATION_GRID.originX + cellCenter.x;
  const centerY = DEBUG_EXPLORATION_GRID.originY + cellCenter.y;
  const markerRadius = DEBUG_EXPLORATION_GRID.cellSize * 0.12;

  graphics.fillStyle(0xd8b4ff, 0.72);
  graphics.fillCircle(centerX, centerY, markerRadius);
  graphics.lineStyle(2, 0xb983ff, 0.9);
  graphics.strokeCircle(centerX, centerY, markerRadius + 2);
}

