import type { InterestPoint } from './interestPoint';
import type { ExplorationMap } from './explorationMap';
import type { GridCell } from '../movement/grid';

export type SwitchControlledBlocker = {
  switchId: string;
  cells: readonly GridCell[];
  blockedWhenActive: boolean;
};

export function buildEffectiveExplorationMap(
  baseMap: ExplorationMap,
  interestPoints: readonly InterestPoint[],
  switchBlockers: readonly SwitchControlledBlocker[],
): ExplorationMap {
  const blockedCells = [...baseMap.blockedCells];

  for (const blocker of switchBlockers) {
    const switchPoint = interestPoints.find((point) => point.id === blocker.switchId);
    const isActive = switchPoint?.debugFlagActive ?? false;
    const shouldBlock = blocker.blockedWhenActive ? isActive : !isActive;

    if (!shouldBlock) {
      continue;
    }

    for (const cell of blocker.cells) {
      if (blockedCells.some((blockedCell) => areSameCell(blockedCell, cell))) {
        continue;
      }

      blockedCells.push(cell);
    }
  }

  return {
    bounds: baseMap.bounds,
    blockedCells,
  };
}

function areSameCell(left: GridCell, right: GridCell): boolean {
  return left.x === right.x && left.y === right.y;
}
