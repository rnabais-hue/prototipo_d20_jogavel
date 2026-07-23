import { describe, expect, it } from 'vitest';
import { gridToWorld, isCellInsideGrid, worldToGrid } from './grid';

describe('worldToGrid', () => {
  it('converts pixel positions to grid cells using floor', () => {
    expect(worldToGrid({ x: 0, y: 0 }, 32)).toEqual({ x: 0, y: 0 });
    expect(worldToGrid({ x: 31, y: 63 }, 32)).toEqual({ x: 0, y: 1 });
    expect(worldToGrid({ x: 32, y: 64 }, 32)).toEqual({ x: 1, y: 2 });
  });

  it('keeps negative coordinates in negative cells', () => {
    expect(worldToGrid({ x: -1, y: -32 }, 32)).toEqual({ x: -1, y: -1 });
    expect(worldToGrid({ x: -33, y: -65 }, 32)).toEqual({ x: -2, y: -3 });
  });
});

describe('gridToWorld', () => {
  it('converts grid cells to their center pixel positions', () => {
    expect(gridToWorld({ x: 0, y: 0 }, 32)).toEqual({ x: 16, y: 16 });
    expect(gridToWorld({ x: 2, y: 3 }, 32)).toEqual({ x: 80, y: 112 });
  });
});

describe('isCellInsideGrid', () => {
  const bounds = { width: 10, height: 6 };

  it('accepts cells on the inclusive minimum and exclusive maximum edges', () => {
    expect(isCellInsideGrid({ x: 0, y: 0 }, bounds)).toBe(true);
    expect(isCellInsideGrid({ x: 9, y: 5 }, bounds)).toBe(true);
  });

  it('rejects negative cells', () => {
    expect(isCellInsideGrid({ x: -1, y: 0 }, bounds)).toBe(false);
    expect(isCellInsideGrid({ x: 0, y: -1 }, bounds)).toBe(false);
  });

  it('rejects cells outside the grid width or height', () => {
    expect(isCellInsideGrid({ x: 10, y: 5 }, bounds)).toBe(false);
    expect(isCellInsideGrid({ x: 9, y: 6 }, bounds)).toBe(false);
    expect(isCellInsideGrid({ x: 10, y: 6 }, bounds)).toBe(false);
  });
});
