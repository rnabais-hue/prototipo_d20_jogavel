import { describe, expect, it } from 'vitest';
import { validateCombatSessionAttackRange } from './combatAttackRange';
import { createCombatPositioningState } from './combatPositioning';
import type { CombatSession } from './combatSession';
import type { CombatCliResolvedWeapon } from '../cli/combatCliPresets';

function createMockSession(positions: Record<string, { x: number; y: number }>): CombatSession {
  const placements = Object.entries(positions).map(([participantId, cell]) => ({
    participantId,
    cell,
  }));
  return {
    positioning: createCombatPositioningState({
      bounds: { width: 20, height: 20 },
      placements,
    }),
  } as unknown as CombatSession;
}

const meleeWeapon: CombatCliResolvedWeapon = {
  weaponId: 'melee-w',
  label: 'Melee Weapon',
  rangeProfile: { band: 'melee', maximumDistance: 1 },
};

const shortWeapon: CombatCliResolvedWeapon = {
  weaponId: 'short-w',
  label: 'Short Weapon',
  rangeProfile: { band: 'short', maximumDistance: 4 },
};

const longWeapon: CombatCliResolvedWeapon = {
  weaponId: 'long-w',
  label: 'Long Weapon',
  rangeProfile: { band: 'long', maximumDistance: 9 },
};

describe('validateCombatSessionAttackRange pure rules', () => {
  it('succeeds at distance 0 (same-cell)', () => {
    const session = createMockSession({
      attacker: { x: 2, y: 4 },
      target: { x: 2, y: 4 },
    });
    const result = validateCombatSessionAttackRange(session, {
      attackerId: 'attacker',
      targetId: 'target',
      weapon: meleeWeapon,
    });
    expect(result).toEqual({
      ok: true,
      distance: 0,
      maximumDistance: 1,
      weapon: meleeWeapon,
    });
  });

  it('calculates orthogonally adjacent distance as 1', () => {
    const session = createMockSession({
      attacker: { x: 2, y: 4 },
      target: { x: 3, y: 4 },
    });
    const result = validateCombatSessionAttackRange(session, {
      attackerId: 'attacker',
      targetId: 'target',
      weapon: meleeWeapon,
    });
    expect(result).toEqual({
      ok: true,
      distance: 1,
      maximumDistance: 1,
      weapon: meleeWeapon,
    });
  });

  it('calculates offset { x: 1, y: 1 } distance as 2', () => {
    const session = createMockSession({
      attacker: { x: 2, y: 4 },
      target: { x: 3, y: 5 },
    });
    const result = validateCombatSessionAttackRange(session, {
      attackerId: 'attacker',
      targetId: 'target',
      weapon: meleeWeapon,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatchObject({
        code: 'attack_out_of_range',
        distance: 2,
      });
    }
  });

  it('melee succeeds at distance 1 and fails at distance 2', () => {
    const session1 = createMockSession({
      attacker: { x: 2, y: 4 },
      target: { x: 3, y: 4 },
    });
    expect(validateCombatSessionAttackRange(session1, {
      attackerId: 'attacker',
      targetId: 'target',
      weapon: meleeWeapon,
    }).ok).toBe(true);

    const session2 = createMockSession({
      attacker: { x: 2, y: 4 },
      target: { x: 4, y: 4 },
    });
    const result2 = validateCombatSessionAttackRange(session2, {
      attackerId: 'attacker',
      targetId: 'target',
      weapon: meleeWeapon,
    });
    expect(result2.ok).toBe(false);
    if (!result2.ok) {
      expect(result2.error).toEqual({
        code: 'attack_out_of_range',
        attackerId: 'attacker',
        targetId: 'target',
        distance: 2,
        maximumDistance: 1,
        weaponId: 'melee-w',
        rangeBand: 'melee',
      });
    }
  });

  it('short range succeeds at distance 4 and fails at distance 5', () => {
    const session1 = createMockSession({
      attacker: { x: 2, y: 4 },
      target: { x: 6, y: 4 },
    });
    expect(validateCombatSessionAttackRange(session1, {
      attackerId: 'attacker',
      targetId: 'target',
      weapon: shortWeapon,
    }).ok).toBe(true);

    const session2 = createMockSession({
      attacker: { x: 2, y: 4 },
      target: { x: 7, y: 4 },
    });
    const result2 = validateCombatSessionAttackRange(session2, {
      attackerId: 'attacker',
      targetId: 'target',
      weapon: shortWeapon,
    });
    expect(result2.ok).toBe(false);
    if (!result2.ok) {
      expect(result2.error).toEqual({
        code: 'attack_out_of_range',
        attackerId: 'attacker',
        targetId: 'target',
        distance: 5,
        maximumDistance: 4,
        weaponId: 'short-w',
        rangeBand: 'short',
      });
    }
  });

  it('long range succeeds at distance 9 and fails at distance 10', () => {
    const session1 = createMockSession({
      attacker: { x: 2, y: 4 },
      target: { x: 11, y: 4 },
    });
    expect(validateCombatSessionAttackRange(session1, {
      attackerId: 'attacker',
      targetId: 'target',
      weapon: longWeapon,
    }).ok).toBe(true);

    const session2 = createMockSession({
      attacker: { x: 2, y: 4 },
      target: { x: 12, y: 4 },
    });
    const result2 = validateCombatSessionAttackRange(session2, {
      attackerId: 'attacker',
      targetId: 'target',
      weapon: longWeapon,
    });
    expect(result2.ok).toBe(false);
    if (!result2.ok) {
      expect(result2.error).toEqual({
        code: 'attack_out_of_range',
        attackerId: 'attacker',
        targetId: 'target',
        distance: 10,
        maximumDistance: 9,
        weaponId: 'long-w',
        rangeBand: 'long',
      });
    }
  });

  it('changing only the associated weapon changes the range result', () => {
    const session = createMockSession({
      attacker: { x: 2, y: 4 },
      target: { x: 6, y: 4 }, // Distance 4
    });
    expect(validateCombatSessionAttackRange(session, {
      attackerId: 'attacker',
      targetId: 'target',
      weapon: meleeWeapon, // fails (max 1)
    }).ok).toBe(false);

    expect(validateCombatSessionAttackRange(session, {
      attackerId: 'attacker',
      targetId: 'target',
      weapon: shortWeapon, // succeeds (max 4)
    }).ok).toBe(true);
  });

  it('rejects missing attacker position', () => {
    const session = createMockSession({
      target: { x: 2, y: 4 },
    });
    const result = validateCombatSessionAttackRange(session, {
      attackerId: 'attacker',
      targetId: 'target',
      weapon: meleeWeapon,
    });
    expect(result).toEqual({
      ok: false,
      error: {
        code: 'missing_combat_position',
        participantId: 'attacker',
      },
    });
  });

  it('rejects missing target position', () => {
    const session = createMockSession({
      attacker: { x: 2, y: 4 },
    });
    const result = validateCombatSessionAttackRange(session, {
      attackerId: 'attacker',
      targetId: 'target',
      weapon: meleeWeapon,
    });
    expect(result).toEqual({
      ok: false,
      error: {
        code: 'missing_combat_position',
        participantId: 'target',
      },
    });
  });
});
