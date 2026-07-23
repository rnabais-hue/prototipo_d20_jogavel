import { describe, expect, it } from 'vitest';
import { getStraightManhattanPath } from './straightManhattanPath';

describe('getStraightManhattanPath', () => {
  it('returns a horizontal path excluding origin and including destination', () => {
    expect(getStraightManhattanPath({ x: 1, y: 2 }, { x: 4, y: 2 })).toEqual([
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
    ]);
  });

  it('returns a vertical path excluding origin and including destination', () => {
    expect(getStraightManhattanPath({ x: 3, y: 5 }, { x: 3, y: 2 })).toEqual([
      { x: 3, y: 4 },
      { x: 3, y: 3 },
      { x: 3, y: 2 },
    ]);
  });

  it('returns a combined Manhattan path', () => {
    expect(getStraightManhattanPath({ x: 1, y: 1 }, { x: 3, y: 4 })).toEqual([
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
    ]);
  });

  it('returns an empty path when origin equals destination', () => {
    expect(getStraightManhattanPath({ x: 2, y: 2 }, { x: 2, y: 2 })).toEqual([]);
  });

  it('uses a fixed X-first then Y order', () => {
    expect(getStraightManhattanPath({ x: 4, y: 4 }, { x: 1, y: 2 })).toEqual([
      { x: 3, y: 4 },
      { x: 2, y: 4 },
      { x: 1, y: 4 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
    ]);
  });

  it('does not mutate input cells', () => {
    const from = { x: 5, y: 1 };
    const to = { x: 2, y: 3 };

    getStraightManhattanPath(from, to);

    expect(from).toEqual({ x: 5, y: 1 });
    expect(to).toEqual({ x: 2, y: 3 });
  });
});
