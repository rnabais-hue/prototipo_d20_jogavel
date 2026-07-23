import { describe, expect, it } from 'vitest';
import { COMBAT_ACTORS, resolveCombatSheets } from '../content/combatPresets';
import {
  canSpendCombatResource,
  createCombatResourceState,
  getCombatResource,
  spendCombatResource,
} from './combatResources';

describe('createCombatResourceState', () => {
  it('initializes current resource values from resolved sheet maximums', () => {
    const [player] = resolveCombatSheets([COMBAT_ACTORS.player]);
    const resources = createCombatResourceState(player ? [player] : []);
    const resource = getCombatResource(
      resources,
      COMBAT_ACTORS.player.participantId,
      'power',
    );

    expect(resource).toMatchObject({
      label: 'PM',
      current: 6,
      maximum: 6,
    });
  });
});

describe('spendCombatResource', () => {
  it('spends resources immutably when enough current value exists', () => {
    const [player] = resolveCombatSheets([COMBAT_ACTORS.player]);
    const resources = createCombatResourceState(player ? [player] : []);

    const result = spendCombatResource(
      resources,
      COMBAT_ACTORS.player.participantId,
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
      getCombatResource(
        resources,
        COMBAT_ACTORS.player.participantId,
        'power',
      )?.current,
    ).toBe(6);
    expect(
      result.ok
        ? getCombatResource(
            result.resources,
            COMBAT_ACTORS.player.participantId,
            'power',
          )?.current
        : undefined,
    ).toBe(4);
  });
  it('reports insufficient resources without changing state', () => {
    const [player] = resolveCombatSheets([COMBAT_ACTORS.player]);
    const resources = createCombatResourceState(player ? [player] : []);

    expect(
      canSpendCombatResource(
        resources,
        COMBAT_ACTORS.player.participantId,
        'power',
        7,
      ),
    ).toBe(false);

    const result = spendCombatResource(
      resources,
      COMBAT_ACTORS.player.participantId,
      'power',
      7,
    );

    expect(result).toEqual({
      ok: false,
      error: {
        code: 'insufficient_resource',
        participantId: COMBAT_ACTORS.player.participantId,
        resourceId: 'power',
        current: 6,
        cost: 7,
      },
    });
    expect(
      getCombatResource(
        resources,
        COMBAT_ACTORS.player.participantId,
        'power',
      )?.current,
    ).toBe(6);
  });
});