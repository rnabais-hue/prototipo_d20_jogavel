/**
 * Combat visual layer depth constants.
 *
 * Pure module: no Phaser dependency. Controls rendering order for all
 * combat-mode game objects. Higher depth renders on top.
 *
 * Layer order:
 *   arenaGround < gridLines < reachableCells < activeMarker
 *     < targetMarker < combatantTokens < combatUI
 *
 * These depths are intentionally offset from exploration depths (0-100)
 * so combat objects do not interfere with exploration objects that remain
 * alive but hidden during combat mode.
 */
export const COMBAT_LAYER_DEPTHS = {
  // Stone arena ground fill - lowest combat layer.
  arenaGround: 20,
  // Grid cell boundary lines drawn over the arena.
  gridLines: 21,
  // Reachable movement cell overlays (cyan inset).
  reachableCells: 22,
  // Active-turn gold ring marker, drawn under combatant tokens.
  activeMarker: 23,
  // Hostile-target reticle, drawn under combatant tokens.
  targetMarker: 24,
  // Combatant token container (player and enemy).
  combatantTokens: 25,
  // HP bars, turn indicator, and text overlays above tokens.
  combatUI: 50,
} as const;

export type CombatLayerDepthKey = keyof typeof COMBAT_LAYER_DEPTHS;
export type CombatLayerDepth = (typeof COMBAT_LAYER_DEPTHS)[CombatLayerDepthKey];
