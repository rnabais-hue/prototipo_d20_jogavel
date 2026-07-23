export type DebugCombatInteractionMode = 'main' | 'attacks' | 'abilities';

export function debugCombatModeAllowsMovement(mode: DebugCombatInteractionMode): boolean {
  return mode === 'main';
}

export function returnToDebugCombatMainMode(mode: DebugCombatInteractionMode): DebugCombatInteractionMode {
  return mode === 'main' ? mode : 'main';
}
