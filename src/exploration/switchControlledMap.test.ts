import { describe, expect, it } from 'vitest';
import { findOrthogonalPath } from './orthogonalPathfinding';
import { isCellWalkable, type ExplorationMap } from './explorationMap';
import { createInterestPoint } from './interestPoint';
import {
  buildEffectiveExplorationMap,
  type SwitchControlledBlocker,
} from './switchControlledMap';

const baseMap: ExplorationMap = {
  bounds: { width: 4, height: 3 },
  blockedCells: [{ x: 0, y: 2 }],
};

const switchBlockers: readonly SwitchControlledBlocker[] = [
  {
    switchId: 'poi-switch-1',
    cells: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
    blockedWhenActive: false,
  },
];

const switchOffPoint = createInterestPoint(
  'poi-switch-1',
  'Gate Switch',
  { x: 3, y: 1 },
  'switch',
);

const switchOnPoint = {
  ...switchOffPoint,
  state: 'inspected' as const,
  debugFlagActive: true,
};

describe('buildEffectiveExplorationMap', () => {
  it('keeps switch-controlled cells blocked while the switch is off', () => {
    const effectiveMap = buildEffectiveExplorationMap(
      baseMap,
      [switchOffPoint],
      switchBlockers,
    );

    expect(effectiveMap.blockedCells).toContainEqual({ x: 1, y: 0 });
    expect(effectiveMap.blockedCells).toContainEqual({ x: 1, y: 1 });
    expect(effectiveMap.blockedCells).toContainEqual({ x: 1, y: 2 });
    expect(isCellWalkable(effectiveMap, { x: 1, y: 1 })).toBe(false);
  });

  it('unblocks switch-controlled cells when the switch turns on', () => {
    const effectiveMap = buildEffectiveExplorationMap(
      baseMap,
      [switchOnPoint],
      switchBlockers,
    );

    expect(effectiveMap.blockedCells).not.toContainEqual({ x: 1, y: 0 });
    expect(effectiveMap.blockedCells).not.toContainEqual({ x: 1, y: 1 });
    expect(effectiveMap.blockedCells).not.toContainEqual({ x: 1, y: 2 });
    expect(isCellWalkable(effectiveMap, { x: 1, y: 1 })).toBe(true);
  });

  it('changes pathfinding results when the switch state changes', () => {
    const blockedMap = buildEffectiveExplorationMap(
      baseMap,
      [switchOffPoint],
      switchBlockers,
    );
    const unblockedMap = buildEffectiveExplorationMap(
      baseMap,
      [switchOnPoint],
      switchBlockers,
    );

    expect(findOrthogonalPath(blockedMap, { x: 0, y: 1 }, { x: 3, y: 1 }, 5)).toEqual({
      found: false,
      reason: 'no_path',
    });
    expect(findOrthogonalPath(unblockedMap, { x: 0, y: 1 }, { x: 3, y: 1 }, 5)).toEqual({
      found: true,
      path: [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
      ],
    });
  });
});
