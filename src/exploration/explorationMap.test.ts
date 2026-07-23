import { describe, expect, it } from 'vitest';
import {
  getMoveDestinationStatus,
  getValidMoveDestinations,
  isCellBlocked,
  isCellWalkable,
  isValidMoveDestination,
  type ExplorationMap,
} from './explorationMap';

const testMap: ExplorationMap = {
  bounds: { width: 4, height: 3 },
  blockedCells: [
    { x: 1, y: 1 },
    { x: 3, y: 0 },
  ],
};

describe('explorationMap', () => {
  it('recognizes a blocked cell', () => {
    expect(isCellBlocked(testMap, { x: 1, y: 1 })).toBe(true);
  });

  it('treats an unblocked inside cell as walkable', () => {
    expect(isCellWalkable(testMap, { x: 0, y: 2 })).toBe(true);
  });

  it('treats a cell outside the grid as not walkable', () => {
    expect(isCellWalkable(testMap, { x: 4, y: 1 })).toBe(false);
    expect(isCellWalkable(testMap, { x: -1, y: 0 })).toBe(false);
  });

  it('does not mutate the map or cell inputs', () => {
    const map: ExplorationMap = {
      bounds: { width: 3, height: 3 },
      blockedCells: [{ x: 2, y: 2 }],
    };
    const cell = { x: 0, y: 0 };
    const mapBefore = JSON.stringify(map);
    const cellBefore = JSON.stringify(cell);

    isCellWalkable(map, cell);
    isCellBlocked(map, cell);

    expect(JSON.stringify(map)).toBe(mapBefore);
    expect(JSON.stringify(cell)).toBe(cellBefore);
  });
});

describe('getMoveDestinationStatus', () => {
  it('returns valid status for a walkable destination inside range', () => {
    expect(getMoveDestinationStatus(testMap, { x: 0, y: 0 }, { x: 2, y: 0 }, 2)).toEqual({ valid: true });
  });

  it('returns outside_grid before other checks', () => {
    expect(getMoveDestinationStatus(testMap, { x: 1, y: 1 }, { x: 4, y: 1 }, 3)).toEqual({
      valid: false,
      reason: 'outside_grid',
    });
  });

  it('returns blocked for a blocked destination inside grid', () => {
    expect(getMoveDestinationStatus(testMap, { x: 1, y: 0 }, { x: 1, y: 1 }, 2)).toEqual({
      valid: false,
      reason: 'blocked',
    });
  });

  it('returns out_of_range for a walkable destination outside range', () => {
    expect(getMoveDestinationStatus(testMap, { x: 0, y: 0 }, { x: 2, y: 2 }, 3)).toEqual({
      valid: false,
      reason: 'out_of_range',
    });
  });

  it('does not mutate input data', () => {
    const map: ExplorationMap = {
      bounds: { width: 3, height: 3 },
      blockedCells: [{ x: 2, y: 2 }],
    };
    const fromCell = { x: 1, y: 1 };
    const toCell = { x: 0, y: 2 };
    const mapBefore = JSON.stringify(map);
    const fromCellBefore = JSON.stringify(fromCell);
    const toCellBefore = JSON.stringify(toCell);

    getMoveDestinationStatus(map, fromCell, toCell, 2);

    expect(JSON.stringify(map)).toBe(mapBefore);
    expect(JSON.stringify(fromCell)).toBe(fromCellBefore);
    expect(JSON.stringify(toCell)).toBe(toCellBefore);
  });
});

describe('isValidMoveDestination', () => {
  it('accepts a walkable destination inside range', () => {
    expect(isValidMoveDestination(testMap, { x: 0, y: 0 }, { x: 2, y: 0 }, 2)).toBe(true);
  });

  it('rejects invalid destinations', () => {
    expect(isValidMoveDestination(testMap, { x: 1, y: 0 }, { x: 1, y: 1 }, 2)).toBe(false);
    expect(isValidMoveDestination(testMap, { x: 1, y: 1 }, { x: 4, y: 1 }, 3)).toBe(false);
    expect(isValidMoveDestination(testMap, { x: 0, y: 0 }, { x: 2, y: 2 }, 3)).toBe(false);
  });
});

describe('getValidMoveDestinations', () => {
  it('includes expected valid cells', () => {
    const destinations = getValidMoveDestinations(testMap, { x: 0, y: 0 }, 2);

    expect(destinations).toContainEqual({ x: 0, y: 0 });
    expect(destinations).toContainEqual({ x: 2, y: 0 });
    expect(destinations).toContainEqual({ x: 0, y: 2 });
  });

  it('excludes blocked cells', () => {
    const destinations = getValidMoveDestinations(testMap, { x: 1, y: 0 }, 2);

    expect(destinations).not.toContainEqual({ x: 1, y: 1 });
    expect(destinations).not.toContainEqual({ x: 3, y: 0 });
  });

  it('excludes cells outside range', () => {
    const destinations = getValidMoveDestinations(testMap, { x: 0, y: 0 }, 2);

    expect(destinations).not.toContainEqual({ x: 2, y: 2 });
  });

  it('does not mutate input data', () => {
    const map: ExplorationMap = {
      bounds: { width: 3, height: 3 },
      blockedCells: [{ x: 2, y: 2 }],
    };
    const fromCell = { x: 1, y: 1 };
    const mapBefore = JSON.stringify(map);
    const fromCellBefore = JSON.stringify(fromCell);

    getValidMoveDestinations(map, fromCell, 2);

    expect(JSON.stringify(map)).toBe(mapBefore);
    expect(JSON.stringify(fromCell)).toBe(fromCellBefore);
  });
});
