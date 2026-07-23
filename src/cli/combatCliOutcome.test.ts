import { describe, expect, it } from 'vitest';
import { COMBAT_RESOLVED_SHEETS } from '../content/combatPresets';
import { formatCombatCliEndSummary, formatCombatCliOutcome } from './combatCliOutcome';

describe('formatCombatCliOutcome', () => {
  it('formats ongoing teams with CLI participant names', () => {
    expect(
      formatCombatCliOutcome(
        {
          status: 'ongoing',
          activeTeamIds: ['team_player', 'team_opponent'],
        },
        COMBAT_RESOLVED_SHEETS,
      ),
    ).toBe('ongoing (Training Vanguard vs Practice Raider)');
  });

  it('formats resolved winners with CLI participant names', () => {
    expect(
      formatCombatCliOutcome(
        {
          status: 'resolved',
          winningTeamId: 'team_player',
        },
        COMBAT_RESOLVED_SHEETS,
      ),
    ).toBe('resolved, winner: Training Vanguard');
  });
});

describe('formatCombatCliEndSummary', () => {
  it('returns restart guidance for resolved combat', () => {
    expect(
      formatCombatCliEndSummary(
        {
          status: 'resolved',
          winningTeamId: 'team_player',
        },
        COMBAT_RESOLVED_SHEETS,
      ),
    ).toBe('Combat resolved: Training Vanguard wins. Type restart to play again.');
  });

  it('does not summarize ongoing combat', () => {
    expect(
      formatCombatCliEndSummary(
        {
          status: 'ongoing',
          activeTeamIds: ['team_player', 'team_opponent'],
        },
        COMBAT_RESOLVED_SHEETS,
      ),
    ).toBeUndefined();
  });
});
