import type { EncounterOutcome } from '../rules/tacticalEncounter';
import type { CombatResolvedSheet } from '../combat/combatSheet';

export function formatCombatCliOutcome(
  outcome: EncounterOutcome,
  sheets: readonly CombatResolvedSheet[],
): string {
  switch (outcome.status) {
    case 'ongoing':
      return `ongoing (${outcome.activeTeamIds.map((teamId) => formatTeam(teamId, sheets)).join(' vs ')})`;
    case 'resolved':
      return `resolved, winner: ${formatTeam(outcome.winningTeamId, sheets)}`;
    case 'no_active_participants':
      return 'no active participants';
  }
}

export function formatCombatCliEndSummary(
  outcome: EncounterOutcome,
  sheets: readonly CombatResolvedSheet[],
): string | undefined {
  switch (outcome.status) {
    case 'ongoing':
      return undefined;
    case 'resolved':
      return `Combat resolved: ${formatTeam(outcome.winningTeamId, sheets)} wins. Type restart to play again.`;
    case 'no_active_participants':
      return 'Combat resolved: no active participants remain. Type restart to play again.';
  }
}

function formatTeam(teamId: string, sheets: readonly CombatResolvedSheet[]): string {
  const teamMembers = sheets
    .filter((sheet) => sheet.teamId === teamId)
    .map((sheet) => sheet.displayName);

  return teamMembers.length > 0 ? teamMembers.join(', ') : teamId;
}
