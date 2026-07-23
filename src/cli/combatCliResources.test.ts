import { describe, expect, it } from 'vitest';
import { COMBAT_CLI_ACTORS, resolveCombatCliSheets } from './combatCliPresets';
import {
  canSpendCombatCliResource,
  createCombatCliResourceState,
  getCombatCliResource,
  spendCombatCliResource,
} from './combatCliResources';

describe('createCombatCliResourceState', () => {
  it('initializes current resource values from resolved sheet maximums', () => {
    const [player] = resolveCombatCliSheets([COMBAT_CLI_ACTORS.player]);
    const resources = createCombatCliResourceState(player ? [player] : []);
    const resource = getCombatCliResource(
      resources,
      COMBAT_CLI_ACTORS.player.participantId,
      'power',
    );

    expect(resource).toMatchObject({
      label: 'PM',
      current: 6,
      maximum: 6,
    });
  });
});

describe('spendCombatCliResource', () => {
  it('spends resources immutably when enough current value exists', () => {
    const [player] = resolveCombatCliSheets([COMBAT_CLI_ACTORS.player]);
    const resources = createCombatCliResourceState(player ? [player] : []);

    const result = spendCombatCliResource(
      resources,
      COMBAT_CLI_ACTORS.player.participantId,
      'power',
      2,
    );

    expect(result).toMatchObject({
      ok: true,
      resource: {
        label: 'PM',
        current: 4,
        maximum: 6,
      },
    });
    expect(
      getCombatCliResource(
        resources,
        COMBAT_CLI_ACTORS.player.participantId,
        'power',
      )?.current,
    ).toBe(6);
    expect(
      result.ok
        ? getCombatCliResource(
            result.resources,
            COMBAT_CLI_ACTORS.player.participantId,
            'power',
          )?.current
        : undefined,
    ).toBe(4);
  });
  it('reports insufficient resources without changing state', () => {
    const [player] = resolveCombatCliSheets([COMBAT_CLI_ACTORS.player]);
    const resources = createCombatCliResourceState(player ? [player] : []);

    expect(
      canSpendCombatCliResource(
        resources,
        COMBAT_CLI_ACTORS.player.participantId,
        'power',
        7,
      ),
    ).toBe(false);

    const result = spendCombatCliResource(
      resources,
      COMBAT_CLI_ACTORS.player.participantId,
      'power',
      7,
    );

    expect(result).toEqual({
      ok: false,
      error: {
        code: 'insufficient_resource',
        participantId: COMBAT_CLI_ACTORS.player.participantId,
        resourceId: 'power',
        current: 6,
        cost: 7,
      },
    });
    expect(
      getCombatCliResource(
        resources,
        COMBAT_CLI_ACTORS.player.participantId,
        'power',
      )?.current,
    ).toBe(6);
  });
});