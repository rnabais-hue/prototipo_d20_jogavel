import { describe, expect, it } from 'vitest';
import { getManhattanDistance, isCellWithinMoveRange } from './moveRange';

describe('getManhattanDistance', () => {
  it('returns zero for the same cell', () => {
    expect(getManhattanDistance({ x: 2, y: 3 }, { x: 2, y: 3 })).toBe(0);
  });

  it('returns horizontal distance', () => {
    expect(getManhattanDistance({ x: 1, y: 4 }, { x: 6, y: 4 })).toBe(5);
  });

  it('returns vertical distance', () => {
    expect(getManhattanDistance({ x: 5, y: 1 }, { x: 5, y: 7 })).toBe(6);
  });

  it('returns combined horizontal and vertical distance', () => {
    expect(getManhattanDistance({ x: 1, y: 2 }, { x: 4, y: 6 })).toBe(7);
  });

  it('does not mutate input cells', () => {
    const from = { x: 3, y: 4 };
    const to = { x: 8, y: 1 };

    getManhattanDistance(from, to);

    expect(from).toEqual({ x: 3, y: 4 });
    expect(to).toEqual({ x: 8, y: 1 });
  });
});

describe('isCellWithinMoveRange', () => {
  it('accepts a cell inside range', () => {
    expect(isCellWithinMoveRange({ x: 2, y: 2 }, { x: 4, y: 3 }, 4)).toBe(true);
  });

  it('rejects a cell outside range', () => {
    expect(isCellWithinMoveRange({ x: 2, y: 2 }, { x: 6, y: 5 }, 4)).toBe(false);
  });

  it('accepts only the origin cell when range is zero', () => {
    expect(isCellWithinMoveRange({ x: 2, y: 2 }, { x: 2, y: 2 }, 0)).toBe(true);
    expect(isCellWithinMoveRange({ x: 2, y: 2 }, { x: 3, y: 2 }, 0)).toBe(false);
  });
});
