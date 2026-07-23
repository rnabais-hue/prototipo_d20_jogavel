import { describe, expect, it } from 'vitest';
import {
  COMBAT_CLI_ACTORS,
  COMBAT_CLI_ENCOUNTER_PRESETS,
  DEFAULT_COMBAT_CLI_ENCOUNTER_ID,
  getCombatCliEncounterPreset,
  resolveCombatCliEncounterPreset,
  resolveCombatCliSheets,
} from './combatCliPresets';

describe('resolveCombatCliSheets', () => {
  it('resolves melee from attribute, half level, and trained bonus', () => {
    const [player] = resolveCombatCliSheets([COMBAT_CLI_ACTORS.player]);

    expect(player?.level).toBe(1);
    expect(player?.halfLevel).toBe(0);
    expect(player?.attributes.strength).toBe(3);

    const melee = player?.skills.find((skill) => skill.skillId === 'melee');
    expect(melee).toMatchObject({
      displayName: 'Luta',
      attributeKey: 'strength',
      attributeModifier: 3,
      halfLevel: 0,
      trainingBonus: 2,
      totalModifier: 5,
    });

    expect(player?.actions[0]?.checkModifier).toBe(5);
    expect(player?.actions[0]?.weapon).toEqual({
      weaponId: 'practice-blade',
      label: 'Training Blade',
      rangeProfile: { band: 'melee', maximumDistance: 1 },
    });
  });

  it('resolves the player ability from CLI-side resource and action data', () => {
    const [player] = resolveCombatCliSheets([COMBAT_CLI_ACTORS.player]);
    const ability = player?.abilities[0];

    expect(ability).toMatchObject({
      abilityId: 'focused_drive',
      label: 'Focused Drive',
      cost: {
        resourceId: 'power',
        resourceLabel: 'PM',
        amount: 2,
      },
      action: {
        label: 'Focused Drive',
        skillId: 'melee',
        skillDisplayName: 'Luta',
        checkModifier: 5,
        damageBase: 6,
        weapon: {
          weaponId: 'practice-blade',
          rangeProfile: { band: 'melee', maximumDistance: 1 },
        },
      },
    });
  });

  it('resolves the opponent action through its configured weapon', () => {
    const [, opponent] = resolveCombatCliSheets([
      COMBAT_CLI_ACTORS.player,
      COMBAT_CLI_ACTORS.opponent,
    ]);
    expect(opponent?.actions[0]?.weapon).toMatchObject({
      weaponId: 'practice-crossbow',
      rangeProfile: { band: 'short', maximumDistance: 4 },
    });
  });

  it('rejects an action referencing an unknown weapon', () => {
    const actor = {
      ...COMBAT_CLI_ACTORS.player,
      sheet: {
        ...COMBAT_CLI_ACTORS.player.sheet,
        actions: [{ ...COMBAT_CLI_ACTORS.player.sheet.actions[0], weaponId: 'missing' }],
      },
    };
    expect(() => resolveCombatCliSheets([actor])).toThrowError(
      'Missing CLI resolved weapon missing for action basic_strike',
    );
  });

  it('rejects an ability action referencing an unknown weapon', () => {
    const ability = COMBAT_CLI_ACTORS.player.sheet.abilities[0];
    const actor = {
      ...COMBAT_CLI_ACTORS.player,
      sheet: {
        ...COMBAT_CLI_ACTORS.player.sheet,
        abilities: [{ ...ability, action: { ...ability.action, weaponId: 'missing' } }],
      },
    };
    expect(() => resolveCombatCliSheets([actor])).toThrowError(
      'Missing CLI resolved weapon missing for action basic_strike',
    );
  });

  it('rejects duplicate weapon ids', () => {
    const weapon = COMBAT_CLI_ACTORS.player.sheet.weapons[0];
    const actor = {
      ...COMBAT_CLI_ACTORS.player,
      sheet: { ...COMBAT_CLI_ACTORS.player.sheet, weapons: [weapon, weapon] },
    };
    expect(() => resolveCombatCliSheets([actor])).toThrowError(
      'Duplicate CLI weapon id: practice-blade',
    );
  });
});

describe('combat CLI encounter presets', () => {
  it('keeps the original training duel as the default encounter', () => {
    const preset = getCombatCliEncounterPreset(DEFAULT_COMBAT_CLI_ENCOUNTER_ID);

    expect(preset).toMatchObject({
      id: 'training-duel',
      label: 'Training Duel',
    });
    expect(preset?.participants.map((participant) => participant.displayName)).toEqual([
      'Training Vanguard',
      'Practice Raider',
    ]);
  });

  it('lists a second encounter preset for short combat checks', () => {
    expect(COMBAT_CLI_ENCOUNTER_PRESETS.map((preset) => preset.id)).toEqual([
      'training-duel',
      'quick-check',
      'challenging-duel',
    ]);
  });

  it('resolves quick-check with a weaker opponent without changing the player sheet', () => {
    const quickCheck = getCombatCliEncounterPreset('quick-check');

    expect(quickCheck).toBeDefined();
    if (!quickCheck) {
      return;
    }

    const resolved = resolveCombatCliEncounterPreset(quickCheck);
    const [player, opponent] = resolved.sheets;

    expect(player?.displayName).toBe('Training Vanguard');
    expect(player?.life.maximum).toBe(12);
    expect(opponent).toMatchObject({
      displayName: 'Bruised Raider',
      life: {
        maximum: 4,
      },
      defense: {
        label: 'Guard',
        value: 9,
      },
    });
    expect(opponent?.actions[0]).toMatchObject({
      label: 'Weak Shot',
      checkModifier: 1,
      damageBase: 2,
    });
  });

  it('returns undefined for unknown encounter preset ids', () => {
    expect(getCombatCliEncounterPreset('missing')).toBeUndefined();
  });
});
