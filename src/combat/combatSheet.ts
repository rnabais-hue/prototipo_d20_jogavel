import {
  COMBAT_ENCOUNTER_PRESETS,
  COMBAT_PARTICIPANTS,
  COMBAT_SKILL_DEFINITIONS,
  type CombatAbilityPreset,
  type CombatActionPreset,
  type CombatActorPreset,
  type CombatAttributeKey,
  type CombatAttributeSet,
  type CombatEncounterPreset,
  type CombatResourcePreset,
  type CombatSheetPreset,
  type CombatSkillDefinition,
  type CombatSkillId,
  type CombatSkillTrainingPreset,
  type CombatWeaponPreset,
} from '../content/combatPresets';
import {
  getCombatWeaponRangeProfile,
  isCombatWeaponRangeBand,
  type CombatWeaponRangeProfile,
} from './combatWeaponRange';

export type CombatResolvedEncounterPreset = {
  id: string;
  label: string;
  description: string;
  sheets: readonly CombatResolvedSheet[];
};

export type CombatResolvedSheet = {
  participantId: string;
  displayName: string;
  teamId: string;
  level: number;
  halfLevel: number;
  attributes: CombatAttributeSet;
  life: {
    maximum: number;
  };
  resources: readonly CombatResolvedResource[];
  defense: {
    label: string;
    value: number;
  };
  skills: readonly CombatResolvedSkill[];
  weapons: readonly CombatResolvedWeapon[];
  actions: readonly CombatResolvedAction[];
  abilities: readonly CombatResolvedAbility[];
};

export type CombatResolvedResource = {
  id: string;
  label: string;
  current: number;
  maximum: number;
};

export type CombatResolvedSkill = {
  skillId: CombatSkillId;
  displayName: string;
  attributeKey: CombatAttributeKey;
  attributeModifier: number;
  halfLevel: number;
  trainingBonus: number;
  totalModifier: number;
};

export type CombatResolvedAction = {
  actionId: string;
  label: string;
  kind: 'main';
  weapon: CombatResolvedWeapon;
  skillId: CombatSkillId;
  skillDisplayName: string;
  checkModifier: number;
  damageBase: number;
};

export type CombatResolvedWeapon = { weaponId: string; label: string; rangeProfile: CombatWeaponRangeProfile };

export type CombatResolvedAbility = {
  abilityId: string;
  label: string;
  cost: {
    resourceId: string;
    resourceLabel: string;
    amount: number;
  };
  action: CombatResolvedAction;
};

const TRAINED_SKILL_BONUS = 2;

export const COMBAT_RESOLVED_SHEETS = resolveCombatSheets(
  COMBAT_PARTICIPANTS,
);

export function getCombatEncounterPreset(
  encounterId: string,
): CombatEncounterPreset | undefined {
  return COMBAT_ENCOUNTER_PRESETS.find((preset) => preset.id === encounterId);
}

export function resolveCombatEncounterPreset(
  preset: CombatEncounterPreset,
): CombatResolvedEncounterPreset {
  return {
    id: preset.id,
    label: preset.label,
    description: preset.description,
    sheets: resolveCombatSheets(preset.participants),
  };
}

export function resolveCombatSheets(
  presets: readonly CombatActorPreset[],
): readonly CombatResolvedSheet[] {
  return presets.map(resolveCombatSheet);
}

function resolveCombatSheet(preset: CombatActorPreset): CombatResolvedSheet {
  const halfLevel = Math.floor(preset.sheet.level / 2);
  const skills = preset.sheet.skills.map((skill) =>
    resolveCombatSkill(preset.sheet, skill, halfLevel),
  );
  const weapons = resolveCombatWeapons(preset.sheet.weapons);

  return {
    participantId: preset.participantId,
    displayName: preset.displayName,
    teamId: preset.teamId,
    level: preset.sheet.level,
    halfLevel,
    attributes: { ...preset.sheet.attributes },
    life: {
      maximum: preset.sheet.life.maximum,
    },
    resources: preset.sheet.resources.map(resolveCombatResource),
    defense: {
      label: preset.sheet.defense.label,
      value:
        preset.sheet.defense.base +
        preset.sheet.attributes[preset.sheet.defense.attributeKey],
    },
    skills,
    weapons,
    actions: preset.sheet.actions.map((action) => {
      const skill = getResolvedSkill(skills, action.check.skillId);

      return resolveCombatAction(preset.sheet, action, skill, weapons);
    }),
    abilities: preset.sheet.abilities.map((ability) =>
      resolveCombatAbility(preset.sheet, ability, skills, weapons),
    ),
  };
}

function resolveCombatAction(
  sheet: CombatSheetPreset,
  action: CombatActionPreset,
  skill: CombatResolvedSkill,
  weapons: readonly CombatResolvedWeapon[],
): CombatResolvedAction {
  const weapon = getResolvedWeapon(weapons, action.weaponId, `action ${action.actionId}`);
  return {
    actionId: action.actionId,
    label: action.label,
    kind: action.kind,
    weapon,
    skillId: skill.skillId,
    skillDisplayName: skill.displayName,
    checkModifier: skill.totalModifier,
    damageBase: action.damage.base + sheet.attributes[action.damage.attributeKey],
  };
}

function resolveCombatAbility(
  sheet: CombatSheetPreset,
  ability: CombatAbilityPreset,
  skills: readonly CombatResolvedSkill[],
  weapons: readonly CombatResolvedWeapon[],
): CombatResolvedAbility {
  const resource = sheet.resources.find(
    (entry) => entry.id === ability.cost.resourceId,
  );
  if (!resource) {
    throw new Error(
      `Missing CLI resource ${ability.cost.resourceId} for ability ${ability.abilityId}`,
    );
  }

  if (!Number.isInteger(ability.cost.amount) || ability.cost.amount < 0) {
    throw new Error(
      `Invalid CLI ability cost for ${ability.abilityId}: ${ability.cost.amount}`,
    );
  }

  const skill = getResolvedSkill(skills, ability.action.check.skillId);

  return {
    abilityId: ability.abilityId,
    label: ability.label,
    cost: {
      resourceId: ability.cost.resourceId,
      resourceLabel: resource.label,
      amount: ability.cost.amount,
    },
    action: resolveCombatAction(sheet, ability.action, skill, weapons),
  };
}

function resolveCombatWeapons(weapons: readonly CombatWeaponPreset[]): readonly CombatResolvedWeapon[] {
  const seen = new Set<string>();
  return weapons.map((weapon) => {
    if (seen.has(weapon.weaponId)) throw new Error(`Duplicate CLI weapon id: ${weapon.weaponId}`);
    seen.add(weapon.weaponId);
    if (!isCombatWeaponRangeBand(weapon.rangeBand)) {
      throw new Error(`Invalid CLI weapon range band for ${weapon.weaponId}: ${String(weapon.rangeBand)}`);
    }
    return { weaponId: weapon.weaponId, label: weapon.label, rangeProfile: getCombatWeaponRangeProfile(weapon.rangeBand) };
  });
}

function getResolvedWeapon(weapons: readonly CombatResolvedWeapon[], weaponId: string, owner: string): CombatResolvedWeapon {
  const weapon = weapons.find((entry) => entry.weaponId === weaponId);
  if (!weapon) throw new Error(`Missing CLI resolved weapon ${weaponId} for ${owner}`);
  return weapon;
}

function resolveCombatResource(
  resource: CombatResourcePreset,
): CombatResolvedResource {
  if (!Number.isInteger(resource.maximum) || resource.maximum < 0) {
    throw new Error(
      `Invalid CLI resource maximum for ${resource.id}: ${resource.maximum}`,
    );
  }

  return {
    id: resource.id,
    label: resource.label,
    current: resource.maximum,
    maximum: resource.maximum,
  };
}

function resolveCombatSkill(
  sheet: CombatSheetPreset,
  skill: CombatSkillTrainingPreset,
  halfLevel: number,
): CombatResolvedSkill {
  const definition = getSkillDefinition(skill.skillId);
  const attributeModifier = sheet.attributes[definition.attributeKey];
  const trainingBonus = skill.trained ? TRAINED_SKILL_BONUS : 0;

  return {
    skillId: definition.id,
    displayName: definition.displayName,
    attributeKey: definition.attributeKey,
    attributeModifier,
    halfLevel,
    trainingBonus,
    totalModifier: attributeModifier + halfLevel + trainingBonus,
  };
}

function getSkillDefinition(skillId: CombatSkillId): CombatSkillDefinition {
  const definition = COMBAT_SKILL_DEFINITIONS.find(
    (entry) => entry.id === skillId,
  );
  if (!definition) {
    throw new Error(`Missing CLI skill definition for ${skillId}`);
  }

  return definition;
}

function getResolvedSkill(
  skills: readonly CombatResolvedSkill[],
  skillId: CombatSkillId,
): CombatResolvedSkill {
  const skill = skills.find((entry) => entry.skillId === skillId);
  if (!skill) {
    throw new Error(`Missing CLI resolved skill for ${skillId}`);
  }

  return skill;
}
