import { describe, expect, it } from 'vitest';
import type { ExplorationMap } from './explorationMap';
import {
  findOrthogonalPath,
  getReachableOrthogonalCells,
} from './orthogonalPathfinding';

describe('findOrthogonalPath', () => {
  it('returns a direct path without blockers', () => {
    const map: ExplorationMap = {
      bounds: { width: 5, height: 5 },
      blockedCells: [],
    };

    expect(findOrthogonalPath(map, { x: 1, y: 1 }, { x: 4, y: 1 }, 4)).toEqual({
      found: true,
      path: [
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 4, y: 1 },
      ],
    });
  });

  it('returns a path that goes around a blocker', () => {
    const map: ExplorationMap = {
      bounds: { width: 5, height: 5 },
      blockedCells: [{ x: 2, y: 1 }],
    };

    expect(findOrthogonalPath(map, { x: 1, y: 1 }, { x: 3, y: 1 }, 4)).toEqual({
      found: true,
      path: [
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 3, y: 1 },
      ],
    });
  });

  it('fails when the destination is blocked', () => {
    const map: ExplorationMap = {
      bounds: { width: 4, height: 4 },
      blockedCells: [{ x: 2, y: 2 }],
    };

    expect(findOrthogonalPath(map, { x: 1, y: 2 }, { x: 2, y: 2 }, 3)).toEqual({
      found: false,
      reason: 'blocked_destination',
    });
  });

  it('returns an empty path when origin equals destination', () => {
    const map: ExplorationMap = {
      bounds: { width: 4, height: 4 },
      blockedCells: [],
    };

    expect(findOrthogonalPath(map, { x: 2, y: 2 }, { x: 2, y: 2 }, 0)).toEqual({
      found: true,
      path: [],
    });
  });

  it('fails when blockers make the destination unreachable', () => {
    const map: ExplorationMap = {
      bounds: { width: 5, height: 5 },
      blockedCells: [
        { x: 2, y: 1 },
        { x: 1, y: 2 },
        { x: 3, y: 2 },
        { x: 2, y: 3 },
      ],
    };

    expect(findOrthogonalPath(map, { x: 0, y: 2 }, { x: 2, y: 2 }, 10)).toEqual({
      found: false,
      reason: 'no_path',
    });
  });

  it('fails clearly when the shortest path exceeds the allowed range', () => {
    const map: ExplorationMap = {
      bounds: { width: 5, height: 5 },
      blockedCells: [{ x: 2, y: 1 }],
    };

    expect(findOrthogonalPath(map, { x: 1, y: 1 }, { x: 3, y: 1 }, 3)).toEqual({
      found: false,
      reason: 'out_of_range',
    });
  });

  it('never includes blocked cells in the returned path', () => {
    const map: ExplorationMap = {
      bounds: { width: 6, height: 6 },
      blockedCells: [
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
      ],
    };

    const result = findOrthogonalPath(map, { x: 1, y: 1 }, { x: 4, y: 3 }, 10);

    expect(result).toEqual({
      found: true,
      path: [
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 1, y: 4 },
        { x: 2, y: 4 },
        { x: 3, y: 4 },
        { x: 4, y: 4 },
        { x: 4, y: 3 },
      ],
    });

    if (!result.found) {
      throw new Error('expected a path to be found');
    }

    expect(result.path).not.toContainEqual({ x: 2, y: 1 });
    expect(result.path).not.toContainEqual({ x: 2, y: 2 });
    expect(result.path).not.toContainEqual({ x: 2, y: 3 });
  });
});

describe('getReachableOrthogonalCells', () => {
  it('returns only cells connected by walkable orthogonal paths', () => {
    const map: ExplorationMap = {
      bounds: { width: 5, height: 5 },
      blockedCells: [
        { x: 2, y: 1 },
        { x: 1, y: 2 },
        { x: 3, y: 2 },
        { x: 2, y: 3 },
      ],
    };

    const reachable = getReachableOrthogonalCells(map, { x: 0, y: 2 }, 4);

    expect(reachable).toContainEqual({ x: 0, y: 2 });
    expect(reachable).toContainEqual({ x: 2, y: 0 });
    expect(reachable).toContainEqual({ x: 2, y: 4 });
    expect(reachable).not.toContainEqual({ x: 2, y: 2 });
    expect(reachable).not.toContainEqual({ x: 4, y: 2 });
  });

  it('respects the maximum range while keeping the origin cell', () => {
    const map: ExplorationMap = {
      bounds: { width: 5, height: 5 },
      blockedCells: [{ x: 1, y: 0 }],
    };

    expect(getReachableOrthogonalCells(map, { x: 0, y: 0 }, 2)).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 0, y: 2 },
    ]);
  });

  it('returns an empty list when the origin is outside the grid or blocked', () => {
    const map: ExplorationMap = {
      bounds: { width: 3, height: 3 },
      blockedCells: [{ x: 1, y: 1 }],
    };

    expect(getReachableOrthogonalCells(map, { x: 3, y: 1 }, 2)).toEqual([]);
    expect(getReachableOrthogonalCells(map, { x: 1, y: 1 }, 2)).toEqual([]);
  });
});
