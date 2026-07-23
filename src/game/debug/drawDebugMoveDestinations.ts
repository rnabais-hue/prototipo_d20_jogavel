import Phaser from 'phaser';
import { getReachableOrthogonalCells } from '../../exploration/orthogonalPathfinding';
import type { ExplorationMap } from '../../exploration/explorationMap';
import type { GridCell } from '../../movement/grid';
import { DEBUG_EXPLORATION_GRID } from './debugExplorationConfig';

export function drawDebugMoveDestinations(
  graphics: Phaser.GameObjects.Graphics,
  map: ExplorationMap,
  actorCell: GridCell,
  range: number,
): void {
  graphics.clear();

  for (const cell of getReachableOrthogonalCells(map, actorCell, range)) {
    drawMoveDestinationCell(graphics, cell);
  }
}

function drawMoveDestinationCell(
  graphics: Phaser.GameObjects.Graphics,
  cell: GridCell,
): void {
  const inset = 8;
  const worldX = DEBUG_EXPLORATION_GRID.originX + cell.x * DEBUG_EXPLORATION_GRID.cellSize;
  const worldY = DEBUG_EXPLORATION_GRID.originY + cell.y * DEBUG_EXPLORATION_GRID.cellSize;
  const size = DEBUG_EXPLORATION_GRID.cellSize - inset * 2;

  graphics.fillStyle(0x4fb3d9, 0.12);
  graphics.fillRect(worldX + inset, worldY + inset, size, size);
  graphics.lineStyle(1, 0x6ed8ff, 0.65);
  graphics.strokeRect(worldX + inset, worldY + inset, size, size);
}
