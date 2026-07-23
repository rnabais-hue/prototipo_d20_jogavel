import type { GridCell } from './grid';

export function getManhattanDistance(from: GridCell, to: GridCell): number {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
}

export function isCellWithinMoveRange(
  from: GridCell,
  to: GridCell,
  range: number,
): boolean {
  return getManhattanDistance(from, to) <= range;
}
