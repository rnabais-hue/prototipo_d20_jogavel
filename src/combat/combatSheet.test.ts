import { describe, expect, it } from 'vitest';
import {
  COMBAT_ACTORS,
  COMBAT_ENCOUNTER_PRESETS,
  DEFAULT_COMBAT_ENCOUNTER_ID,
} from '../content/combatPresets';
import {
  getCombatEncounterPreset,
  resolveCombatEncounterPreset,
  resolveCombatSheets,
} from './combatSheet';

describe('resolveCombatSheets', () => {
  it('resolves melee from attribute, half level, and trained bonus', () => {
    const [player] = resolveCombatSheets([COMBAT_ACTORS.player]);

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
    const [player] = resolveCombatSheets([COMBAT_ACTORS.player]);
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
    const [, opponent] = resolveCombatSheets([
      COMBAT_ACTORS.player,
      COMBAT_ACTORS.opponent,
    ]);
    expect(opponent?.actions[0]?.weapon).toMatchObject({
      weaponId: 'practice-crossbow',
      rangeProfile: { band: 'short', maximumDistance: 4 },
    });
  });

  it('rejects an action referencing an unknown weapon', () => {
    const actor = {
      ...COMBAT_ACTORS.player,
      sheet: {
        ...COMBAT_ACTORS.player.sheet,
        actions: [{ ...COMBAT_ACTORS.player.sheet.actions[0], weaponId: 'missing' }],
      },
    };
    expect(() => resolveCombatSheets([actor])).toThrowError(
      'Missing CLI resolved weapon missing for action basic_strike',
    );
  });

  it('rejects an ability action referencing an unknown weapon', () => {
    const ability = COMBAT_ACTORS.player.sheet.abilities[0];
    const actor = {
      ...COMBAT_ACTORS.player,
      sheet: {
        ...COMBAT_ACTORS.player.sheet,
        abilities: [{ ...ability, action: { ...ability.action, weaponId: 'missing' } }],
      },
    };
    expect(() => resolveCombatSheets([actor])).toThrowError(
      'Missing CLI resolved weapon missing for action basic_strike',
    );
  });

  it('rejects duplicate weapon ids', () => {
    const weapon = COMBAT_ACTORS.player.sheet.weapons[0];
    const actor = {
      ...COMBAT_ACTORS.player,
      sheet: { ...COMBAT_ACTORS.player.sheet, weapons: [weapon, weapon] },
    };
    expect(() => resolveCombatSheets([actor])).toThrowError(
      'Duplicate CLI weapon id: practice-blade',
    );
  });
});

describe('combat CLI encounter presets', () => {
  it('keeps the original training duel as the default encounter', () => {
    const preset = getCombatEncounterPreset(DEFAULT_COMBAT_ENCOUNTER_ID);

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
    expect(COMBAT_ENCOUNTER_PRESETS.map((preset) => preset.id)).toEqual([
      'training-duel',
      'quick-check',
      'challenging-duel',
    ]);
  });

  it('resolves quick-check with a weaker opponent without changing the player sheet', () => {
    const quickCheck = getCombatEncounterPreset('quick-check');

    expect(quickCheck).toBeDefined();
    if (!quickCheck) {
      return;
    }

    const resolved = resolveCombatEncounterPreset(quickCheck);
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
    expect(getCombatEncounterPreset('missing')).toBeUndefined();
  });
});
