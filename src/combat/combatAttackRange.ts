import type { CombatSession } from './combatSession';
import { getCombatParticipantCell } from './combatPositioning';
import { getManhattanDistance } from '../movement/moveRange';
import type { CombatResolvedWeapon } from '../content/combatPresets';
import type { CombatWeaponRangeBand } from './combatWeaponRange';

export type CombatAttackRangeValidation =
  | {
      ok: true;
      distance: number;
      maximumDistance: number;
      weapon: CombatResolvedWeapon;
    }
  | {
      ok: false;
      error:
        | {
            code: 'attack_out_of_range';
            attackerId: string;
            targetId: string;
            distance: number;
            maximumDistance: number;
            weaponId: string;
            rangeBand: CombatWeaponRangeBand;
          }
        | {
            code: 'missing_combat_position';
            participantId: string;
          };
    };

export function validateCombatSessionAttackRange(
  session: CombatSession,
  input: {
    attackerId: string;
    targetId: string;
    weapon: CombatResolvedWeapon;
  },
): CombatAttackRangeValidation {
  const attackerCell = getCombatParticipantCell(session.positioning, input.attackerId);
  if (!attackerCell) {
    return {
      ok: false,
      error: {
        code: 'missing_combat_position',
        participantId: input.attackerId,
      },
    };
  }

  const targetCell = getCombatParticipantCell(session.positioning, input.targetId);
  if (!targetCell) {
    return {
      ok: false,
      error: {
        code: 'missing_combat_position',
        participantId: input.targetId,
      },
    };
  }

  const distance = getManhattanDistance(attackerCell, targetCell);
  const maximumDistance = input.weapon.rangeProfile.maximumDistance;

  if (distance <= maximumDistance) {
    return {
      ok: true,
      distance,
      maximumDistance,
      weapon: input.weapon,
    };
  }

  return {
    ok: false,
    error: {
      code: 'attack_out_of_range',
      attackerId: input.attackerId,
      targetId: input.targetId,
      distance,
      maximumDistance,
      weaponId: input.weapon.weaponId,
      rangeBand: input.weapon.rangeProfile.band,
    },
  };
}
