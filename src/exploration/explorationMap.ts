import { isCellInsideGrid, type GridBounds, type GridCell } from '../movement/grid';
import { isCellWithinMoveRange } from '../movement/moveRange';

export type ExplorationMap = {
  bounds: GridBounds;
  blockedCells: readonly GridCell[];
};

export type ValidMoveDestinationStatus = {
  valid: true;
};

export type InvalidMoveDestinationStatus = {
  valid: false;
  reason: 'outside_grid' | 'blocked' | 'out_of_range';
};

export type MoveDestinationStatus =
  | ValidMoveDestinationStatus
  | InvalidMoveDestinationStatus;

export function isCellBlocked(map: ExplorationMap, cell: GridCell): boolean {
  return map.blockedCells.some((blockedCell) => areSameCell(blockedCell, cell));
}

export function isCellWalkable(map: ExplorationMap, cell: GridCell): boolean {
  return isCellInsideGrid(cell, map.bounds) && !isCellBlocked(map, cell);
}

export function getMoveDestinationStatus(
  map: ExplorationMap,
  fromCell: GridCell,
  toCell: GridCell,
  range: number,
): MoveDestinationStatus {
  if (!isCellInsideGrid(toCell, map.bounds)) {
    return { valid: false, reason: 'outside_grid' };
  }

  if (isCellBlocked(map, toCell)) {
    return { valid: false, reason: 'blocked' };
  }

  if (!isCellWithinMoveRange(fromCell, toCell, range)) {
    return { valid: false, reason: 'out_of_range' };
  }

  return { valid: true };
}

export function isValidMoveDestination(
  map: ExplorationMap,
  fromCell: GridCell,
  toCell: GridCell,
  range: number,
): boolean {
  return getMoveDestinationStatus(map, fromCell, toCell, range).valid;
}

export function getValidMoveDestinations(
  map: ExplorationMap,
  fromCell: GridCell,
  range: number,
): GridCell[] {
  const destinations: GridCell[] = [];

  for (let y = 0; y < map.bounds.height; y += 1) {
    for (let x = 0; x < map.bounds.width; x += 1) {
      const cell = { x, y };

      if (isValidMoveDestination(map, fromCell, cell, range)) {
        destinations.push(cell);
      }
    }
  }

  return destinations;
}

function areSameCell(left: GridCell, right: GridCell): boolean {
  return left.x === right.x && left.y === right.y;
}
