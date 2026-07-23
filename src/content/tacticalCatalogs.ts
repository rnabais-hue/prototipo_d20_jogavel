import type { TacticalCatalogs } from '../rules/tacticalParticipant';

export const mvpTacticalCatalogs: TacticalCatalogs = {
  ancestries: [
    {
      id: 'baseline_origin',
      name: 'Baseline Origin',
      attributeModifiers: {
        presence: 1,
      },
      grantedFeatureIds: ['steady_focus'],
      tags: ['origin'],
    },
  ],
  archetypes: [
    {
      id: 'martial_vanguard',
      name: 'Martial Vanguard',
      attributeModifiers: {
        force: 2,
      },
      grantedFeatureIds: ['trained_guard'],
      startingEquipmentIds: ['starter_blade', 'plain_guard'],
      tags: ['martial'],
    },
  ],
  attributePresets: [
    {
      id: 'balanced_start',
      name: 'Balanced Start',
      attributes: {
        force: 2,
        agility: 1,
        mind: 1,
        presence: 0,
      },
    },
  ],
  features: [
    {
      id: 'steady_focus',
      name: 'Steady Focus',
      tags: ['passive'],
    },
    {
      id: 'trained_guard',
      name: 'Trained Guard',
      tags: ['training'],
    },
  ],
  equipment: [
    {
      id: 'starter_blade',
      name: 'Starter Blade',
      slot: 'main_hand',
      grantedActionIds: ['basic_strike'],
      tags: ['weapon'],
    },
    {
      id: 'plain_guard',
      name: 'Plain Guard',
      slot: 'off_hand',
      attributeModifiers: {
        agility: 1,
      },
      tags: ['defense'],
    },
  ],
  actions: [
    {
      id: 'basic_strike',
      name: 'Basic Strike',
      kind: 'offensive',
      tags: ['weapon_action'],
    },
    {
      id: 'crossbow_strike',
      name: 'Training Crossbow Strike',
      kind: 'offensive',
      tags: ['weapon_action'],
    },
    {
      id: 'bow_strike',
      name: 'Training Bow Strike',
      kind: 'offensive',
      tags: ['weapon_action'],
    },
  ],
};

