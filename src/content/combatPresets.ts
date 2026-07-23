import { COMBAT_FIXTURE_IDS } from '../rules/combatFixtures';
import { getCombatWeaponRangeProfile, isCombatWeaponRangeBand, type CombatWeaponRangeBand, type CombatWeaponRangeProfile } from '../combat/combatWeaponRange';

export type CombatActorPreset = {
  participantId: string;
  displayName: string;
  teamId: string;
  sheet: CombatSheetPreset;
};

export type CombatEncounterPreset = {
  id: string;
  label: string;
  description: string;
  participants: readonly CombatActorPreset[];
};

export type CombatResolvedEncounterPreset = {
  id: string;
  label: string;
  description: string;
  sheets: readonly CombatResolvedSheet[];
};

export type CombatAttributeKey =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma';

export type CombatAttributeSet = Record<CombatAttributeKey, number>;

export type CombatSkillId = 'melee';

export type CombatSkillDefinition = {
  id: CombatSkillId;
  displayName: string;
  attributeKey: CombatAttributeKey;
};

export type CombatSkillTrainingPreset = {
  skillId: CombatSkillId;
  trained: boolean;
};

export type CombatResourcePreset = {
  id: string;
  label: string;
  maximum: number;
};

export type CombatSheetPreset = {
  level: number;
  attributes: CombatAttributeSet;
  life: {
    maximum: number;
  };
  resources: readonly CombatResourcePreset[];
  defense: {
    label: string;
    base: number;
    attributeKey: CombatAttributeKey;
  };
  skills: readonly CombatSkillTrainingPreset[];
  weapons: readonly CombatWeaponPreset[];
  actions: readonly CombatActionPreset[];
  abilities: readonly CombatAbilityPreset[];
};

export type CombatActionPreset = {
  actionId: string;
  label: string;
  kind: 'main';
  weaponId: string;
  check: {
    skillId: CombatSkillId;
  };
  damage: {
    base: number;
    attributeKey: CombatAttributeKey;
  };
};

export type CombatWeaponPreset = { weaponId: string; label: string; rangeBand: CombatWeaponRangeBand };

export type CombatAbilityPreset = {
  abilityId: string;
  label: string;
  cost: {
    resourceId: string;
    amount: number;
  };
  action: CombatActionPreset;
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

export const COMBAT_SKILL_DEFINITIONS = [
  {
    id: 'melee',
    displayName: 'Luta',
    attributeKey: 'strength',
  },
] as const satisfies readonly CombatSkillDefinition[];

const TRAINED_SKILL_BONUS = 2;

export const COMBAT_ACTORS = {
  player: {
    participantId: COMBAT_FIXTURE_IDS.player,
    displayName: 'Training Vanguard',
    teamId: COMBAT_FIXTURE_IDS.playerTeam,
    sheet: {
      level: 1,
      attributes: {
        strength: 3,
        dexterity: 2,
        constitution: 2,
        intelligence: 1,
        wisdom: 1,
        charisma: 0,
      },
      life: {
        maximum: 12,
      },
      resources: [
        {
          id: 'power',
          label: 'PM',
          maximum: 6,
        },
      ],
      defense: {
        label: 'Guard',
        base: 8,
        attributeKey: 'dexterity',
      },
      skills: [
        {
          skillId: 'melee',
          trained: true,
        },
      ],
      weapons: [
        { weaponId: 'practice-blade', label: 'Training Blade', rangeBand: 'melee' },
        { weaponId: 'training-crossbow', label: 'Training Crossbow', rangeBand: 'short' },
        { weaponId: 'training-bow', label: 'Training Bow', rangeBand: 'long' },
      ],
      actions: [
        {
          actionId: COMBAT_FIXTURE_IDS.offensiveAction,
          label: 'Practice Strike',
          kind: 'main',
          weaponId: 'practice-blade',
          check: {
            skillId: 'melee',
          },
          damage: {
            base: 1,
            attributeKey: 'strength',
          },
        },
        {
          actionId: 'crossbow_strike',
          label: 'Crossbow Strike',
          kind: 'main',
          weaponId: 'training-crossbow',
          check: {
            skillId: 'melee',
          },
          damage: {
            base: 1,
            attributeKey: 'strength',
          },
        },
        {
          actionId: 'bow_strike',
          label: 'Bow Strike',
          kind: 'main',
          weaponId: 'training-bow',
          check: {
            skillId: 'melee',
          },
          damage: {
            base: 1,
            attributeKey: 'strength',
          },
        },
      ],
      abilities: [
        {
          abilityId: 'focused_drive',
          label: 'Focused Drive',
          cost: {
            resourceId: 'power',
            amount: 2,
          },
          action: {
            actionId: COMBAT_FIXTURE_IDS.offensiveAction,
            label: 'Focused Drive',
            kind: 'main',
            weaponId: 'practice-blade',
            check: {
              skillId: 'melee',
            },
            damage: {
              base: 3,
              attributeKey: 'strength',
            },
          },
        },
      ],
    },
  },
  opponent: {
    participantId: COMBAT_FIXTURE_IDS.opponent,
    displayName: 'Practice Raider',
    teamId: COMBAT_FIXTURE_IDS.opponentTeam,
    sheet: {
      level: 1,
      attributes: {
        strength: 2,
        dexterity: 3,
        constitution: 1,
        intelligence: 0,
        wisdom: 1,
        charisma: 0,
      },
      life: {
        maximum: 8,
      },
      resources: [
        {
          id: 'power',
          label: 'PM',
          maximum: 4,
        },
      ],
      defense: {
        label: 'Guard',
        base: 8,
        attributeKey: 'dexterity',
      },
      skills: [
        {
          skillId: 'melee',
          trained: true,
        },
      ],
      weapons: [{ weaponId: 'practice-crossbow', label: 'Practice Crossbow', rangeBand: 'short' }],
      actions: [
        {
          actionId: COMBAT_FIXTURE_IDS.offensiveAction,
          label: 'Training Shot',
          kind: 'main',
          weaponId: 'practice-crossbow',
          check: {
            skillId: 'melee',
          },
          damage: {
            base: 1,
            attributeKey: 'strength',
          },
        },
      ],
      abilities: [],
    },
  },
  bruisedOpponent: {
    participantId: COMBAT_FIXTURE_IDS.opponent,
    displayName: 'Bruised Raider',
    teamId: COMBAT_FIXTURE_IDS.opponentTeam,
    sheet: {
      level: 1,
      attributes: {
        strength: 1,
        dexterity: 1,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0,
      },
      life: {
        maximum: 4,
      },
      resources: [
        {
          id: 'power',
          label: 'PM',
          maximum: 2,
        },
      ],
      defense: {
        label: 'Guard',
        base: 8,
        attributeKey: 'dexterity',
      },
      skills: [
        {
          skillId: 'melee',
          trained: false,
        },
      ],
      weapons: [{ weaponId: 'worn-crossbow', label: 'Worn Crossbow', rangeBand: 'short' }],
      actions: [
        {
          actionId: COMBAT_FIXTURE_IDS.offensiveAction,
          label: 'Weak Shot',
          kind: 'main',
          weaponId: 'worn-crossbow',
          check: {
            skillId: 'melee',
          },
          damage: {
            base: 1,
            attributeKey: 'strength',
          },
        },
      ],
      abilities: [],
    },
  },
  opponentHero: {
    participantId: COMBAT_FIXTURE_IDS.opponent,
    displayName: 'Gargoyle Gladiator',
    teamId: COMBAT_FIXTURE_IDS.opponentTeam,
    sheet: {
      level: 1,
      attributes: {
        strength: 3,
        dexterity: 3,
        constitution: 2,
        intelligence: 0,
        wisdom: 1,
        charisma: 0,
      },
      life: {
        maximum: 24,
      },
      resources: [
        {
          id: 'power',
          label: 'PM',
          maximum: 4,
        },
      ],
      defense: {
        label: 'Guard',
        base: 8,
        attributeKey: 'dexterity',
      },
      skills: [
        {
          skillId: 'melee',
          trained: true,
        },
      ],
      weapons: [{ weaponId: 'gladiator-crossbow', label: 'Gladiator Crossbow', rangeBand: 'short' }],
      actions: [
        {
          actionId: COMBAT_FIXTURE_IDS.offensiveAction,
          label: 'Gladiator Shot',
          kind: 'main',
          weaponId: 'gladiator-crossbow',
          check: {
            skillId: 'melee',
          },
          damage: {
            base: 2,
            attributeKey: 'strength',
          },
        },
      ],
      abilities: [],
    },
  },
} as const satisfies Record<string, CombatActorPreset>;

export const COMBAT_PARTICIPANTS = [
  COMBAT_ACTORS.player,
  COMBAT_ACTORS.opponent,
] as const;

export const DEFAULT_COMBAT_ENCOUNTER_ID = 'training-duel';

export const COMBAT_ENCOUNTER_PRESETS = [
  {
    id: DEFAULT_COMBAT_ENCOUNTER_ID,
    label: 'Training Duel',
    description: 'Baseline 1v1 harness encounter.',
    participants: COMBAT_PARTICIPANTS,
  },
  {
    id: 'quick-check',
    label: 'Quick Check',
    description: 'Shorter 1v1 encounter for fast hit, damage, and victory checks.',
    participants: [COMBAT_ACTORS.player, COMBAT_ACTORS.bruisedOpponent],
  },
  {
    id: 'challenging-duel',
    label: 'Challenging Duel',
    description: 'Challenging 1v1 encounter for testing turn flows and multi-round combat.',
    participants: [COMBAT_ACTORS.player, COMBAT_ACTORS.opponentHero],
  },
] as const satisfies readonly CombatEncounterPreset[];

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


