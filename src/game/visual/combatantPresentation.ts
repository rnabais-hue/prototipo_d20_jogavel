import type { CombatWeaponRangeBand } from '../../combat/combatWeaponRange';
import { COMBAT_VISUAL_COLORS } from './combatVisualConfig';

// -- Team roles ------------------------------------------------------------

// Presentation role for a combatant.
export type CombatantVisualRole = 'player' | 'enemy';

// Map isPlayer flag to a typed visual role.
export function mapCombatantVisualRole(isPlayer: boolean): CombatantVisualRole {
  return isPlayer ? 'player' : 'enemy';
}

// -- Combatant state -------------------------------------------------------

// Active / idle / defeated visual state of a combatant token.
export type CombatantVisualState = 'active' | 'idle' | 'defeated';

// Map domain flags to a combatant visual state.
export function mapCombatantVisualState(
  active: boolean,
  defeated: boolean,
): CombatantVisualState {
  if (defeated) return 'defeated';
  if (active) return 'active';
  return 'idle';
}

// -- Team palette ----------------------------------------------------------

export type CombatTeamPalette = Readonly<{
  fill: number;
  rim: number;
  shadow: number;
  emblem: number;
}>;

// Return the team palette for a given visual role.
export function getCombatTeamPalette(role: CombatantVisualRole): CombatTeamPalette {
  if (role === 'player') {
    return {
      fill: COMBAT_VISUAL_COLORS.playerFill,
      rim: COMBAT_VISUAL_COLORS.playerRim,
      shadow: COMBAT_VISUAL_COLORS.playerShadow,
      emblem: COMBAT_VISUAL_COLORS.playerEmblem,
    };
  }
  return {
    fill: COMBAT_VISUAL_COLORS.enemyFill,
    rim: COMBAT_VISUAL_COLORS.enemyRim,
    shadow: COMBAT_VISUAL_COLORS.enemyShadow,
    emblem: COMBAT_VISUAL_COLORS.enemyEmblem,
  };
}

// -- Range band presentation -----------------------------------------------

export type RangeBandPresentation = Readonly<{
  band: CombatWeaponRangeBand;
  // Display label shown in menus.
  label: string;
  // Primary color for the range indicator.
  color: number;
  // Compact description of the range treatment.
  description: string;
}>;

// Map a weapon range band to its presentation config.
export function mapRangeBandPresentation(band: CombatWeaponRangeBand): RangeBandPresentation {
  switch (band) {
    case 'melee':
      return {
        band,
        label: 'Melee',
        color: COMBAT_VISUAL_COLORS.meleeRange,
        description: 'Adjacent cell',
      };
    case 'short':
      return {
        band,
        label: 'Short',
        color: COMBAT_VISUAL_COLORS.shortRange,
        description: 'Medium range',
      };
    case 'long':
      return {
        band,
        label: 'Long',
        color: COMBAT_VISUAL_COLORS.longRange,
        description: 'Extended range',
      };
  }
}

// -- Availability presentation ---------------------------------------------

export type AvailabilityPresentation = 'ready' | 'blocked';

// Map a boolean availability flag to a typed presentation state.
export function mapAvailabilityPresentation(available: boolean): AvailabilityPresentation {
  return available ? 'ready' : 'blocked';
}

// Return the display color for an availability state.
export function getAvailabilityColor(availability: AvailabilityPresentation): number {
  return availability === 'ready'
    ? COMBAT_VISUAL_COLORS.readyColor
    : COMBAT_VISUAL_COLORS.blockedColor;
}

// Return the display text label for an availability state.
export function getAvailabilityLabel(availability: AvailabilityPresentation): string {
  return availability === 'ready' ? 'READY' : 'BLOCKED';
}
