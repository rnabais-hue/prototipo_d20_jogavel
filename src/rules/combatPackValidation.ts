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
