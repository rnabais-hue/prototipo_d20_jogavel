/**
 * Combat visual presentation configuration.
 *
 * Pure module: no Phaser dependency. Defines the combat palette, arena
 * treatment, team accent colors, overlay colors, and range-band roles used
 * throughout the combat visual pass.
 *
 * Palette origin: PLAYABLE_PRESENTATION_DESIGN_CUT_V0.md Section 4 combat roles.
 */

// Numeric hex color constants for all combat visual roles.
export const COMBAT_VISUAL_COLORS = {
  // -- Arena and grid -------------------------------------------------
  // Main arena background fill - dark navy stone floor.
  arenaDark: 0x161e2a,
  // Subtle alternating cell accent for stone floor tiling.
  arenaStoneAccent: 0x1c2535,
  // Stone mortar / border accent on the arena perimeter.
  arenaBorder: 0x2e3d52,
  // Grid line color - low-contrast stone gray.
  gridLine: 0x5c6470,
  // Grid line alpha (0-1).
  gridAlpha: 0.6,

  // -- Team accents ---------------------------------------------------
  // Player team primary fill - adventurous green.
  playerFill: 0x65c98c,
  // Player team light rim highlight.
  playerRim: 0xb4f0cd,
  // Player team dark inner shadow.
  playerShadow: 0x2e6644,
  // Player ivory emblem / glyph.
  playerEmblem: 0xf4f0e8,

  // Enemy team primary fill - danger coral.
  enemyFill: 0xe85d5d,
  // Enemy team light rim highlight.
  enemyRim: 0xffc1b9,
  // Enemy team dark inner shadow.
  enemyShadow: 0x6e2020,
  // Enemy bone emblem / glyph.
  enemyEmblem: 0xf0ece8,

  // -- State accents --------------------------------------------------
  // Active combatant outer gold ring.
  activeGold: 0xffd166,
  // Hostile target reticle primary - coral.
  targetCoral: 0xe85d5d,
  // Hostile target reticle accent - gold.
  targetGold: 0xffd166,

  // -- Overlays -------------------------------------------------------
  // Reachable movement cell fill.
  reachableFill: 0x4fb3d9,
  // Reachable movement cell stroke.
  reachableStroke: 0x6ed8ff,

  // -- Range bands ----------------------------------------------------
  // Melee range indicator - amber warm.
  meleeRange: 0xf2c14e,
  // Short range indicator - violet.
  shortRange: 0xb983ff,
  // Long range indicator - steel blue.
  longRange: 0x6aadcc,

  // -- Availability ---------------------------------------------------
  // READY indicator - mint green text.
  readyColor: 0x75e6a4,
  // BLOCKED indicator - disabled gray.
  blockedColor: 0x7b8491,

  // -- Defeat state ---------------------------------------------------
  // Defeated combatant tint overlay.
  defeatedOverlay: 0x4c5968,
} as const;

// Arena visual configuration values.
export const COMBAT_ARENA_CONFIG = {
  // Border thickness around the arena perimeter.
  borderThickness: 2,
  // Corner radius for the arena ground fill (0 = sharp).
  cornerRadius: 0,
  // Alpha for the alternating stone accent cells.
  stoneAccentAlpha: 0.28,
  // Alpha for the grid lines over the stone floor.
  gridLineAlpha: 0.6,
} as const;

// Combatant token visual configuration values.
export const COMBAT_TOKEN_CONFIG = {
  // Token radius as a fraction of cell size (0.8 / 2 = 0.4).
  radiusRatio: 0.35,
  // Inner emblem radius as fraction of cell size.
  emblemRatio: 0.18,
  // Outer ring radius offset beyond the main circle for the active marker.
  activeRingOffset: 6,
  // Active ring stroke thickness.
  activeRingThickness: 3,
  // Target reticle outer radius offset beyond cell half-size.
  reticleOuterRatio: 0.46,
  // Target reticle arm length as fraction of cell size.
  reticleArmRatio: 0.14,
  // Target reticle line thickness.
  reticleThickness: 2,
  // Alpha for the drop shadow under combatant tokens.
  shadowAlpha: 0.35,
} as const;

// Reachable-cell overlay visual configuration.
export const COMBAT_REACHABLE_CONFIG = {
  // Inset from cell edge to start the reachable indicator (px).
  insetRatio: 0.14,
  // Fill alpha.
  fillAlpha: 0.18,
  // Stroke alpha.
  strokeAlpha: 0.55,
  // Stroke thickness.
  strokeThickness: 1,
} as const;
