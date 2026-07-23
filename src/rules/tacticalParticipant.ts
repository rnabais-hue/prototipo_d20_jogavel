export type AttributeKey = 'force' | 'agility' | 'mind' | 'presence';

export type AttributeSet = Record<AttributeKey, number>;

export type AttributeModifiers = Partial<AttributeSet>;

export type FeatureDefinition = {
  id: string;
  name: string;
  tags?: readonly string[];
};

export type ActionDefinition = {
  id: string;
  name: string;
  kind: 'offensive' | 'utility' | 'reserved';
  tags?: readonly string[];
};

export type EquipmentDefinition = {
  id: string;
  name: string;
  slot: 'main_hand' | 'off_hand' | 'body' | 'carried';
  grantedActionIds?: readonly string[];
  attributeModifiers?: AttributeModifiers;
  tags?: readonly string[];
};

export type AncestryDefinition = {
  id: string;
  name: string;
  attributeModifiers?: AttributeModifiers;
  grantedFeatureIds?: readonly string[];
  grantedActionIds?: readonly string[];
  tags?: readonly string[];
};

export type ArchetypeDefinition = {
  id: string;
  name: string;
  attributeModifiers?: AttributeModifiers;
  grantedFeatureIds?: readonly string[];
  grantedActionIds?: readonly string[];
  startingEquipmentIds?: readonly string[];
  tags?: readonly string[];
};

export type AttributePresetDefinition = {
  id: string;
  name: string;
  attributes: AttributeSet;
};

export type TacticalCatalogs = {
  ancestries: readonly AncestryDefinition[];
  archetypes: readonly ArchetypeDefinition[];
  attributePresets: readonly AttributePresetDefinition[];
  features: readonly FeatureDefinition[];
  equipment: readonly EquipmentDefinition[];
  actions: readonly ActionDefinition[];
};

export type ParticipantBuildInput = {
  id: string;
  name: string;
  ancestryId: string;
  archetypeId: string;
  attributePresetId: string;
  equipmentIds?: readonly string[];
  featureIds?: readonly string[];
  actionIds?: readonly string[];
  status?: 'ready' | 'reserved';
};

export type TacticalParticipant = {
  id: string;
  name: string;
  ancestryId: string;
  archetypeId: string;
  attributePresetId: string;
  attributes: AttributeSet;
  featureIds: readonly string[];
  actionIds: readonly string[];
  equipmentIds: readonly string[];
  status: 'ready' | 'reserved';
};

export type ParticipantBuildError = {
  code: 'missing_catalog_entry';
  catalog: keyof TacticalCatalogs;
  id: string;
};

export type ParticipantBuildResult =
  | {
      ok: true;
      participant: TacticalParticipant;
    }
  | {
      ok: false;
      error: ParticipantBuildError;
    };

export function buildTacticalParticipant(
  catalogs: TacticalCatalogs,
  input: ParticipantBuildInput,
): ParticipantBuildResult {
  const ancestry = findById(catalogs.ancestries, input.ancestryId);
  if (!ancestry) {
    return missingEntry('ancestries', input.ancestryId);
  }

  const archetype = findById(catalogs.archetypes, input.archetypeId);
  if (!archetype) {
    return missingEntry('archetypes', input.archetypeId);
  }

  const attributePreset = findById(catalogs.attributePresets, input.attributePresetId);
  if (!attributePreset) {
    return missingEntry('attributePresets', input.attributePresetId);
  }

  const equipmentIds = uniqueIds([
    ...(archetype.startingEquipmentIds ?? []),
    ...(input.equipmentIds ?? []),
  ]);
  const equipment = [];
  for (const equipmentId of equipmentIds) {
    const definition = findById(catalogs.equipment, equipmentId);
    if (!definition) {
      return missingEntry('equipment', equipmentId);
    }
    equipment.push(definition);
  }

  const featureIds = uniqueIds([
    ...(ancestry.grantedFeatureIds ?? []),
    ...(archetype.grantedFeatureIds ?? []),
    ...(input.featureIds ?? []),
  ]);
  for (const featureId of featureIds) {
    if (!findById(catalogs.features, featureId)) {
      return missingEntry('features', featureId);
    }
  }

  const actionIds = uniqueIds([
    ...(ancestry.grantedActionIds ?? []),
    ...(archetype.grantedActionIds ?? []),
    ...equipment.flatMap((definition) => definition.grantedActionIds ?? []),
    ...(input.actionIds ?? []),
  ]);
  for (const actionId of actionIds) {
    if (!findById(catalogs.actions, actionId)) {
      return missingEntry('actions', actionId);
    }
  }

  return {
    ok: true,
    participant: {
      id: input.id,
      name: input.name,
      ancestryId: ancestry.id,
      archetypeId: archetype.id,
      attributePresetId: attributePreset.id,
      attributes: applyAttributeModifiers(attributePreset.attributes, [
        ancestry.attributeModifiers,
        archetype.attributeModifiers,
        ...equipment.map((definition) => definition.attributeModifiers),
      ]),
      featureIds,
      actionIds,
      equipmentIds,
      status: input.status ?? 'ready',
    },
  };
}

function applyAttributeModifiers(
  base: AttributeSet,
  modifiers: readonly (AttributeModifiers | undefined)[],
): AttributeSet {
  const attributes: AttributeSet = { ...base };

  for (const modifierSet of modifiers) {
    if (!modifierSet) {
      continue;
    }

    for (const key of Object.keys(modifierSet) as AttributeKey[]) {
      attributes[key] += modifierSet[key] ?? 0;
    }
  }

  return attributes;
}

function findById<T extends { id: string }>(
  entries: readonly T[],
  id: string,
): T | undefined {
  return entries.find((entry) => entry.id === id);
}

function uniqueIds(ids: readonly string[]): readonly string[] {
  return [...new Set(ids)];
}

function missingEntry(
  catalog: keyof TacticalCatalogs,
  id: string,
): ParticipantBuildResult {
  return {
    ok: false,
    error: {
      code: 'missing_catalog_entry',
      catalog,
      id,
    },
  };
}
