import {
  resolveBasicAttack,
  type BasicAttackError,
  type BasicAttackInput,
  type BasicAttackResolvedEvent,
  type AttackOutcome,
} from './basicAttack';
import { applyDamage, type DamageError } from './damage';
import type { EncounterEvent, TacticalEncounter } from './tacticalEncounter';

export type BasicAttackWithDamageInput = BasicAttackInput & {
  damageAmount: number;
};

export type BasicAttackWithDamageResolvedEvent =
  | BasicAttackResolvedEvent
  | EncounterEvent;

export type BasicAttackWithDamageResultData = {
  outcome: AttackOutcome;
  check: Exclude<ReturnType<typeof resolveBasicAttack>, { ok: false }>['check'];
  damage:
    | {
        applied: true;
        amount: number;
      }
    | {
        applied: false;
      };
};

export type BasicAttackWithDamageError =
  | {
      code: 'invalid_damage_amount';
      amount: number;
    }
  | {
      code: 'attack_failed';
      error: BasicAttackError;
    }
  | {
      code: 'damage_failed';
      error: DamageError;
    };

export type BasicAttackWithDamageResult =
  | {
      ok: true;
      encounter: TacticalEncounter;
      result: BasicAttackWithDamageResultData;
      events: readonly BasicAttackWithDamageResolvedEvent[];
    }
  | {
      ok: false;
      error: BasicAttackWithDamageError;
    };

export function resolveBasicAttackWithDamage(
  input: BasicAttackWithDamageInput,
): BasicAttackWithDamageResult {
  if (!Number.isInteger(input.damageAmount) || input.damageAmount <= 0) {
    return {
      ok: false,
      error: {
        code: 'invalid_damage_amount',
        amount: input.damageAmount,
      },
    };
  }

  const attack = resolveBasicAttack(input);
  if (!attack.ok) {
    return {
      ok: false,
      error: {
        code: 'attack_failed',
        error: attack.error,
      },
    };
  }

  if (attack.outcome === 'miss') {
    return {
      ok: true,
      encounter: attack.encounter,
      result: {
        outcome: attack.outcome,
        check: attack.check,
        damage: {
          applied: false,
        },
      },
      events: attack.events,
    };
  }

  const damage = applyDamage({
    encounter: attack.encounter,
    sourceId: input.attackerId,
    targetId: input.targetId,
    amount: input.damageAmount,
  });
  if (!damage.ok) {
    return {
      ok: false,
      error: {
        code: 'damage_failed',
        error: damage.error,
      },
    };
  }

  return {
    ok: true,
    encounter: damage.encounter,
    result: {
      outcome: attack.outcome,
      check: attack.check,
      damage: {
        applied: true,
        amount: input.damageAmount,
      },
    },
    events: [...attack.events, ...damage.events],
  };
}
