import type { CombatWeaponRangeBand } from '../../combat/combatWeaponRange';
import { COMBAT_VISUAL_COLORS } from './combatVisualConfig';

export type RangeBandConfig = Readonly<{
  band: CombatWeaponRangeBand;
  // Short display label (used in menus).
  label: string;
  // Primary indicator color when READY.
  readyColor: number;
  // Indicator color when BLOCKED.
  blockedColor: number;
  // Descriptive hint for the visual treatment.
  hint: string;
  // Relative line/border weight hint: 'heavy' | 'medium' | 'light'.
  weight: 'heavy' | 'medium' | 'light';
}>;

const RANGE_BAND_CONFIGS: Record<CombatWeaponRangeBand, RangeBandConfig> = {
  melee: {
    band: 'melee',
    label: 'Melee',
    readyColor: COMBAT_VISUAL_COLORS.meleeRange,
    blockedColor: COMBAT_VISUAL_COLORS.blockedColor,
    hint: 'Compact adjacent-cell edge',
    weight: 'heavy',
  },
  short: {
    band: 'short',
    label: 'Short',
    readyColor: COMBAT_VISUAL_COLORS.shortRange,
    blockedColor: COMBAT_VISUAL_COLORS.blockedColor,
    hint: 'Medium dashed ring',
    weight: 'medium',
  },
  long: {
    band: 'long',
    label: 'Long',
    readyColor: COMBAT_VISUAL_COLORS.longRange,
    blockedColor: COMBAT_VISUAL_COLORS.blockedColor,
    hint: 'Thin extended endpoint cue',
    weight: 'light',
  },
};

// Return the presentation config for a weapon range band.
export function getRangeBandConfig(band: CombatWeaponRangeBand): RangeBandConfig {
  return RANGE_BAND_CONFIGS[band];
}

// Return all range band configs in melee -> short -> long order.
export function getAllRangeBandConfigs(): readonly RangeBandConfig[] {
  return [
    RANGE_BAND_CONFIGS.melee,
    RANGE_BAND_CONFIGS.short,
    RANGE_BAND_CONFIGS.long,
  ];
}
