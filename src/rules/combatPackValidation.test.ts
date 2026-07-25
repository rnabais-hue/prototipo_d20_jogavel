import { describe, expect, it } from 'vitest';
import {
  validateCombatPack,
  validateContentPack,
  validateTacticalCatalogs,
  type CombatPack,
  type ContentPackCatalogs,
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

// A minimal, self-contained valid tactical catalog set. Identifiers are arbitrary
// placeholders and the declared attribute keys arrive as data, not literals.
function createValidCatalogs(): ContentPackCatalogs {
  return {
    attributeKeys: ['power', 'reflex'],
    ancestries: [
      {
        id: 'stone_origin',
        attributeModifiers: { power: 1 },
        grantedFeatureIds: ['steady'],
        grantedActionIds: ['guard'],
      },
    ],
    archetypes: [
      {
        id: 'vanguard',
        attributeModifiers: { reflex: 1 },
        grantedFeatureIds: ['steady'],
        grantedActionIds: ['strike'],
        startingEquipmentIds: ['blade'],
      },
    ],
    attributePresets: [
      {
        id: 'even_start',
        attributes: { power: 1, reflex: 1 },
      },
    ],
    features: [{ id: 'steady' }],
    equipment: [
      { id: 'blade', attributeModifiers: { power: 1 }, grantedActionIds: ['strike'] },
    ],
    actions: [{ id: 'strike' }, { id: 'guard' }],
  };
}

describe('validateTacticalCatalogs', () => {
  it('accepts a fully consistent catalog set', () => {
    const result = validateTacticalCatalogs(createValidCatalogs());
    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('flags an attribute preset referencing an unknown attribute key', () => {
    const catalogs = createValidCatalogs();
    catalogs.attributePresets = [
      { id: 'even_start', attributes: { power: 1, reflex: 1, luck: 1 } },
    ];

    const result = validateTacticalCatalogs(catalogs);
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'unknown_attribute_key',
        scope: 'attributePreset:even_start',
        id: 'luck',
      }),
    );
  });

  it('flags a modifier referencing an unknown attribute key', () => {
    const catalogs = createValidCatalogs();
    catalogs.equipment = [
      { id: 'blade', attributeModifiers: { luck: 1 }, grantedActionIds: ['strike'] },
    ];

    const result = validateTacticalCatalogs(catalogs);
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'unknown_attribute_key',
        scope: 'equipment:blade.modifier',
        id: 'luck',
      }),
    );
  });

  it('flags a complete attribute preset missing a declared canonical key', () => {
    const catalogs = createValidCatalogs();
    catalogs.attributePresets = [{ id: 'even_start', attributes: { power: 1 } }];

    const result = validateTacticalCatalogs(catalogs);
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'missing_attribute_key',
        scope: 'attributePreset:even_start',
        id: 'reflex',
      }),
    );
  });

  it('flags an unknown feature id granted by an ancestry or archetype', () => {
    const catalogs = createValidCatalogs();
    catalogs.archetypes[0]!.grantedFeatureIds = ['missing_feature'];

    const result = validateTacticalCatalogs(catalogs);
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'unknown_feature_id',
        scope: 'archetype:vanguard',
        id: 'missing_feature',
      }),
    );
  });

  it('flags an unknown equipment id listed as archetype starting equipment', () => {
    const catalogs = createValidCatalogs();
    catalogs.archetypes[0]!.startingEquipmentIds = ['missing_equipment'];

    const result = validateTacticalCatalogs(catalogs);
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'unknown_equipment_id',
        scope: 'archetype:vanguard',
        id: 'missing_equipment',
      }),
    );
  });

  it('flags an unknown action id granted by ancestry, archetype, or equipment', () => {
    const catalogs = createValidCatalogs();
    catalogs.equipment[0]!.grantedActionIds = ['missing_action'];

    const result = validateTacticalCatalogs(catalogs);
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'unknown_action_id',
        scope: 'equipment:blade',
        id: 'missing_action',
      }),
    );
  });

  it('flags a duplicate id within a catalog collection', () => {
    const catalogs = createValidCatalogs();
    catalogs.features = [{ id: 'steady' }, { id: 'steady' }];

    const result = validateTacticalCatalogs(catalogs);
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'duplicate_id', scope: 'features', id: 'steady' }),
    );
  });
});

describe('validateContentPack', () => {
  it('accepts a valid unified pack of combat data and tactical catalogs', () => {
    const result = validateContentPack({
      combat: createValidPack(),
      catalogs: createValidCatalogs(),
    });
    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('merges issues from both halves into one result', () => {
    const combat = createValidPack();
    combat.actors[0]!.sheet.actions[0]!.weaponId = 'missing_weapon';
    const catalogs = createValidCatalogs();
    catalogs.archetypes[0]!.startingEquipmentIds = ['missing_equipment'];

    const result = validateContentPack({ combat, catalogs });
    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['unknown_weapon_id', 'unknown_equipment_id']),
    );
  });
});
