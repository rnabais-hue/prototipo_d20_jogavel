import Phaser from 'phaser';
import type { ExplorationMap } from '../../exploration/explorationMap';
import { getReachableOrthogonalCells } from '../../exploration/orthogonalPathfinding';
import { gridToWorld, type GridCell } from '../../movement/grid';
import { DEBUG_EXPLORATION_GRID } from '../debug/debugExplorationConfig';
import { EXPLORATION_VISUAL_COLORS, EXPLORATION_DEPTHS } from './explorationVisualConfig';

// -------------------------------------------------------------
// Selected and Target Cells
// -------------------------------------------------------------

export function drawExplorationSelectedCell(
  graphics: Phaser.GameObjects.Graphics,
  cell: GridCell,
): void {
  const cellCenter = gridToWorld(cell, DEBUG_EXPLORATION_GRID.cellSize);
  const size = DEBUG_EXPLORATION_GRID.cellSize;
  const x = DEBUG_EXPLORATION_GRID.originX + cellCenter.x - size / 2;
  const y = DEBUG_EXPLORATION_GRID.originY + cellCenter.y - size / 2;

  graphics.clear();
  graphics.setDepth(EXPLORATION_DEPTHS.overlays);

  // Soft fill inside selected cell
  graphics.fillStyle(EXPLORATION_VISUAL_COLORS.selectedFill, 0.08);
  graphics.fillRect(x + 1, y + 1, size - 2, size - 2);

  // Premium Corner Brackets (gold)
  graphics.lineStyle(2, EXPLORATION_VISUAL_COLORS.selectedStroke, 1.0);
  const len = 6;

  // Top-Left corner
  graphics.lineBetween(x + 1, y + 1, x + 1 + len, y + 1);
  graphics.lineBetween(x + 1, y + 1, x + 1, y + 1 + len);
  // Top-Right corner
  graphics.lineBetween(x + size - 1, y + 1, x + size - 1 - len, y + 1);
  graphics.lineBetween(x + size - 1, y + 1, x + size - 1, y + 1 + len);
  // Bottom-Left corner
  graphics.lineBetween(x + 1, y + size - 1, x + 1 + len, y + size - 1);
  graphics.lineBetween(x + 1, y + size - 1, x + 1, y + size - 1 - len);
  // Bottom-Right corner
  graphics.lineBetween(x + size - 1, y + size - 1, x + size - 1 - len, y + size - 1);
  graphics.lineBetween(x + size - 1, y + size - 1, x + size - 1, y + size - 1 - len);
}

export function drawExplorationTargetCell(
  graphics: Phaser.GameObjects.Graphics,
  cell: GridCell,
): void {
  const cellCenter = gridToWorld(cell, DEBUG_EXPLORATION_GRID.cellSize);
  const size = DEBUG_EXPLORATION_GRID.cellSize;
  const x = DEBUG_EXPLORATION_GRID.originX + cellCenter.x - size / 2;
  const y = DEBUG_EXPLORATION_GRID.originY + cellCenter.y - size / 2;
  const centerX = DEBUG_EXPLORATION_GRID.originX + cellCenter.x;
  const centerY = DEBUG_EXPLORATION_GRID.originY + cellCenter.y;

  graphics.clear();
  graphics.setDepth(EXPLORATION_DEPTHS.overlays + 1);

  // Soft fill inside target cell
  graphics.fillStyle(EXPLORATION_VISUAL_COLORS.targetFill, 0.08);
  graphics.fillRect(x + 2, y + 2, size - 4, size - 4);

  // Clean target frame
  graphics.lineStyle(2, EXPLORATION_VISUAL_COLORS.targetStroke, 0.85);
  graphics.strokeRect(x + 2, y + 2, size - 4, size - 4);

  // Crosshair lines
  graphics.lineStyle(1.5, EXPLORATION_VISUAL_COLORS.targetStroke, 1.0);
  graphics.lineBetween(centerX - 6, centerY, centerX + 6, centerY);
  graphics.lineBetween(centerX, centerY - 6, centerX, centerY + 6);
}

export function clearExplorationSelectedCell(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
}

// -------------------------------------------------------------
// Reachable Zone
// -------------------------------------------------------------

export function drawExplorationMoveDestinations(
  graphics: Phaser.GameObjects.Graphics,
  map: ExplorationMap,
  actorCell: GridCell,
  range: number,
): void {
  graphics.clear();
  graphics.setDepth(EXPLORATION_DEPTHS.overlays - 2);

  for (const cell of getReachableOrthogonalCells(map, actorCell, range)) {
    drawMoveDestinationCell(graphics, cell);
  }
}

function drawMoveDestinationCell(
  graphics: Phaser.GameObjects.Graphics,
  cell: GridCell,
): void {
  const worldX = DEBUG_EXPLORATION_GRID.originX + cell.x * DEBUG_EXPLORATION_GRID.cellSize;
  const worldY = DEBUG_EXPLORATION_GRID.originY + cell.y * DEBUG_EXPLORATION_GRID.cellSize;
  const size = DEBUG_EXPLORATION_GRID.cellSize;

  // Draw a beautiful soft cyan tile highlight with slightly inset border
  graphics.fillStyle(EXPLORATION_VISUAL_COLORS.reachableFill, 0.06);
  graphics.fillRect(worldX + 2, worldY + 2, size - 4, size - 4);

  // Thin, semi-transparent dashed/dotted-style corners for readability
  graphics.lineStyle(1, EXPLORATION_VISUAL_COLORS.reachableStroke, 0.35);
  graphics.strokeRect(worldX + 2, worldY + 2, size - 4, size - 4);
}

// -------------------------------------------------------------
// Path Preview
// -------------------------------------------------------------

export function drawExplorationPathPreview(
  graphics: Phaser.GameObjects.Graphics,
  path: readonly GridCell[],
): void {
  graphics.clear();
  graphics.setDepth(EXPLORATION_DEPTHS.overlays - 1);

  if (path.length === 0) return;

  // 1. Draw connecting path line
  graphics.lineStyle(1.5, EXPLORATION_VISUAL_COLORS.pathStroke, 0.6);
  graphics.beginPath();

  const startCenter = gridToWorld(path[0], DEBUG_EXPLORATION_GRID.cellSize);
  graphics.moveTo(
    DEBUG_EXPLORATION_GRID.originX + startCenter.x,
    DEBUG_EXPLORATION_GRID.originY + startCenter.y,
  );

  for (let i = 1; i < path.length; i += 1) {
    const center = gridToWorld(path[i], DEBUG_EXPLORATION_GRID.cellSize);
    graphics.lineTo(
      DEBUG_EXPLORATION_GRID.originX + center.x,
      DEBUG_EXPLORATION_GRID.originY + center.y,
    );
  }
  graphics.strokePath();

  // 2. Draw path nodes/dots
  for (const cell of path) {
    const cellCenter = gridToWorld(cell, DEBUG_EXPLORATION_GRID.cellSize);
    const centerX = DEBUG_EXPLORATION_GRID.originX + cellCenter.x;
    const centerY = DEBUG_EXPLORATION_GRID.originY + cellCenter.y;
    const markerRadius = DEBUG_EXPLORATION_GRID.cellSize * 0.1; // ~3.2px

    // Glowing purple node dot
    graphics.fillStyle(EXPLORATION_VISUAL_COLORS.pathFill, 0.85);
    graphics.fillCircle(centerX, centerY, markerRadius);
    graphics.lineStyle(1.5, EXPLORATION_VISUAL_COLORS.pathStroke, 0.95);
    graphics.strokeCircle(centerX, centerY, markerRadius + 1.5);
  }
}

export function clearExplorationPathPreview(
  graphics: Phaser.GameObjects.Graphics,
): void {
  graphics.clear();
}
