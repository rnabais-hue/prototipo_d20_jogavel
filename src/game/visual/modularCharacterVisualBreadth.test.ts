import { describe, expect, it } from 'vitest';
import { VISUAL_ASSET_KEYS } from './assetKeys';
import {
  COMBAT_APPEARANCE_PROFILES,
  COMBAT_FACINGS,
  MODULAR_CHARACTER_ALTERNATE_PROFILE_ID,
  MODULAR_CHARACTER_PRIMARY_PROFILE_IDS,
  getChangedAppearanceSlots,
  getCombatAppearanceProfileValidationIssues,
  resolveCombatAppearanceAnimation,
  resolveCombatAppearanceLayerPresentations,
  resolveCombatAppearanceLayers,
  resolveCombatAppearanceProfile,
  resolveCombatAppearanceProfileFrom,
  resolveFacingFromGridDelta,
  type CombatAppearanceProfile,
  type CombatFacing,
} from './combatAppearanceProfiles';

describe('modular character visual breadth', () => {
  it('maps cardinal grid deltas to presentation facings', () => {
    expect(resolveFacingFromGridDelta('south', { x: 0, y: -1 })).toBe('north');
    expect(resolveFacingFromGridDelta('south', { x: 1, y: 0 })).toBe('east');
    expect(resolveFacingFromGridDelta('north', { x: 0, y: 1 })).toBe('south');
    expect(resolveFacingFromGridDelta('south', { x: -1, y: 0 })).toBe('west');
  });

  it('retains the previous facing for a zero-length segment', () => {
    for (const facing of COMBAT_FACINGS) {
      expect(resolveFacingFromGridDelta(facing, { x: 0, y: 0 })).toBe(facing);
    }
  });

  it('rejects diagonal presentation input explicitly', () => {
    expect(() => resolveFacingFromGridDelta('south', { x: 1, y: -1 })).toThrow(
      /orthogonal/,
    );
  });

  it('validates three structurally complete primary identity profiles', () => {
    const profiles = MODULAR_CHARACTER_PRIMARY_PROFILE_IDS.map(
      (id) => COMBAT_APPEARANCE_PROFILES[id],
    );
    expect(profiles.map(getCombatAppearanceProfileValidationIssues)).toEqual([
      [],
      [],
      [],
    ]);
    const slots = new Set(profiles.flatMap((profile) =>
      resolveCombatAppearanceLayers(profile).map((layer) => layer.slot),
    ));
    expect(slots).toEqual(new Set([
      'body',
      'outfit',
      'mainHand',
      'offHand',
      'accessory',
    ]));
  });

  it('resolves animation data for every cardinal facing', () => {
    const profile = resolveCombatAppearanceProfile('player', 'combat.player.caster');
    const expected: Readonly<Record<CombatFacing, readonly number[]>> = {
      north: [6, 7, 6, 7],
      east: [2, 3, 2, 3],
      south: [0, 1, 0, 1],
      west: [4, 5, 4, 5],
    };
    for (const facing of COMBAT_FACINGS) {
      expect(resolveCombatAppearanceAnimation(profile, facing, 'movement').frames).toEqual(
        expected[facing],
      );
    }
  });

  it('keeps all visible layers synchronized to one facing animation', () => {
    const profile = resolveCombatAppearanceProfile('player', 'combat.player.specialist');
    const layers = resolveCombatAppearanceLayerPresentations(
      profile,
      'north',
      'attack',
    );
    expect(layers.map(({ animation, flipX }) => ({
      frames: animation.frames,
      duration: animation.duration,
      repeat: animation.repeat,
      flipX,
    }))).toEqual(
      layers.map(() => ({
        frames: [6, 7, 6, 7],
        duration: 320,
        repeat: 0,
        flipX: false,
      })),
    );
  });

  it('changes exactly one visual slot in the alternate loadout', () => {
    const primary = resolveCombatAppearanceProfile('player', 'combat.player.combatant');
    const alternate = resolveCombatAppearanceProfile(
      'player',
      MODULAR_CHARACTER_ALTERNATE_PROFILE_ID,
    );
    expect(getChangedAppearanceSlots(primary, alternate)).toEqual(['mainHand']);
    expect(alternate.mainHand).toBe(VISUAL_ASSET_KEYS.combatBreadthMainHandSpear);
  });

  it('resolves a test-only fourth profile through the generic data path', () => {
    const primary = resolveCombatAppearanceProfile('player', 'combat.player.combatant');
    const fourth = Object.freeze({
      ...primary,
      id: 'test.player.fourth-identity',
      mainHand: VISUAL_ASSET_KEYS.combatBreadthMainHandStaff,
    } satisfies CombatAppearanceProfile);
    const profiles = Object.freeze({ [fourth.id]: fourth });
    const resolved = resolveCombatAppearanceProfileFrom(
      profiles,
      { player: fourth.id, enemy: fourth.id },
      'player',
      fourth.id,
    );
    expect(resolved.id).toBe(fourth.id);
    expect(resolveCombatAppearanceLayers(resolved).map((layer) => layer.slot)).toEqual([
      'body',
      'outfit',
      'mainHand',
    ]);
    expect(resolveCombatAppearanceAnimation(resolved, 'west', 'idle').frames).toEqual([
      4,
      5,
      4,
      5,
    ]);
  });
});
