/**
 * Motion configuration and duration mappings.
 * Pure presentation helper module.
 */
import type { GridCell } from '../../movement/grid';

export const MOTION_DURATIONS = {
  selection: 100,
  anticipation: 100,
  lunge: 150,
  hitReaction: 150,
  missEvade: 150,
  combatMove: 120,
  recovery: 140,
  defeat: 480,
} as const;

export type MotionDurationKey = keyof typeof MOTION_DURATIONS;

let reducedMotion = false;

/**
 * Enable or disable reduced-motion mode globally.
 */
export function setReducedMotion(enabled: boolean): void {
  reducedMotion = enabled;
}

/**
 * Check if reduced-motion mode is active.
 */
export function isReducedMotion(): boolean {
  return reducedMotion;
}

/**
 * Get the transition/animation duration in milliseconds for the given action key.
 */
export function getMotionDuration(key: MotionDurationKey): number {
  if (reducedMotion) {
    return 0;
  }
  return MOTION_DURATIONS[key];
}

export function getCombatMoveDuration(
  from: GridCell,
  to: GridCell,
): number {
  const distance = Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
  return distance * getMotionDuration('combatMove');
}
