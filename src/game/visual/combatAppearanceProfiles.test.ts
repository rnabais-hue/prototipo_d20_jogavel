import { describe, expect, it } from 'vitest';
import { VISUAL_ASSET_KEYS } from './assetKeys';
import {
  COMBAT_APPEARANCE_ANIMATIONS,
  getRequestedCombatAppearanceId,
  resolveCombatAppearanceLayers,
  resolveCombatAppearanceProfile,
} from './combatAppearanceProfiles';

describe('combat appearance profiles', () => {
  it('resolves ordered modular layers without branching on equipment ids', () => {
    const profile = resolveCombatAppearanceProfile('player', 'combat.player.sword');

    expect(resolveCombatAppearanceLayers(profile)).toEqual([
      { slot: 'body', textureKey: VISUAL_ASSET_KEYS.combatPlayerBody },
      { slot: 'mainHand', textureKey: VISUAL_ASSET_KEYS.combatPlayerMainHandSword },
    ]);
  });

  it('changes the demonstrated main hand through profile data only', () => {
    const sword = resolveCombatAppearanceProfile('player', 'combat.player.sword');
    const spear = resolveCombatAppearanceProfile('player', 'combat.player.spear');

    expect(spear).toEqual({
      ...sword,
      id: 'combat.player.spear',
      mainHand: VISUAL_ASSET_KEYS.combatPlayerMainHandSpear,
    });
  });

  it('rejects a profile for the wrong visual role and falls back deterministically', () => {
    expect(resolveCombatAppearanceProfile('enemy', 'combat.player.spear').id).toBe(
      'combat.enemy.axe',
    );
  });

  it('reads the optional visual profile override from a generic query parameter', () => {
    expect(
      getRequestedCombatAppearanceId(
        '?visual.player=combat.player.spear',
        'player',
      ),
    ).toBe('combat.player.spear');
  });

  it('keeps every visible state on one four-frame clock', () => {
    for (const animation of Object.values(COMBAT_APPEARANCE_ANIMATIONS)) {
      expect(animation.frames).toHaveLength(4);
    }
  });
});
