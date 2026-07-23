import { describe, expect, it } from 'vitest';
import { scaleToCell, VISUAL_SCALE } from './visualScale';

describe('visual scale', () => {
  it('matches current exploration and combat baselines', () => {
    expect(VISUAL_SCALE.explorationTileSize).toBe(32);
    expect(VISUAL_SCALE.combatCellMaximum).toBe(42);
    expect(VISUAL_SCALE.actorAnchor).toEqual({ x: 0.5, y: 0.82 });
  });

  it('scales presentation dimensions from current cell size', () => {
    expect(scaleToCell(32, VISUAL_SCALE.actorCellWidthRatio)).toBeCloseTo(25.6);
  });

  it('rejects invalid scale inputs', () => {
    expect(() => scaleToCell(0, 0.8)).toThrow(RangeError);
    expect(() => scaleToCell(32, Number.NaN)).toThrow(RangeError);
  });
});
