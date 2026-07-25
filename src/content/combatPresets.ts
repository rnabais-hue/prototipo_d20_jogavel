import { COMBAT_FIXTURE_IDS } from '../rules/combatFixtures';
import { validateContentPack } from '../rules/combatPackValidation';
import { mvpTacticalCatalogs } from './tacticalCatalogs';

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

// Content identifiers are open `string` values, enumerated by the content pack
// and checked at load time, not closed literal unions in the engine. See
// decision 0048 and `src/content/CONTEXT.md`.
export type CombatAttributeKey = string;

export type CombatAttributeSet = Record<string, number>;

export type CombatSkillId = string;

// The attribute keys this pack declares as valid, as data rather than a type.
// Load-time validation (see `src/rules/combatPackValidation.ts`) checks every
// referenced attribute key against this set.
export const COMBAT_ATTRIBUTE_KEYS = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
] as const satisfies readonly string[];

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

export type CombatWeaponPreset = { weaponId: string; label: string; rangeBand: string };

export type CombatAbilityPreset = {
  abilityId: string;
  label: string;
  cost: {
    resourceId: string;
    amount: number;
  };
  action: CombatActionPreset;
};

export const COMBAT_SKILL_DEFINITIONS = [
  {
    id: 'melee',
    displayName: 'Luta',
    attributeKey: 'strength',
  },
] as const satisfies readonly CombatSkillDefinition[];

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

// The single load-time gate for the unified content pack. It validates both the
// combat preset data and the retained tactical catalog structure against one
// declared attribute-key set (`COMBAT_ATTRIBUTE_KEYS`), so a dangling or
// duplicated id in either half fails loudly and legibly here instead of
// surfacing later as a silent NaN or undefined. The dependency between the two
// content files is one-directional (this module reads the catalogs; the catalog
// module never reads back), so the eager gate has no import cycle to trip on.
// Validation is a pure read model; this call site acts on its structured result.
const CONTENT_PACK_VALIDATION = validateContentPack({
  combat: {
    attributeKeys: COMBAT_ATTRIBUTE_KEYS,
    skills: COMBAT_SKILL_DEFINITIONS,
    actors: Object.values(COMBAT_ACTORS),
  },
  catalogs: {
    attributeKeys: COMBAT_ATTRIBUTE_KEYS,
    ...mvpTacticalCatalogs,
  },
});

if (!CONTENT_PACK_VALIDATION.ok) {
  throw new Error(
    `Invalid content pack: ${CONTENT_PACK_VALIDATION.issues
      .map((issue) => `[${issue.code}] ${issue.reason}`)
      .join('; ')}`,
  );
}
