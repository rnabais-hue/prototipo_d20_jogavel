import { describe, expect, it } from 'vitest';
import { parseCombatCliExplicitD20Roll } from './combatCliRollInput';

describe('parseCombatCliExplicitD20Roll', () => {
  it('allows omitted rolls for automatic rolling', () => {
    expect(parseCombatCliExplicitD20Roll(undefined)).toEqual({
      ok: true,
      roll: undefined,
    });
  });

  it('accepts integer d20 rolls from 1 through 20', () => {
    expect(parseCombatCliExplicitD20Roll('1')).toEqual({ ok: true, roll: 1 });
    expect(parseCombatCliExplicitD20Roll('20')).toEqual({ ok: true, roll: 20 });
  });

  it('rejects rolls outside d20 range', () => {
    expect(parseCombatCliExplicitD20Roll('0')).toEqual({
      ok: false,
      error: {
        code: 'invalid_explicit_roll',
        value: '0',
      },
    });
    expect(parseCombatCliExplicitD20Roll('21')).toEqual({
      ok: false,
      error: {
        code: 'invalid_explicit_roll',
        value: '21',
      },
    });
  });

  it('rejects non-integer roll input', () => {
    expect(parseCombatCliExplicitD20Roll('12.5')).toEqual({
      ok: false,
      error: {
        code: 'invalid_explicit_roll',
        value: '12.5',
      },
    });
  });
});
