import { describe, expect, it } from 'vitest';
import {
  validateCombatPack,
  type CombatPack,
} from './combatPackValidation';

// A minimal, self-contained valid pack. Identifiers are arbitrary placeholders,
// obtained from this fixture rather than written as engine literals.
function createValidPack(): CombatPack {
  return {
    attributeKeys: ['power', 'reflex'],
    skills: [{ id: 'brawl', attributeKey: 'power' }],
    actors: [
      {
        participantId: 'hero',
        sheet: {
          defense: { attributeKey: 'reflex' },
          resources: [{ id: 'focus' }],
          skills: [{ skillId: 'brawl' }],
          weapons: [{ weaponId: 'blade' }],
          actions: [
            {
              actionId: 'strike',
              weaponId: 'blade',
              check: { skillId: 'brawl' },
              damage: { attributeKey: 'power' },
            },
          ],
          abilities: [
            {
              abilityId: 'surge',
              cost: { resourceId: 'focus' },
              action: {
                actionId: 'surge_strike',
                weaponId: 'blade',
                check: { skillId: 'brawl' },
                damage: { attributeKey: 'power' },
              },
            },
          ],
        },
      },
    ],
  };
}

describe('validateCombatPack', () => {
  it('accepts a fully consistent pack', () => {
    const result = validateCombatPack(createValidPack());
    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('flags a skill definition referencing an unknown attribute key', () => {
    const pack = createValidPack();
    pack.skills = [{ id: 'brawl', attributeKey: 'missing' }];

    const result = validateCombatPack(pack);
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'unknown_attribute_key',
        scope: 'skill:brawl',
        id: 'missing',
      }),
    );
  });

  it('flags a defense referencing an unknown attribute key', () => {
    const pack = createValidPack();
    pack.actors[0]!.sheet.defense = { attributeKey: 'missing' };

    const result = validateCombatPack(pack);
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'unknown_attribute_key',
        scope: 'hero.defense',
        id: 'missing',
      }),
    );
  });

  it('flags an action damage referencing an unknown attribute key', () => {
    const pack = createValidPack();
    pack.actors[0]!.sheet.actions[0]!.damage = { attributeKey: 'missing' };

    const result = validateCombatPack(pack);
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'unknown_attribute_key',
        scope: 'hero.action:strike',
        id: 'missing',
      }),
    );
  });

  it('flags an action referencing an unknown skill id', () => {
    const pack = createValidPack();
    pack.actors[0]!.sheet.actions[0]!.check = { skillId: 'missing' };

    const result = validateCombatPack(pack);
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'unknown_skill_id',
        scope: 'hero.action:strike',
        id: 'missing',
      }),
    );
  });

  it('flags an action referencing an unknown weapon id', () => {
    const pack = createValidPack();
    pack.actors[0]!.sheet.actions[0]!.weaponId = 'missing';

    const result = validateCombatPack(pack);
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'unknown_weapon_id',
        scope: 'hero.action:strike',
        id: 'missing',
      }),
    );
  });

  it('flags an ability cost referencing an unknown resource id', () => {
    const pack = createValidPack();
    pack.actors[0]!.sheet.abilities[0]!.cost = { resourceId: 'missing' };

    const result = validateCombatPack(pack);
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'unknown_resource_id',
        scope: 'hero.ability:surge',
        id: 'missing',
      }),
    );
  });

  it('validates identifiers reached through an ability action', () => {
    const pack = createValidPack();
    pack.actors[0]!.sheet.abilities[0]!.action.weaponId = 'missing';

    const result = validateCombatPack(pack);
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'unknown_weapon_id',
        scope: 'hero.ability:surge',
        id: 'missing',
      }),
    );
  });

  it('flags duplicate attribute keys', () => {
    const pack = createValidPack();
    pack.attributeKeys = ['power', 'power', 'reflex'];

    const result = validateCombatPack(pack);
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'duplicate_id', scope: 'attributeKeys', id: 'power' }),
    );
  });

  it('flags duplicate skill definitions', () => {
    const pack = createValidPack();
    pack.skills = [
      { id: 'brawl', attributeKey: 'power' },
      { id: 'brawl', attributeKey: 'power' },
    ];

    const result = validateCombatPack(pack);
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'duplicate_id', scope: 'skills', id: 'brawl' }),
    );
  });

  it('flags duplicate weapon ids within a sheet', () => {
    const pack = createValidPack();
    pack.actors[0]!.sheet.weapons = [{ weaponId: 'blade' }, { weaponId: 'blade' }];

    const result = validateCombatPack(pack);
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'duplicate_id', scope: 'hero.weapons', id: 'blade' }),
    );
  });

  it('reports every issue in one pass', () => {
    const pack = createValidPack();
    pack.actors[0]!.sheet.actions[0]!.weaponId = 'missing_weapon';
    pack.actors[0]!.sheet.abilities[0]!.cost = { resourceId: 'missing_resource' };

    const result = validateCombatPack(pack);
    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['unknown_weapon_id', 'unknown_resource_id']),
    );
  });
});
