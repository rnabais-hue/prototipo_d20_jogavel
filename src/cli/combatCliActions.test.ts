import { describe, expect, it } from 'vitest';
import { COMBAT_CLI_RESOLVED_SHEETS } from './combatCliPresets';
import { createCombatCliResourceState, spendCombatCliResource } from './combatCliResources';
import { formatCombatCliActionMenu } from './combatCliActions';

describe('formatCombatCliActionMenu', () => {
  it('shows the player basic action, ability, PM availability, and manual roll examples', () => {
    const [player] = COMBAT_CLI_RESOLVED_SHEETS;
    const resources = createCombatCliResourceState(COMBAT_CLI_RESOLVED_SHEETS);

    expect(formatCombatCliActionMenu({ sheet: player, resources })).toEqual([
      'Actions for Training Vanguard:',
      '  attack [roll] - Practice Strike: Luta +5, damage base 4. Example: attack 15',
      '  attack [roll] - Crossbow Strike: Luta +5, damage base 4. Example: attack 15',
      '  attack [roll] - Bow Strike: Luta +5, damage base 4. Example: attack 15',
      '  ability [roll] - Focused Drive: costs 2 PM (6/6 available), Luta +5, damage base 6. Example: ability 15',
      '  done - end your turn, then auto-run the opponent if it becomes active.',
      '  status - show current life, resources, sheet essentials, and outcome.',
    ]);
  });

  it('uses live resources when PM has changed', () => {
    const [player] = COMBAT_CLI_RESOLVED_SHEETS;
    const spent = spendCombatCliResource(
      createCombatCliResourceState(COMBAT_CLI_RESOLVED_SHEETS),
      player.participantId,
      'power',
      2,
    );

    expect(spent.ok).toBe(true);
    if (!spent.ok) {
      return;
    }

    expect(formatCombatCliActionMenu({ sheet: player, resources: spent.resources })).toContain(
      '  ability [roll] - Focused Drive: costs 2 PM (4/6 available), Luta +5, damage base 6. Example: ability 15',
    );
  });

  it('shows that an actor without abilities cannot use ability', () => {
    const [, opponent] = COMBAT_CLI_RESOLVED_SHEETS;

    expect(formatCombatCliActionMenu({ sheet: opponent })).toContain(
      '  ability [roll] - no ability available for this actor.',
    );
  });
});
