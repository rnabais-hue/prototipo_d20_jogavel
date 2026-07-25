// Load-time validation for the combat content pack.
//
// Content identifiers are open `string` values (decision 0048), so the compiler
// no longer rejects a preset that references an attribute, skill, weapon or
// resource that does not exist. This pure function restores that guarantee at
// the data boundary: it reads the shape of a pack and reports every dangling or
// duplicated identifier. It never throws and never writes to the console; it
// returns a structured result in the same style as the other `src/rules/`
// read models. The caller decides what to do with an invalid pack.
//
// The engine consumes the shape, never a specific value: the function is given
// the declared attribute keys and skill definitions as data and checks
// references against them. It hard-codes no content identifier.

export type CombatPackSkill = {
  id: string;
  attributeKey: string;
};

export type CombatPackAction = {
  actionId: string;
  weaponId: string;
  check: { skillId: string };
  damage: { attributeKey: string };
};

export type CombatPackAbility = {
  abilityId: string;
  cost: { resourceId: string };
  action: CombatPackAction;
};

export type CombatPackSheet = {
  defense: { attributeKey: string };
  resources: readonly { id: string }[];
  skills: readonly { skillId: string }[];
  weapons: readonly { weaponId: string }[];
  actions: readonly CombatPackAction[];
  abilities: readonly CombatPackAbility[];
};

export type CombatPackActor = {
  participantId: string;
  sheet: CombatPackSheet;
};

export type CombatPack = {
  attributeKeys: readonly string[];
  skills: readonly CombatPackSkill[];
  actors: readonly CombatPackActor[];
};

export type CombatPackIssueCode =
  | 'unknown_attribute_key'
  | 'unknown_skill_id'
  | 'unknown_weapon_id'
  | 'unknown_resource_id'
  | 'unknown_feature_id'
  | 'unknown_equipment_id'
  | 'unknown_action_id'
  | 'missing_attribute_key'
  | 'duplicate_id';

export type CombatPackIssue = {
  code: CombatPackIssueCode;
  // Where the offending identifier lives, e.g. `player_actor.action:basic_strike`.
  scope: string;
  // The offending identifier itself.
  id: string;
  // Human-readable explanation.
  reason: string;
};

export type CombatPackValidationResult = {
  ok: boolean;
  issues: readonly CombatPackIssue[];
};

export function validateCombatPack(pack: CombatPack): CombatPackValidationResult {
  const issues: CombatPackIssue[] = [];
  const attributeKeys = new Set(pack.attributeKeys);
  const skillIds = new Set(pack.skills.map((skill) => skill.id));

  for (const duplicate of findDuplicates(pack.attributeKeys)) {
    issues.push({
      code: 'duplicate_id',
      scope: 'attributeKeys',
      id: duplicate,
      reason: `attribute key "${duplicate}" is declared more than once`,
    });
  }

  for (const duplicate of findDuplicates(pack.skills.map((skill) => skill.id))) {
    issues.push({
      code: 'duplicate_id',
      scope: 'skills',
      id: duplicate,
      reason: `skill id "${duplicate}" is defined more than once`,
    });
  }

  for (const skill of pack.skills) {
    if (!attributeKeys.has(skill.attributeKey)) {
      issues.push({
        code: 'unknown_attribute_key',
        scope: `skill:${skill.id}`,
        id: skill.attributeKey,
        reason: `skill "${skill.id}" references unknown attribute key "${skill.attributeKey}"`,
      });
    }
  }

  for (const actor of pack.actors) {
    const scope = actor.participantId;
    const sheet = actor.sheet;
    const weaponIds = new Set(sheet.weapons.map((weapon) => weapon.weaponId));
    const resourceIds = new Set(sheet.resources.map((resource) => resource.id));

    collectDuplicates(issues, sheet.weapons.map((weapon) => weapon.weaponId), `${scope}.weapons`, 'weapon');
    collectDuplicates(issues, sheet.resources.map((resource) => resource.id), `${scope}.resources`, 'resource');
    collectDuplicates(issues, sheet.actions.map((action) => action.actionId), `${scope}.actions`, 'action');
    collectDuplicates(issues, sheet.abilities.map((ability) => ability.abilityId), `${scope}.abilities`, 'ability');
    collectDuplicates(issues, sheet.skills.map((training) => training.skillId), `${scope}.skills`, 'skill');

    if (!attributeKeys.has(sheet.defense.attributeKey)) {
      issues.push({
        code: 'unknown_attribute_key',
        scope: `${scope}.defense`,
        id: sheet.defense.attributeKey,
        reason: `defense on "${scope}" references unknown attribute key "${sheet.defense.attributeKey}"`,
      });
    }

    for (const training of sheet.skills) {
      if (!skillIds.has(training.skillId)) {
        issues.push({
          code: 'unknown_skill_id',
          scope: `${scope}.skills`,
          id: training.skillId,
          reason: `skill training on "${scope}" references unknown skill id "${training.skillId}"`,
        });
      }
    }

    const ownedActions: readonly { action: CombatPackAction; owner: string }[] = [
      ...sheet.actions.map((action) => ({ action, owner: `${scope}.action:${action.actionId}` })),
      ...sheet.abilities.map((ability) => ({ action: ability.action, owner: `${scope}.ability:${ability.abilityId}` })),
    ];

    for (const { action, owner } of ownedActions) {
      if (!skillIds.has(action.check.skillId)) {
        issues.push({
          code: 'unknown_skill_id',
          scope: owner,
          id: action.check.skillId,
          reason: `action on "${owner}" references unknown skill id "${action.check.skillId}"`,
        });
      }
      if (!weaponIds.has(action.weaponId)) {
        issues.push({
          code: 'unknown_weapon_id',
          scope: owner,
          id: action.weaponId,
          reason: `action on "${owner}" references unknown weapon id "${action.weaponId}"`,
        });
      }
      if (!attributeKeys.has(action.damage.attributeKey)) {
        issues.push({
          code: 'unknown_attribute_key',
          scope: owner,
          id: action.damage.attributeKey,
          reason: `damage on "${owner}" references unknown attribute key "${action.damage.attributeKey}"`,
        });
      }
    }

    for (const ability of sheet.abilities) {
      if (!resourceIds.has(ability.cost.resourceId)) {
        issues.push({
          code: 'unknown_resource_id',
          scope: `${scope}.ability:${ability.abilityId}`,
          id: ability.cost.resourceId,
          reason: `ability "${ability.abilityId}" on "${scope}" references unknown resource id "${ability.cost.resourceId}"`,
        });
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

// --- Tactical catalog structure ---------------------------------------------
//
// The content pack also declares the extensible catalog structure consumed by
// `buildTacticalParticipant`: ancestries, archetypes, attribute presets,
// features, equipment, and action definitions, with grant/start relationships
// between them. These validators cover that half of the unified pack against the
// same declared attribute-key set. They stay content-id agnostic: the declared
// keys arrive as data and no identifier is hard-coded.

type CatalogModifierOwner = {
  id: string;
  attributeModifiers?: Readonly<Record<string, unknown>>;
};

export type CatalogAncestry = CatalogModifierOwner & {
  grantedFeatureIds?: readonly string[];
  grantedActionIds?: readonly string[];
};

export type CatalogArchetype = CatalogModifierOwner & {
  grantedFeatureIds?: readonly string[];
  grantedActionIds?: readonly string[];
  startingEquipmentIds?: readonly string[];
};

export type CatalogAttributePreset = {
  id: string;
  attributes: Readonly<Record<string, number>>;
};

export type CatalogEquipment = CatalogModifierOwner & {
  grantedActionIds?: readonly string[];
};

export type ContentPackCatalogs = {
  attributeKeys: readonly string[];
  ancestries: readonly CatalogAncestry[];
  archetypes: readonly CatalogArchetype[];
  attributePresets: readonly CatalogAttributePreset[];
  features: readonly { id: string }[];
  equipment: readonly CatalogEquipment[];
  actions: readonly { id: string }[];
};

export function validateTacticalCatalogs(
  catalogs: ContentPackCatalogs,
): CombatPackValidationResult {
  const issues: CombatPackIssue[] = [];
  const attributeKeys = new Set(catalogs.attributeKeys);
  const featureIds = new Set(catalogs.features.map((feature) => feature.id));
  const equipmentIds = new Set(catalogs.equipment.map((entry) => entry.id));
  const actionIds = new Set(catalogs.actions.map((action) => action.id));

  collectDuplicates(issues, catalogs.ancestries.map((entry) => entry.id), 'ancestries', 'ancestry');
  collectDuplicates(issues, catalogs.archetypes.map((entry) => entry.id), 'archetypes', 'archetype');
  collectDuplicates(issues, catalogs.attributePresets.map((entry) => entry.id), 'attributePresets', 'attribute preset');
  collectDuplicates(issues, catalogs.features.map((entry) => entry.id), 'features', 'feature');
  collectDuplicates(issues, catalogs.equipment.map((entry) => entry.id), 'equipment', 'equipment');
  collectDuplicates(issues, catalogs.actions.map((entry) => entry.id), 'actions', 'action');

  for (const preset of catalogs.attributePresets) {
    const presetKeys = Object.keys(preset.attributes);
    const presetKeySet = new Set(presetKeys);
    for (const key of presetKeys) {
      if (!attributeKeys.has(key)) {
        issues.push({
          code: 'unknown_attribute_key',
          scope: `attributePreset:${preset.id}`,
          id: key,
          reason: `attribute preset "${preset.id}" references unknown attribute key "${key}"`,
        });
      }
    }
    for (const declared of catalogs.attributeKeys) {
      if (!presetKeySet.has(declared)) {
        issues.push({
          code: 'missing_attribute_key',
          scope: `attributePreset:${preset.id}`,
          id: declared,
          reason: `attribute preset "${preset.id}" is missing declared attribute key "${declared}"`,
        });
      }
    }
  }

  validateModifierKeys(issues, catalogs.ancestries, 'ancestry', attributeKeys);
  validateModifierKeys(issues, catalogs.archetypes, 'archetype', attributeKeys);
  validateModifierKeys(issues, catalogs.equipment, 'equipment', attributeKeys);

  validateReferenceIds(issues, catalogs.ancestries, 'ancestry', (entry) => entry.grantedFeatureIds, featureIds, 'unknown_feature_id', 'feature');
  validateReferenceIds(issues, catalogs.archetypes, 'archetype', (entry) => entry.grantedFeatureIds, featureIds, 'unknown_feature_id', 'feature');

  validateReferenceIds(issues, catalogs.archetypes, 'archetype', (entry) => entry.startingEquipmentIds, equipmentIds, 'unknown_equipment_id', 'equipment');

  validateReferenceIds(issues, catalogs.ancestries, 'ancestry', (entry) => entry.grantedActionIds, actionIds, 'unknown_action_id', 'action');
  validateReferenceIds(issues, catalogs.archetypes, 'archetype', (entry) => entry.grantedActionIds, actionIds, 'unknown_action_id', 'action');
  validateReferenceIds(issues, catalogs.equipment, 'equipment', (entry) => entry.grantedActionIds, actionIds, 'unknown_action_id', 'action');

  return { ok: issues.length === 0, issues };
}

// --- Unified content pack -----------------------------------------------------
//
// The single entry the load-time gate calls: it validates the combat preset data
// and the tactical catalog structure against one declared attribute-key set and
// merges their issues into one result. There is one gate, not two.

export type ContentPack = {
  combat: CombatPack;
  catalogs: ContentPackCatalogs;
};

export function validateContentPack(pack: ContentPack): CombatPackValidationResult {
  const combat = validateCombatPack(pack.combat);
  const catalogs = validateTacticalCatalogs(pack.catalogs);
  const issues = [...combat.issues, ...catalogs.issues];
  return { ok: issues.length === 0, issues };
}

function validateModifierKeys(
  issues: CombatPackIssue[],
  owners: readonly CatalogModifierOwner[],
  ownerLabel: string,
  attributeKeys: ReadonlySet<string>,
): void {
  for (const owner of owners) {
    if (!owner.attributeModifiers) {
      continue;
    }
    for (const key of Object.keys(owner.attributeModifiers)) {
      if (!attributeKeys.has(key)) {
        issues.push({
          code: 'unknown_attribute_key',
          scope: `${ownerLabel}:${owner.id}.modifier`,
          id: key,
          reason: `${ownerLabel} "${owner.id}" modifier references unknown attribute key "${key}"`,
        });
      }
    }
  }
}

function validateReferenceIds<T extends { id: string }>(
  issues: CombatPackIssue[],
  owners: readonly T[],
  ownerLabel: string,
  select: (owner: T) => readonly string[] | undefined,
  known: ReadonlySet<string>,
  code: CombatPackIssueCode,
  refLabel: string,
): void {
  for (const owner of owners) {
    for (const ref of select(owner) ?? []) {
      if (!known.has(ref)) {
        issues.push({
          code,
          scope: `${ownerLabel}:${owner.id}`,
          id: ref,
          reason: `${ownerLabel} "${owner.id}" references unknown ${refLabel} id "${ref}"`,
        });
      }
    }
  }
}

function collectDuplicates(
  issues: CombatPackIssue[],
  ids: readonly string[],
  scope: string,
  label: string,
): void {
  for (const duplicate of findDuplicates(ids)) {
    issues.push({
      code: 'duplicate_id',
      scope,
      id: duplicate,
      reason: `${label} id "${duplicate}" appears more than once in ${scope}`,
    });
  }
}

function findDuplicates(ids: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  }
  return [...duplicates];
}
