import { isCellInsideGrid, type GridCell } from '../movement/grid';
import { type ExplorationMap, isCellWalkable } from './explorationMap';

export type OrthogonalPathSuccess = {
  found: true;
  path: GridCell[];
};

export type OrthogonalPathFailureReason =
  | 'outside_grid'
  | 'blocked_origin'
  | 'blocked_destination'
  | 'no_path'
  | 'out_of_range';

export type OrthogonalPathFailure = {
  found: false;
  reason: OrthogonalPathFailureReason;
};

export type OrthogonalPathResult =
  | OrthogonalPathSuccess
  | OrthogonalPathFailure;

const ORTHOGONAL_DIRECTIONS: ReadonlyArray<GridCell> = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];

export function findOrthogonalPath(
  map: ExplorationMap,
  fromCell: GridCell,
  toCell: GridCell,
  range: number,
): OrthogonalPathResult {
  if (!isCellInsideGrid(fromCell, map.bounds) || !isCellInsideGrid(toCell, map.bounds)) {
    return { found: false, reason: 'outside_grid' };
  }

  if (!isCellWalkable(map, fromCell)) {
    return { found: false, reason: 'blocked_origin' };
  }

  if (!isCellWalkable(map, toCell)) {
    return { found: false, reason: 'blocked_destination' };
  }

  if (areSameCell(fromCell, toCell)) {
    return { found: true, path: [] };
  }

  const path = findShortestOrthogonalPath(map, fromCell, toCell);

  if (path === null) {
    return { found: false, reason: 'no_path' };
  }

  if (path.length > range) {
    return { found: false, reason: 'out_of_range' };
  }

  return { found: true, path };
}

export function getReachableOrthogonalCells(
  map: ExplorationMap,
  fromCell: GridCell,
  range: number,
): GridCell[] {
  if (!isCellInsideGrid(fromCell, map.bounds)) {
    return [];
  }

  if (!isCellWalkable(map, fromCell)) {
    return [];
  }

  const reachableCells: GridCell[] = [fromCell];
  const queue: Array<{ cell: GridCell; distance: number }> = [
    { cell: fromCell, distance: 0 },
  ];
  const visited = new Set<string>([toCellKey(fromCell)]);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current === undefined) {
      break;
    }

    if (current.distance === range) {
      continue;
    }

    for (const direction of ORTHOGONAL_DIRECTIONS) {
      const nextCell = {
        x: current.cell.x + direction.x,
        y: current.cell.y + direction.y,
      };
      const nextKey = toCellKey(nextCell);

      if (visited.has(nextKey) || !isCellWalkable(map, nextCell)) {
        continue;
      }

      visited.add(nextKey);
      reachableCells.push(nextCell);
      queue.push({
        cell: nextCell,
        distance: current.distance + 1,
      });
    }
  }

  return reachableCells;
}

function findShortestOrthogonalPath(
  map: ExplorationMap,
  fromCell: GridCell,
  toCell: GridCell,
): GridCell[] | null {
  const queue: GridCell[] = [fromCell];
  const visited = new Set<string>([toCellKey(fromCell)]);
  const previousByCell = new Map<string, GridCell>();

  while (queue.length > 0) {
    const currentCell = queue.shift();

    if (currentCell === undefined) {
      break;
    }

    if (areSameCell(currentCell, toCell)) {
      return rebuildPath(previousByCell, fromCell, toCell);
    }

    for (const direction of ORTHOGONAL_DIRECTIONS) {
      const nextCell = {
        x: currentCell.x + direction.x,
        y: currentCell.y + direction.y,
      };
      const nextKey = toCellKey(nextCell);

      if (visited.has(nextKey) || !isCellWalkable(map, nextCell)) {
        continue;
      }

      visited.add(nextKey);
      previousByCell.set(nextKey, currentCell);
      queue.push(nextCell);
    }
  }

  return null;
}

function rebuildPath(
  previousByCell: ReadonlyMap<string, GridCell>,
  fromCell: GridCell,
  toCell: GridCell,
): GridCell[] {
  const reversedPath: GridCell[] = [];
  let currentCell = toCell;

  while (!areSameCell(currentCell, fromCell)) {
    reversedPath.push(currentCell);
    const previousCell = previousByCell.get(toCellKey(currentCell));

    if (previousCell === undefined) {
      return [];
    }

    currentCell = previousCell;
  }

  return reversedPath.reverse();
}

function areSameCell(left: GridCell, right: GridCell): boolean {
  return left.x === right.x && left.y === right.y;
}

function toCellKey(cell: GridCell): string {
  return `${cell.x},${cell.y}`;
}
