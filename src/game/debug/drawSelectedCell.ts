import Phaser from 'phaser';
import { gridToWorld, type GridCell } from '../../movement/grid';
import { DEBUG_EXPLORATION_GRID } from './debugExplorationConfig';

export function drawSelectedCell(
  graphics: Phaser.GameObjects.Graphics,
  cell: GridCell,
): void {
  const cellCenter = gridToWorld(cell, DEBUG_EXPLORATION_GRID.cellSize);
  const highlightSize = DEBUG_EXPLORATION_GRID.cellSize - 4;
  const highlightX = DEBUG_EXPLORATION_GRID.originX + cellCenter.x - highlightSize / 2;
  const highlightY = DEBUG_EXPLORATION_GRID.originY + cellCenter.y - highlightSize / 2;

  graphics.clear();
  graphics.fillStyle(0xf2c14e, 0.18);
  graphics.fillRect(highlightX, highlightY, highlightSize, highlightSize);
  graphics.lineStyle(3, 0xffd166, 1);
  graphics.strokeRect(highlightX, highlightY, highlightSize, highlightSize);
}

export function drawTargetCell(
  graphics: Phaser.GameObjects.Graphics,
  cell: GridCell,
): void {
  const cellCenter = gridToWorld(cell, DEBUG_EXPLORATION_GRID.cellSize);
  const targetSize = DEBUG_EXPLORATION_GRID.cellSize - 12;
  const targetX = DEBUG_EXPLORATION_GRID.originX + cellCenter.x - targetSize / 2;
  const targetY = DEBUG_EXPLORATION_GRID.originY + cellCenter.y - targetSize / 2;
  const centerX = DEBUG_EXPLORATION_GRID.originX + cellCenter.x;
  const centerY = DEBUG_EXPLORATION_GRID.originY + cellCenter.y;

  graphics.clear();
  graphics.fillStyle(0x79d49c, 0.18);
  graphics.fillRect(targetX, targetY, targetSize, targetSize);
  graphics.lineStyle(3, 0x7ee2a8, 1);
  graphics.strokeRect(targetX, targetY, targetSize, targetSize);
  graphics.lineBetween(centerX - 6, centerY, centerX + 6, centerY);
  graphics.lineBetween(centerX, centerY - 6, centerX, centerY + 6);
}

export function clearSelectedCell(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
}
