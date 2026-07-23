export type CheckModifier = {
  sourceId: string;
  value: number;
};

export type CheckInput = {
  checkId: string;
  actorId: string;
  roll: number;
  target: number;
  modifiers?: readonly CheckModifier[];
};

export type CheckResolvedEvent = {
  type: 'check_resolved';
  checkId: string;
  actorId: string;
  roll: number;
  modifiers: readonly CheckModifier[];
  modifierTotal: number;
  total: number;
  target: number;
  success: boolean;
};

export type CheckResult = {
  checkId: string;
  actorId: string;
  roll: number;
  modifiers: readonly CheckModifier[];
  modifierTotal: number;
  total: number;
  target: number;
  success: boolean;
  event: CheckResolvedEvent;
};

export type CheckResolutionError =
  | {
      code: 'invalid_roll';
      roll: number;
    }
  | {
      code: 'invalid_target';
      target: number;
    }
  | {
      code: 'invalid_modifier';
      sourceId: string;
      value: number;
    };

export type CheckResolutionResult =
  | {
      ok: true;
      result: CheckResult;
    }
  | {
      ok: false;
      error: CheckResolutionError;
    };

export function resolveCheck(input: CheckInput): CheckResolutionResult {
  if (!Number.isInteger(input.roll) || input.roll <= 0) {
    return {
      ok: false,
      error: {
        code: 'invalid_roll',
        roll: input.roll,
      },
    };
  }

  if (!Number.isInteger(input.target)) {
    return {
      ok: false,
      error: {
        code: 'invalid_target',
        target: input.target,
      },
    };
  }

  const modifiers = input.modifiers ?? [];
  for (const modifier of modifiers) {
    if (!Number.isInteger(modifier.value)) {
      return {
        ok: false,
        error: {
          code: 'invalid_modifier',
          sourceId: modifier.sourceId,
          value: modifier.value,
        },
      };
    }
  }

  const modifierTotal = modifiers.reduce((total, modifier) => total + modifier.value, 0);
  const total = input.roll + modifierTotal;
  const success = total >= input.target;
  const event: CheckResolvedEvent = {
    type: 'check_resolved',
    checkId: input.checkId,
    actorId: input.actorId,
    roll: input.roll,
    modifiers: [...modifiers],
    modifierTotal,
    total,
    target: input.target,
    success,
  };

  return {
    ok: true,
    result: {
      checkId: input.checkId,
      actorId: input.actorId,
      roll: input.roll,
      modifiers: [...modifiers],
      modifierTotal,
      total,
      target: input.target,
      success,
      event,
    },
  };
}
