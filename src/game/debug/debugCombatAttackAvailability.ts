import { validateCombatSessionAttackRange } from '../../combat/combatAttackRange';
import { getCombatSessionActiveParticipant, getCombatSessionOutcome, type CombatSession } from '../../combat/combatSession';
import type { CombatWeaponRangeBand } from '../../combat/combatWeaponRange';

export type DebugCombatAttackAvailabilityReason =
  | 'in_range'
  | 'out_of_range'
  | 'missing_position'
  | 'main_action_unavailable'
  | 'not_player_turn'
  | 'encounter_resolved';

export type DebugCombatAttackAvailability = {
  actionId: string;
  actionLabel: string;
  weaponId: string;
  weaponLabel: string;
  rangeBand: CombatWeaponRangeBand;
  maximumDistance: number;
  distance?: number;
  available: boolean;
  reason: DebugCombatAttackAvailabilityReason;
};

export function projectDebugCombatAttackAvailability(
  session: CombatSession,
  playerParticipantId: string,
): readonly DebugCombatAttackAvailability[] {
  const player = session.preset.sheets.find((sheet) => sheet.participantId === playerParticipantId);
  if (!player) return [];
  const target = session.preset.sheets.find((sheet) => sheet.teamId !== player.teamId);
  if (!target) return [];

  const outcome = getCombatSessionOutcome(session);
  const active = getCombatSessionActiveParticipant(session);

  return player.actions.map((action) => {
    const base = {
      actionId: action.actionId,
      actionLabel: action.label,
      weaponId: action.weapon.weaponId,
      weaponLabel: action.weapon.label,
      rangeBand: action.weapon.rangeProfile.band,
      maximumDistance: action.weapon.rangeProfile.maximumDistance,
    };
    if (outcome.status !== 'ongoing') return { ...base, available: false, reason: 'encounter_resolved' as const };
    if (active?.id !== player.participantId) return { ...base, available: false, reason: 'not_player_turn' as const };
    if (!session.encounter.activeTurn.mainActionAvailable) {
      return { ...base, available: false, reason: 'main_action_unavailable' as const };
    }
    const range = validateCombatSessionAttackRange(session, {
      attackerId: player.participantId,
      targetId: target.participantId,
      weapon: action.weapon,
    });
    if (range.ok) {
      return { ...base, distance: range.distance, available: true, reason: 'in_range' as const };
    }
    if (range.error.code === 'missing_combat_position') {
      return { ...base, available: false, reason: 'missing_position' as const };
    }
    return { ...base, distance: range.error.distance, available: false, reason: 'out_of_range' as const };
  });
}
