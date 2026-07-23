import { describe, expect, it } from 'vitest';
import { resolveCheck, type CheckInput } from './checkResolution';

describe('resolveCheck', () => {
  it('succeeds when total equals target', () => {
    const result = resolveCheck(
      createCheck({
        roll: 10,
        target: 12,
        modifiers: [{ sourceId: 'training', value: 2 }],
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.result.total).toBe(12);
    expect(result.result.success).toBe(true);
  });

  it('succeeds when total exceeds target', () => {
    const result = resolveCheck(createCheck({ roll: 15, target: 12 }));

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.result.total).toBe(15);
    expect(result.result.success).toBe(true);
  });

  it('fails when total is below target', () => {
    const result = resolveCheck(createCheck({ roll: 8, target: 12 }));

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.result.total).toBe(8);
    expect(result.result.success).toBe(false);
  });

  it('sums multiple modifiers', () => {
    const result = resolveCheck(
      createCheck({
        roll: 8,
        target: 15,
        modifiers: [
          { sourceId: 'attribute', value: 3 },
          { sourceId: 'tool', value: 4 },
        ],
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.result.modifierTotal).toBe(7);
    expect(result.result.total).toBe(15);
    expect(result.result.success).toBe(true);
  });

  it('accepts a negative modifier', () => {
    const result = resolveCheck(
      createCheck({
        roll: 12,
        target: 10,
        modifiers: [{ sourceId: 'condition', value: -3 }],
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.result.modifierTotal).toBe(-3);
    expect(result.result.total).toBe(9);
    expect(result.result.success).toBe(false);
  });

  it('preserves modifier details in the result', () => {
    const modifiers = [
      { sourceId: 'attribute', value: 2 },
      { sourceId: 'circumstance', value: -1 },
    ];

    const result = resolveCheck(createCheck({ roll: 11, target: 10, modifiers }));

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.result.modifiers).toEqual(modifiers);
    expect(result.result.event).toEqual({
      type: 'check_resolved',
      checkId: 'check-1',
      actorId: 'actor-1',
      roll: 11,
      modifiers,
      modifierTotal: 1,
      total: 12,
      target: 10,
      success: true,
    });
  });

  it('returns a structured error for an invalid roll', () => {
    expect(resolveCheck(createCheck({ roll: 0, target: 10 }))).toEqual({
      ok: false,
      error: {
        code: 'invalid_roll',
        roll: 0,
      },
    });
  });

  it('returns a structured error for an invalid target', () => {
    expect(resolveCheck(createCheck({ roll: 10, target: 10.5 }))).toEqual({
      ok: false,
      error: {
        code: 'invalid_target',
        target: 10.5,
      },
    });
  });

  it('returns a structured error for an invalid modifier', () => {
    expect(
      resolveCheck(
        createCheck({
          roll: 10,
          target: 10,
          modifiers: [{ sourceId: 'fractional', value: 1.5 }],
        }),
      ),
    ).toEqual({
      ok: false,
      error: {
        code: 'invalid_modifier',
        sourceId: 'fractional',
        value: 1.5,
      },
    });
  });

  it('is deterministic and does not roll randomly', () => {
    const input = createCheck({
      roll: 9,
      target: 12,
      modifiers: [{ sourceId: 'attribute', value: 3 }],
    });

    expect(resolveCheck(input)).toEqual(resolveCheck(input));
  });
});

function createCheck(overrides: Partial<CheckInput>): CheckInput {
  return {
    checkId: 'check-1',
    actorId: 'actor-1',
    roll: 10,
    target: 10,
    modifiers: [],
    ...overrides,
  };
}
