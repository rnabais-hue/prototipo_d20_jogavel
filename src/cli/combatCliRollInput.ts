export type CombatCliExplicitRollResult =
  | {
      ok: true;
      roll: number | undefined;
    }
  | {
      ok: false;
      error: {
        code: 'invalid_explicit_roll';
        value: string;
      };
    };

export function parseCombatCliExplicitD20Roll(
  value: string | undefined,
): CombatCliExplicitRollResult {
  if (value === undefined || value.length === 0) {
    return {
      ok: true,
      roll: undefined,
    };
  }

  if (!/^\d+$/.test(value)) {
    return invalidExplicitRoll(value);
  }

  const roll = Number(value);
  if (!Number.isInteger(roll) || roll < 1 || roll > 20) {
    return invalidExplicitRoll(value);
  }

  return {
    ok: true,
    roll,
  };
}

function invalidExplicitRoll(value: string): CombatCliExplicitRollResult {
  return {
    ok: false,
    error: {
      code: 'invalid_explicit_roll',
      value,
    },
  };
}
