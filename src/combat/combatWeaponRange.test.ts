import { describe, expect, it } from 'vitest';
import { getCombatWeaponMaximumRange, getCombatWeaponRangeProfile, isCombatWeaponRangeBand, type CombatWeaponDefinition } from './combatWeaponRange';

describe('combat weapon range', () => {
  it.each([['melee', 1], ['short', 4], ['long', 9]] as const)('%s has maximum distance %i', (band, maximumDistance) => {
    expect(getCombatWeaponRangeProfile(band)).toEqual({ band, maximumDistance });
  });

  it.each([
    [{ id: 'sword', label: 'Sword', rangeBand: 'melee' }, 1],
    [{ id: 'crossbow', label: 'Crossbow', rangeBand: 'short' }, 4],
    [{ id: 'bow', label: 'Bow', rangeBand: 'long' }, 9],
  ] as const)('resolves representative weapons', (weapon, maximumDistance) => {
    expect(getCombatWeaponMaximumRange(weapon as CombatWeaponDefinition)).toBe(maximumDistance);
  });

  it('recognizes only canonical bands', () => {
    expect(['melee', 'short', 'long'].every(isCombatWeaponRangeBand)).toBe(true);
    expect(isCombatWeaponRangeBand('medium')).toBe(false);
  });
});
