import { describe, expect, it } from 'vitest';
import { mvpTacticalCatalogs } from '../content/tacticalCatalogs';
import {
  buildTacticalParticipant,
  type TacticalCatalogs,
} from './tacticalParticipant';

describe('buildTacticalParticipant', () => {
  it('builds the MVP participant from catalog data', () => {
    const result = buildTacticalParticipant(mvpTacticalCatalogs, {
      id: 'participant-1',
      name: 'MVP Participant',
      ancestryId: 'baseline_origin',
      archetypeId: 'martial_vanguard',
      attributePresetId: 'balanced_start',
    });

    expect(result).toEqual({
      ok: true,
      participant: {
        id: 'participant-1',
        name: 'MVP Participant',
        ancestryId: 'baseline_origin',
        archetypeId: 'martial_vanguard',
        attributePresetId: 'balanced_start',
        attributes: {
          strength: 4,
          dexterity: 2,
          constitution: 0,
          intelligence: 1,
          wisdom: 0,
          charisma: 1,
        },
        featureIds: ['steady_focus', 'trained_guard'],
        actionIds: ['basic_strike'],
        equipmentIds: ['starter_blade', 'plain_guard'],
        status: 'ready',
      },
    });
  });

  it('uses modifiers supplied by ancestry, archetype, and equipment data', () => {
    const result = buildTacticalParticipant(mvpTacticalCatalogs, {
      id: 'participant-1',
      name: 'MVP Participant',
      ancestryId: 'baseline_origin',
      archetypeId: 'martial_vanguard',
      attributePresetId: 'balanced_start',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.participant.attributes).toEqual({
      strength: 4,
      dexterity: 2,
      constitution: 0,
      intelligence: 1,
      wisdom: 0,
      charisma: 1,
    });
  });

  it('aggregates features, equipment, and actions granted by data', () => {
    const catalogs: TacticalCatalogs = {
      ...mvpTacticalCatalogs,
      features: [
        ...mvpTacticalCatalogs.features,
        {
          id: 'field_reader',
          name: 'Field Reader',
        },
      ],
      actions: [
        ...mvpTacticalCatalogs.actions,
        {
          id: 'brace',
          name: 'Brace',
          kind: 'utility',
        },
      ],
    };

    const result = buildTacticalParticipant(catalogs, {
      id: 'participant-1',
      name: 'MVP Participant',
      ancestryId: 'baseline_origin',
      archetypeId: 'martial_vanguard',
      attributePresetId: 'balanced_start',
      featureIds: ['field_reader'],
      actionIds: ['brace'],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.participant.featureIds).toEqual([
      'steady_focus',
      'trained_guard',
      'field_reader',
    ]);
    expect(result.participant.equipmentIds).toEqual(['starter_blade', 'plain_guard']);
    expect(result.participant.actionIds).toEqual(['basic_strike', 'brace']);
  });

  it('returns a structured error when a required id is missing', () => {
    const result = buildTacticalParticipant(mvpTacticalCatalogs, {
      id: 'participant-1',
      name: 'MVP Participant',
      ancestryId: 'missing_origin',
      archetypeId: 'martial_vanguard',
      attributePresetId: 'balanced_start',
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: 'missing_catalog_entry',
        catalog: 'ancestries',
        id: 'missing_origin',
      },
    });
  });

  it('builds from alternate catalog data without depending on MVP ids', () => {
    const alternateCatalogs: TacticalCatalogs = {
      ancestries: [
        {
          id: 'wind_origin',
          name: 'Wind Origin',
          attributeModifiers: {
            dexterity: 3,
          },
          grantedFeatureIds: ['quick_step'],
        },
      ],
      archetypes: [
        {
          id: 'signal_keeper',
          name: 'Signal Keeper',
          attributeModifiers: {
            intelligence: 2,
          },
          grantedActionIds: ['mark_target'],
          startingEquipmentIds: ['signal_staff'],
        },
      ],
      attributePresets: [
        {
          id: 'sharp_start',
          name: 'Sharp Start',
          attributes: {
            strength: 0,
            dexterity: 1,
            constitution: 0,
            intelligence: 2,
            wisdom: 0,
            charisma: 1,
          },
        },
      ],
      features: [
        {
          id: 'quick_step',
          name: 'Quick Step',
        },
      ],
      equipment: [
        {
          id: 'signal_staff',
          name: 'Signal Staff',
          slot: 'main_hand',
          attributeModifiers: {
            charisma: 1,
          },
          grantedActionIds: ['steady_signal'],
        },
      ],
      actions: [
        {
          id: 'mark_target',
          name: 'Mark Target',
          kind: 'utility',
        },
        {
          id: 'steady_signal',
          name: 'Steady Signal',
          kind: 'utility',
        },
      ],
    };

    const result = buildTacticalParticipant(alternateCatalogs, {
      id: 'alternate-1',
      name: 'Alternate Participant',
      ancestryId: 'wind_origin',
      archetypeId: 'signal_keeper',
      attributePresetId: 'sharp_start',
    });

    expect(result).toEqual({
      ok: true,
      participant: {
        id: 'alternate-1',
        name: 'Alternate Participant',
        ancestryId: 'wind_origin',
        archetypeId: 'signal_keeper',
        attributePresetId: 'sharp_start',
        attributes: {
          strength: 0,
          dexterity: 4,
          constitution: 0,
          intelligence: 4,
          wisdom: 0,
          charisma: 2,
        },
        featureIds: ['quick_step'],
        actionIds: ['mark_target', 'steady_signal'],
        equipmentIds: ['signal_staff'],
        status: 'ready',
      },
    });
  });
});
