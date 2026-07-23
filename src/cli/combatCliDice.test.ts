import { describe, expect, it } from 'vitest';
import { createCombatCliDice, rollD20 } from './combatCliDice';

describe('rollD20', () => {
  it('returns 1 at the lower random boundary', () => {
    expect(rollD20(() => 0)).toBe(1);
  });

  it('returns 20 near the upper random boundary', () => {
    expect(rollD20(() => 0.999_999)).toBe(20);
  });

  it('clamps an exact upper boundary to 20', () => {
    expect(rollD20(() => 1)).toBe(20);
  });

  it('clamps a negative source value to 1', () => {
    expect(rollD20(() => -0.5)).toBe(1);
  });

  it('rejects non-finite source values', () => {
    expect(() => rollD20(() => Number.NaN)).toThrow('finite number');
  });

  it('maps deterministic random source values into integer d20 results', () => {
    expect(rollD20(() => 0.5)).toBe(11);
  });
});

describe('createCombatCliDice', () => {
  it('uses the injected random source for d20 rolls', () => {
    const dice = createCombatCliDice(() => 0.95);

    expect(dice.rollD20()).toBe(20);
  });
});
