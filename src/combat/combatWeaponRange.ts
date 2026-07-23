export type CombatWeaponRangeBand = 'melee' | 'short' | 'long';
export type CombatWeaponRangeProfile = { band: CombatWeaponRangeBand; maximumDistance: number };
export type CombatWeaponDefinition = { id: string; label: string; rangeBand: CombatWeaponRangeBand };

const MAXIMUM_DISTANCE = { melee: 1, short: 4, long: 9 } as const satisfies Record<CombatWeaponRangeBand, number>;

export function isCombatWeaponRangeBand(value: unknown): value is CombatWeaponRangeBand {
  return value === 'melee' || value === 'short' || value === 'long';
}

export function getCombatWeaponRangeProfile(band: CombatWeaponRangeBand): CombatWeaponRangeProfile {
  return { band, maximumDistance: MAXIMUM_DISTANCE[band] };
}

export function getCombatWeaponMaximumRange(weapon: CombatWeaponDefinition): number {
  return getCombatWeaponRangeProfile(weapon.rangeBand).maximumDistance;
}
